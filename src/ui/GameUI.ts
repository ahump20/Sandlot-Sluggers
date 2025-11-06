/**
 * Game UI System
 * Manages HUD, overlays, and in-game interface
 * Inspired by Backyard Baseball 2001's iconic UI style
 */

export class GameUI {
  private container: HTMLElement;
  private hudElements: Map<string, HTMLElement> = new Map();

  constructor(containerId: string = "ui-container") {
    const existing = document.getElementById(containerId);
    if (existing) {
      this.container = existing;
    } else {
      this.container = document.createElement("div");
      this.container.id = containerId;
      this.container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive;
        z-index: 1000;
      `;
      document.body.appendChild(this.container);
    }

    this.initializeHUD();
  }

  /**
   * Initialize HUD elements
   */
  private initializeHUD(): void {
    // Scoreboard
    this.createScoreboard();

    // Count display
    this.createCountDisplay();

    // Bases indicator
    this.createBasesIndicator();

    // Outs indicator
    this.createOutsIndicator();

    // Power meter
    this.createPowerMeter();

    // Action buttons
    this.createActionButtons();

    // Notifications
    this.createNotificationArea();
  }

  /**
   * Create scoreboard
   */
  private createScoreboard(): void {
    const scoreboard = document.createElement("div");
    scoreboard.id = "scoreboard";
    scoreboard.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #1a5490 0%, #2d7cbc 100%);
      border: 4px solid #ffd700;
      border-radius: 15px;
      padding: 15px 30px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.3);
      pointer-events: all;
      min-width: 350px;
    `;

    scoreboard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 30px;">
        <div style="text-align: center;">
          <div style="color: #ffd700; font-size: 14px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">AWAY</div>
          <div id="away-score" style="color: white; font-size: 36px; font-weight: bold; text-shadow: 3px 3px 6px rgba(0,0,0,0.7);">0</div>
        </div>
        <div style="text-align: center;">
          <div style="color: #ffd700; font-size: 18px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">INNING</div>
          <div style="color: white; font-size: 28px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">
            <span id="inning">1</span>
            <span id="inning-half" style="font-size: 16px;">▲</span>
          </div>
        </div>
        <div style="text-align: center;">
          <div style="color: #ffd700; font-size: 14px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">HOME</div>
          <div id="home-score" style="color: white; font-size: 36px; font-weight: bold; text-shadow: 3px 3px 6px rgba(0,0,0,0.7);">0</div>
        </div>
      </div>
    `;

    this.container.appendChild(scoreboard);
    this.hudElements.set("scoreboard", scoreboard);
  }

  /**
   * Create count display (balls, strikes)
   */
  private createCountDisplay(): void {
    const countDisplay = document.createElement("div");
    countDisplay.id = "count-display";
    countDisplay.style.cssText = `
      position: absolute;
      top: 120px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      border: 3px solid #ff6b6b;
      border-radius: 10px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    countDisplay.innerHTML = `
      <div style="color: #ffd700; font-size: 16px; font-weight: bold; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">COUNT</div>
      <div style="display: flex; gap: 20px;">
        <div>
          <div style="color: #4CAF50; font-size: 12px; font-weight: bold;">BALLS</div>
          <div id="balls-count" style="color: white; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">0</div>
        </div>
        <div>
          <div style="color: #ff6b6b; font-size: 12px; font-weight: bold;">STRIKES</div>
          <div id="strikes-count" style="color: white; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">0</div>
        </div>
      </div>
    `;

    this.container.appendChild(countDisplay);
    this.hudElements.set("count", countDisplay);
  }

  /**
   * Create bases indicator
   */
  private createBasesIndicator(): void {
    const basesDiv = document.createElement("div");
    basesDiv.id = "bases-indicator";
    basesDiv.style.cssText = `
      position: absolute;
      top: 120px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      border: 3px solid #4CAF50;
      border-radius: 10px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    basesDiv.innerHTML = `
      <div style="color: #ffd700; font-size: 16px; font-weight: bold; margin-bottom: 10px; text-align: center; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">BASES</div>
      <div style="position: relative; width: 100px; height: 100px;">
        <div id="base-2" class="base" style="position: absolute; top: 0; left: 50%; transform: translateX(-50%) rotate(45deg); width: 20px; height: 20px; background: #666; border: 2px solid white;"></div>
        <div id="base-3" class="base" style="position: absolute; top: 50%; left: 0; transform: translateY(-50%) rotate(45deg); width: 20px; height: 20px; background: #666; border: 2px solid white;"></div>
        <div id="base-1" class="base" style="position: absolute; top: 50%; right: 0; transform: translateY(-50%) rotate(45deg); width: 20px; height: 20px; background: #666; border: 2px solid white;"></div>
        <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); color: white; font-size: 12px; font-weight: bold;">HOME</div>
      </div>
    `;

    this.container.appendChild(basesDiv);
    this.hudElements.set("bases", basesDiv);
  }

  /**
   * Create outs indicator
   */
  private createOutsIndicator(): void {
    const outsDiv = document.createElement("div");
    outsDiv.id = "outs-indicator";
    outsDiv.style.cssText = `
      position: absolute;
      top: 260px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      border: 3px solid #ff9800;
      border-radius: 10px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    outsDiv.innerHTML = `
      <div style="color: #ffd700; font-size: 16px; font-weight: bold; margin-bottom: 10px; text-align: center; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">OUTS</div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <div id="out-1" class="out-indicator" style="width: 20px; height: 20px; border-radius: 50%; background: #666; border: 2px solid white;"></div>
        <div id="out-2" class="out-indicator" style="width: 20px; height: 20px; border-radius: 50%; background: #666; border: 2px solid white;"></div>
        <div id="out-3" class="out-indicator" style="width: 20px; height: 20px; border-radius: 50%; background: #666; border: 2px solid white;"></div>
      </div>
    `;

    this.container.appendChild(outsDiv);
    this.hudElements.set("outs", outsDiv);
  }

