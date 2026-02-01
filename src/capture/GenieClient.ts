/**
 * GenieClient - Browser-side WebSocket client for the Genie world model
 * inference server. Sends player actions and receives AI-generated frames.
 *
 * This enables a "dream mode" where the world model generates new baseball
 * scenarios frame-by-frame based on player input, similar to DeepMind Genie.
 *
 * Usage:
 *   const client = new GenieClient('ws://localhost:8766');
 *   await client.connect();
 *   client.onFrame = (imageData) => { renderToCanvas(imageData); };
 *   client.sendAction(3); // swing bat
 */

/** Action mapping for Sandlot Sluggers gameplay */
export enum GenieAction {
  IDLE = 0,
  SWING = 1,
  BUNT = 2,
  PITCH_FASTBALL = 3,
  PITCH_CURVEBALL = 4,
  PITCH_SLIDER = 5,
  RUN = 6,
  FIELD = 7,
}

export class GenieClient {
  private ws: WebSocket | null = null;
  private url: string;
  private _connected: boolean = false;

  /** Called when a new generated frame arrives. Override this. */
  public onFrame: ((imageData: ImageBitmap) => void) | null = null;

  /** Called on connection state changes. */
  public onConnectionChange: ((connected: boolean) => void) | null = null;

  constructor(url: string = 'ws://localhost:8766') {
    this.url = url;
  }

  public async connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = (): void => {
        this._connected = true;
        this.onConnectionChange?.(true);
        console.log('[GenieClient] Connected to inference server');
        resolve();
      };

      this.ws.onerror = (e): void => {
        console.error('[GenieClient] Connection error:', e);
        reject(e);
      };

      this.ws.onclose = (): void => {
        this._connected = false;
        this.onConnectionChange?.(false);
        console.log('[GenieClient] Disconnected');
      };

      this.ws.onmessage = async (event: MessageEvent): Promise<void> => {
        if (event.data instanceof ArrayBuffer) {
          const blob = new Blob([event.data], { type: 'image/png' });
          const bitmap = await createImageBitmap(blob);
          this.onFrame?.(bitmap);
        }
      };
    });
  }

  /**
   * Send an action to the world model. The server will respond with the
   * next generated frame via the onFrame callback.
   */
  public sendAction(action: GenieAction | number): void {
    if (!this._connected || !this.ws) {
      console.warn('[GenieClient] Not connected');
      return;
    }
    this.ws.send(JSON.stringify({ action }));
  }

  public disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  public get connected(): boolean {
    return this._connected;
  }
}
