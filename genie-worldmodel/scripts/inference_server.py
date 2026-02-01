"""
WebSocket inference server that runs the trained Genie world model
and streams generated frames back to the browser for real-time
interactive world generation.

Usage:
    python genie-worldmodel/scripts/inference_server.py \
        --config configs/sandlot_sluggers_inference.yaml

The browser client sends action IDs and receives generated frame PNGs.
Protocol:
    Client -> Server: JSON {"action": <int>}
    Server -> Client: binary PNG frame data
"""

import asyncio
import argparse
import io
import json
import os
import sys

import numpy as np
import torch
from PIL import Image

# Add parent dir to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.config import InferenceConfig, load_config
from utils.utils import find_latest_checkpoint
from utils.inference_utils import load_models

try:
    import websockets
except ImportError:
    print("Install websockets: pip install websockets")
    raise


class GenieInferenceSession:
    """Manages one interactive session with the Genie world model."""

    def __init__(self, video_tokenizer, latent_action_model, dynamics_model, device: str, context_window: int = 4, temperature: float = 0.5, prediction_horizon: int = 1, amp: bool = True):
        self.vt = video_tokenizer
        self.lam = latent_action_model
        self.dynamics = dynamics_model
        self.device = device
        self.context_window = context_window
        self.temperature = temperature
        self.prediction_horizon = prediction_horizon
        self.amp = amp
        self.generated_frames: torch.Tensor | None = None

    def set_initial_context(self, frames: torch.Tensor) -> None:
        """Set initial context frames [1, T, C, H, W] normalized to [-1, 1]."""
        self.generated_frames = frames.to(self.device)

    def step(self, action_id: int) -> np.ndarray:
        """Generate next frame given an action. Returns RGB uint8 HxWx3 array."""
        if self.generated_frames is None:
            raise RuntimeError("Call set_initial_context first")

        context = self.generated_frames[:, -self.context_window:, :, :, :]

        # Encode context
        video_indices = self.vt.tokenize(context)
        video_latents = self.vt.quantizer.get_latents_from_indices(video_indices)

        # Create action conditioning
        n_actions = self.lam.quantizer.codebook_size if self.lam is not None else 1
        action_id = action_id % n_actions
        action_latent = None
        if self.lam is not None:
            action_latent = self.lam.quantizer.get_latents_from_indices(
                torch.tensor([[[action_id]]], device=self.device)
            )

        def idx_to_latents(idx):
            return self.vt.quantizer.get_latents_from_indices(idx, dim=-1)

        autocast_dtype = torch.bfloat16 if self.amp else None
        with torch.amp.autocast('cuda', enabled=self.amp, dtype=autocast_dtype):
            next_latents = self.dynamics.forward_inference(
                context_latents=video_latents,
                prediction_horizon=self.prediction_horizon,
                num_steps=10,
                index_to_latents_fn=idx_to_latents,
                conditioning=action_latent,
                temperature=self.temperature,
            )

        next_frames = self.vt.detokenize(next_latents)
        self.generated_frames = torch.cat(
            [self.generated_frames, next_frames[:, -self.prediction_horizon:]], dim=1
        )

        # Convert last frame to uint8 RGB
        frame = next_frames[0, -1].clamp(-1, 1).cpu().float()
        frame = ((frame + 1) * 127.5).byte().permute(1, 2, 0).numpy()
        return frame


def frame_to_png_bytes(frame: np.ndarray) -> bytes:
    img = Image.fromarray(frame)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


async def handle_client(websocket, session: GenieInferenceSession) -> None:
    print(f"Client connected: {websocket.remote_address}")
    try:
        async for message in websocket:
            data = json.loads(message)
            action_id = int(data.get("action", 0))
            frame = session.step(action_id)
            png_bytes = frame_to_png_bytes(frame)
            await websocket.send(png_bytes)
    except Exception as e:
        print(f"Session error: {e}")
    finally:
        print("Client disconnected")


def main() -> None:
    parser = argparse.ArgumentParser(description="Genie inference server for Sandlot Sluggers")
    parser.add_argument("--config", type=str, default="configs/sandlot_sluggers_inference.yaml")
    parser.add_argument("--port", type=int, default=8766)
    parser.add_argument("--host", type=str, default="localhost")
    args_cli = parser.parse_args()

    # Monkey-patch sys.argv so load_config sees --config
    sys.argv = ["inference_server.py", "--config", args_cli.config]
    config: InferenceConfig = load_config(InferenceConfig)

    if config.tf32:
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True

    # Resolve checkpoints
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    if config.use_latest_checkpoints or not config.video_tokenizer_path:
        config.video_tokenizer_path = find_latest_checkpoint(base_dir, "video_tokenizer")
    if config.use_latest_checkpoints or not config.latent_actions_path:
        config.latent_actions_path = find_latest_checkpoint(base_dir, "latent_actions")
    if config.use_latest_checkpoints or not config.dynamics_path:
        config.dynamics_path = find_latest_checkpoint(base_dir, "dynamics")

    print(f"Loading models...")
    vt, lam, dynamics = load_models(
        config.video_tokenizer_path, config.latent_actions_path,
        config.dynamics_path, config.device, use_actions=True
    )

    if config.compile:
        vt = torch.compile(vt, mode="reduce-overhead", fullgraph=False, dynamic=True)
        lam = torch.compile(lam, mode="reduce-overhead", fullgraph=False, dynamic=True)
        dynamics = torch.compile(dynamics, mode="reduce-overhead", fullgraph=False, dynamic=True)

    session = GenieInferenceSession(
        vt, lam, dynamics, config.device,
        context_window=config.context_window,
        temperature=config.temperature,
        prediction_horizon=config.prediction_horizon,
        amp=config.amp,
    )

    # Load initial context from dataset
    from datasets.data_utils import load_data_and_data_loaders
    _, _, loader, _, _ = load_data_and_data_loaders(
        dataset=config.dataset, batch_size=1, num_frames=config.context_window
    )
    initial_frames = next(iter(loader))[0].to(config.device)
    session.set_initial_context(initial_frames)

    print(f"Inference server on ws://{args_cli.host}:{args_cli.port}")
    print(f"Send JSON {{\"action\": <0-{lam.quantizer.codebook_size - 1 if lam else 0}>}} to generate frames")

    async def serve() -> None:
        async with websockets.serve(
            lambda ws: handle_client(ws, session),
            args_cli.host, args_cli.port
        ):
            await asyncio.Future()

    asyncio.run(serve())


if __name__ == "__main__":
    main()