  /**
   * Create power meter (for hitting)
   */
  private createPowerMeter(): void {
    const powerMeter = document.createElement("div");
    powerMeter.id = "power-meter";
    powerMeter.style.cssText = `
      position: absolute;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      border: 3px solid #ffd700;
      border-radius: 10px;
      padding: 15px;
      display: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    powerMeter.innerHTML = `
      <div style="color: #ffd700; font-size: 14px; font-weight: bold; margin-bottom: 8px; text-align: center; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">POWER</div>
      <div style="width: 200px; height: 20px; background: #333; border: 2px solid white; border-radius: 10px; overflow: hidden;">
        <div id="power-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #4CAF50 0%, #ffd700 50%, #ff6b6b 100%); transition: width 0.05s;"></div>
      </div>
    `;

    this.container.appendChild(powerMeter);
    this.hudElements.set("powerMeter", powerMeter);
  }

  /**
   * Create action buttons
   */
  private createActionButtons(): void {
    const buttonsDiv = document.createElement("div");
    buttonsDiv.id = "action-buttons";
    buttonsDiv.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 15px;
      pointer-events: all;
    `;

    buttonsDiv.innerHTML = `
      <button id="pitch-btn" class="game-button" style="
        padding: 15px 30px;
        font-size: 18px;
        font-weight: bold;
        color: white;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        border: 3px solid #ffd700;
        border-radius: 12px;
        cursor: pointer;
        box-shadow: 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        transition: transform 0.1s, box-shadow 0.1s;
      " onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">
        PITCH!
      </button>
      <button id="pause-btn" class="game-button" style="
        padding: 15px 20px;
        font-size: 18px;
        font-weight: bold;
        color: white;
        background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        border: 3px solid #ffd700;
        border-radius: 12px;
        cursor: pointer;
        box-shadow: 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        transition: transform 0.1s, box-shadow 0.1s;
      " onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">
        PAUSE
      </button>
    `;

    this.container.appendChild(buttonsDiv);
    this.hudElements.set("buttons", buttonsDiv);
  }

  /**
   * Create notification area
   */
  private createNotificationArea(): void {
    const notifDiv = document.createElement("div");
    notifDiv.id = "notifications";
    notifDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;

    this.container.appendChild(notifDiv);
    this.hudElements.set("notifications", notifDiv);
  }

