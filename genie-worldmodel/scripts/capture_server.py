"""
WebSocket server that receives gameplay frames from the browser-based
FrameCapture system and writes them to an MP4 file for training.

Usage:
    python genie-worldmodel/scripts/capture_server.py --output data/sandlot_sluggers.mp4

The browser client connects via:
    capture.streamToServer('ws://localhost:8765')
"""

import asyncio
import argparse
import io
import os
import cv2
import numpy as np
from PIL import Image

try:
    import websockets
except ImportError:
    print("Install websockets: pip install websockets")
    raise


class FrameWriter:
    """Accumulates JPEG frames from WebSocket and writes MP4."""

    def __init__(self, output_path: str, fps: int = 30, resolution: tuple = (128, 128)):
        self.output_path = output_path
        self.fps = fps
        self.resolution = resolution
        self.writer = None
        self.frame_count = 0

    def add_frame(self, jpeg_bytes: bytes) -> None:
        img = Image.open(io.BytesIO(jpeg_bytes)).convert("RGB")
        img = img.resize(self.resolution, Image.LANCZOS)
        frame = np.array(img)
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        if self.writer is None:
            h, w = frame_bgr.shape[:2]
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            os.makedirs(os.path.dirname(self.output_path) or ".", exist_ok=True)
            self.writer = cv2.VideoWriter(self.output_path, fourcc, self.fps, (w, h))

        self.writer.write(frame_bgr)
        self.frame_count += 1

        if self.frame_count % 100 == 0:
            print(f"  Captured {self.frame_count} frames")

    def finalize(self) -> None:
        if self.writer is not None:
            self.writer.release()
            duration = self.frame_count / self.fps
            size_mb = os.path.getsize(self.output_path) / (1024 * 1024)
            print(f"Saved {self.output_path}: {self.frame_count} frames, {duration:.1f}s, {size_mb:.1f} MB")


async def handler(websocket, writer: FrameWriter) -> None:
    print(f"Client connected from {websocket.remote_address}")
    try:
        async for message in websocket:
            if isinstance(message, bytes):
                writer.add_frame(message)
    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        print(f"Client disconnected. Total frames: {writer.frame_count}")


async def main() -> None:
    parser = argparse.ArgumentParser(description="Capture server for Sandlot Sluggers gameplay frames")
    parser.add_argument("--output", type=str, default="data/sandlot_sluggers.mp4")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--host", type=str, default="localhost")
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--resolution", type=int, nargs=2, default=[128, 128])
    args = parser.parse_args()

    writer = FrameWriter(args.output, fps=args.fps, resolution=tuple(args.resolution))

    print(f"Capture server listening on ws://{args.host}:{args.port}")
    print(f"Output: {args.output} @ {args.fps}fps {args.resolution[0]}x{args.resolution[1]}")

    async with websockets.serve(lambda ws: handler(ws, writer), args.host, args.port):
        try:
            await asyncio.Future()  # run forever
        except asyncio.CancelledError:
            pass
        finally:
            writer.finalize()


if __name__ == "__main__":
    asyncio.run(main())
