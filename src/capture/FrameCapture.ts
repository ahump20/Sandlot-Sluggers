/**
 * FrameCapture - Records Babylon.js canvas frames for Genie world model training.
 *
 * Captures gameplay at a configurable FPS, stores frames in memory, and
 * exports them as a downloadable MP4 (via MediaRecorder) or as individual
 * PNGs zipped together. The resulting video can be fed directly into the
 * genie-worldmodel training pipeline as the SANDLOT_SLUGGERS dataset.
 *
 * Usage:
 *   const capture = new FrameCapture(engine.getRenderingCanvas()!, { fps: 30 });
 *   capture.start();
 *   // ... gameplay happens ...
 *   capture.stop();
 *   await capture.exportMP4();  // triggers browser download
 */

export interface FrameCaptureOptions {
  /** Target capture FPS (default 30) */
  fps: number;
  /** Max recording duration in seconds (default 300 = 5 min) */
  maxDurationSeconds: number;
  /** Resolution to capture at. Null means use canvas native size. */
  resolution: { width: number; height: number } | null;
  /** Video bitrate for MediaRecorder (default 5Mbps) */
  videoBitrate: number;
}

const DEFAULT_OPTIONS: FrameCaptureOptions = {
  fps: 30,
  maxDurationSeconds: 300,
  resolution: null,
  videoBitrate: 5_000_000,
};

export class FrameCapture {
  private canvas: HTMLCanvasElement;
  private options: FrameCaptureOptions;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private isRecording: boolean = false;
  private frameCount: number = 0;
  private startTime: number = 0;

  constructor(canvas: HTMLCanvasElement, options?: Partial<FrameCaptureOptions>) {
    this.canvas = canvas;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Start recording frames from the canvas.
   */
  public start(): void {
    if (this.isRecording) return;

    this.chunks = [];
    this.frameCount = 0;
    this.startTime = performance.now();
    this.isRecording = true;

    const stream = this.canvas.captureStream(this.options.fps);
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: this._getSupportedMimeType(),
      videoBitsPerSecond: this.options.videoBitrate,
    });

    this.mediaRecorder.ondataavailable = (event: BlobEvent): void => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
        this.frameCount++;
      }
    };

    this.mediaRecorder.onstop = (): void => {
      this.isRecording = false;
    };

    // Request data every 100ms for fine-grained chunks
    this.mediaRecorder.start(100);

    // Auto-stop after max duration
    const maxMs = this.options.maxDurationSeconds * 1000;
    setTimeout(() => {
      if (this.isRecording) {
        this.stop();
      }
    }, maxMs);

    console.log(`[FrameCapture] Recording started at ${this.options.fps} fps`);
  }

  /**
   * Stop recording.
   */
  public stop(): void {
    if (!this.isRecording || !this.mediaRecorder) return;
    this.mediaRecorder.stop();
    const elapsed = ((performance.now() - this.startTime) / 1000).toFixed(1);
    console.log(`[FrameCapture] Recording stopped. Duration: ${elapsed}s`);
  }

  /**
   * Export recorded frames as MP4 download.
   */
  public async exportMP4(filename: string = 'sandlot_sluggers.mp4'): Promise<Blob> {
    // Wait for recorder to fully stop
    if (this.isRecording) {
      this.stop();
      await new Promise<void>((resolve) => {
        if (this.mediaRecorder) {
          this.mediaRecorder.addEventListener('stop', () => resolve(), { once: true });
        } else {
          resolve();
        }
      });
    }

    const blob = new Blob(this.chunks, { type: 'video/mp4' });

    // Trigger browser download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`[FrameCapture] Exported ${filename} (${(blob.size / 1024 / 1024).toFixed(1)} MB)`);
    return blob;
  }

  /**
   * Export frames to a WebSocket server for direct ingestion into the
   * training pipeline (see genie-worldmodel/scripts/capture_server.py).
   */
  public async streamToServer(wsUrl: string = 'ws://localhost:8765'): Promise<void> {
    if (this.isRecording) {
      console.warn('[FrameCapture] Cannot stream while recording via MediaRecorder. Use startStreaming() instead.');
      return;
    }

    const ws = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      ws.onopen = (): void => resolve();
      ws.onerror = (e): void => reject(e);
    });

    this.isRecording = true;
    this.startTime = performance.now();
    const interval = 1000 / this.options.fps;

    const captureLoop = (): void => {
      if (!this.isRecording) {
        ws.close();
        return;
      }

      this.canvas.toBlob((blob) => {
        if (blob && ws.readyState === WebSocket.OPEN) {
          blob.arrayBuffer().then((buf) => ws.send(buf));
          this.frameCount++;
        }
      }, 'image/jpeg', 0.85);

      setTimeout(captureLoop, interval);
    };

    captureLoop();
    console.log(`[FrameCapture] Streaming to ${wsUrl} at ${this.options.fps} fps`);
  }

  /**
   * Stop streaming to server.
   */
  public stopStreaming(): void {
    this.isRecording = false;
    const elapsed = ((performance.now() - this.startTime) / 1000).toFixed(1);
    console.log(`[FrameCapture] Streaming stopped. ${this.frameCount} frames in ${elapsed}s`);
  }

  public getFrameCount(): number {
    return this.frameCount;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  private _getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'video/webm';
  }
}