  /**
   * Update scoreboard
   */
  public updateScoreboard(awayScore: number, homeScore: number, inning: number, isTop: boolean): void {
    const awayEl = document.getElementById("away-score");
    const homeEl = document.getElementById("home-score");
    const inningEl = document.getElementById("inning");
    const halfEl = document.getElementById("inning-half");

    if (awayEl) awayEl.textContent = String(awayScore);
    if (homeEl) homeEl.textContent = String(homeScore);
    if (inningEl) inningEl.textContent = String(inning);
    if (halfEl) halfEl.textContent = isTop ? "▲" : "▼";
  }

  /**
   * Update count
   */
  public updateCount(balls: number, strikes: number): void {
    const ballsEl = document.getElementById("balls-count");
    const strikesEl = document.getElementById("strikes-count");

    if (ballsEl) ballsEl.textContent = String(balls);
    if (strikesEl) strikesEl.textContent = String(strikes);
  }

  /**
   * Update bases
   */
  public updateBases(bases: [boolean, boolean, boolean]): void {
    const base1 = document.getElementById("base-1");
    const base2 = document.getElementById("base-2");
    const base3 = document.getElementById("base-3");

    if (base1) base1.style.background = bases[0] ? "#ffd700" : "#666";
    if (base2) base2.style.background = bases[1] ? "#ffd700" : "#666";
    if (base3) base3.style.background = bases[2] ? "#ffd700" : "#666";
  }

  /**
   * Update outs
   */
  public updateOuts(outs: number): void {
    for (let i = 1; i <= 3; i++) {
      const outEl = document.getElementById(`out-${i}`);
      if (outEl) {
        outEl.style.background = i <= outs ? "#ff6b6b" : "#666";
      }
    }
  }

  /**
   * Show notification
   */
  public showNotification(
    text: string,
    duration: number = 2000,
    style: "default" | "success" | "error" | "homerun" = "default"
  ): void {
    const notifDiv = this.hudElements.get("notifications");
    if (!notifDiv) return;

    const notification = document.createElement("div");
    notification.style.cssText = `
      padding: 20px 40px;
      font-size: 32px;
      font-weight: bold;
      color: white;
      background: ${this.getNotificationColor(style)};
      border: 4px solid #ffd700;
      border-radius: 15px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      text-shadow: 3px 3px 6px rgba(0,0,0,0.7);
      animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      margin-bottom: 10px;
    `;

    // Add animation
    const style_tag = document.createElement("style");
    style_tag.textContent = `
      @keyframes popIn {
        0% { transform: scale(0); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    if (!document.getElementById("notification-styles")) {
      style_tag.id = "notification-styles";
      document.head.appendChild(style_tag);
    }

    notification.textContent = text;
    notifDiv.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "popOut 0.3s ease-out";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }

  /**
   * Get notification background color
   */
  private getNotificationColor(style: string): string {
    switch (style) {
      case "success":
        return "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)";
      case "error":
        return "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)";
      case "homerun":
        return "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)";
      default:
        return "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)";
    }
  }

  /**
   * Show/hide power meter
   */
  public setPowerMeterVisible(visible: boolean): void {
    const powerMeter = this.hudElements.get("powerMeter");
    if (powerMeter) {
      powerMeter.style.display = visible ? "block" : "none";
    }
  }

  /**
   * Update power meter value
   */
  public updatePowerMeter(value: number): void {
    const powerBar = document.getElementById("power-bar");
    if (powerBar) {
      powerBar.style.width = `${Math.min(100, Math.max(0, value))}%`;
    }
  }

  /**
   * Get pitch button
   */
  public getPitchButton(): HTMLButtonElement | null {
    return document.getElementById("pitch-btn") as HTMLButtonElement;
  }

  /**
   * Get pause button
   */
  public getPauseButton(): HTMLButtonElement | null {
    return document.getElementById("pause-btn") as HTMLButtonElement;
  }

  /**
   * Dispose UI
   */
  public dispose(): void {
    this.container.remove();
    this.hudElements.clear();
  }
}
