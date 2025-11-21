/**
 * Renderer.ts
 * 2D Canvas renderer for baseball game
 */

import { Vector2, Ball } from './PhysicsEngine';

export interface Player {
  position: Vector2;
  name: string;
  role: 'pitcher' | 'batter' | 'fielder';
  color: string;
}

export interface RenderConfig {
  width: number;
  height: number;
  backgroundColor: string;
  fieldColor: string;
  dirtColor: string;
}

export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly config: RenderConfig;

  // Field dimensions (in pixels)
  private readonly PITCHER_MOUND_X = 100;
  private readonly PITCHER_MOUND_Y = 550;
  private readonly HOME_PLATE_X = 700;
  private readonly HOME_PLATE_Y = 550;
  private readonly INFIELD_RADIUS = 150;

  constructor(canvas: HTMLCanvasElement, config?: Partial<RenderConfig>) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = context;

    this.config = {
      width: canvas.width,
      height: canvas.height,
      backgroundColor: '#3a7d3e',
      fieldColor: '#2d6b31',
      dirtColor: '#b8936d',
      ...config
    };
  }

  /**
   * Clear the canvas and draw the baseball field
   */
  public drawField(): void {
    // Clear canvas
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);

    // Draw outfield (grass)
    this.ctx.fillStyle = this.config.fieldColor;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height * 0.9);

    // Draw warning track (lighter grass)
    this.ctx.fillStyle = '#3a7d3e';
    this.ctx.fillRect(0, 0, this.config.width, 50);

    // Draw infield dirt (diamond shape)
    this.drawInfieldDirt();

    // Draw pitcher's mound
    this.drawPitcherMound();

    // Draw home plate area
    this.drawHomePlate();

    // Draw bases
    this.drawBases();

    // Draw foul lines
    this.drawFoulLines();

    // Draw mowing pattern (for effect)
    this.drawGrassPattern();
  }

  /**
   * Draw the infield dirt area
   */
  private drawInfieldDirt(): void {
    this.ctx.fillStyle = this.config.dirtColor;
    this.ctx.beginPath();

    // Draw a circular dirt area around the infield
    this.ctx.arc(
      this.HOME_PLATE_X - 50,
      this.HOME_PLATE_Y,
      this.INFIELD_RADIUS,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Extended dirt path to pitcher's mound
    this.ctx.fillStyle = this.config.dirtColor;
    this.ctx.fillRect(
      this.PITCHER_MOUND_X - 20,
      this.PITCHER_MOUND_Y - 100,
      this.HOME_PLATE_X - this.PITCHER_MOUND_X + 40,
      100
    );
  }

  /**
   * Draw the pitcher's mound
   */
  private drawPitcherMound(): void {
    // Mound circle
    this.ctx.fillStyle = '#a08060';
    this.ctx.beginPath();
    this.ctx.arc(this.PITCHER_MOUND_X, this.PITCHER_MOUND_Y, 15, 0, Math.PI * 2);
    this.ctx.fill();

    // Pitcher's rubber
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(this.PITCHER_MOUND_X - 10, this.PITCHER_MOUND_Y - 2, 20, 4);
  }

  /**
   * Draw home plate
   */
  private drawHomePlate(): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.moveTo(this.HOME_PLATE_X, this.HOME_PLATE_Y);
    this.ctx.lineTo(this.HOME_PLATE_X - 8, this.HOME_PLATE_Y - 8);
    this.ctx.lineTo(this.HOME_PLATE_X - 8, this.HOME_PLATE_Y - 15);
    this.ctx.lineTo(this.HOME_PLATE_X + 8, this.HOME_PLATE_Y - 15);
    this.ctx.lineTo(this.HOME_PLATE_X + 8, this.HOME_PLATE_Y - 8);
    this.ctx.closePath();
    this.ctx.fill();

    // Batter's boxes
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;

    // Left batter's box
    this.ctx.strokeRect(this.HOME_PLATE_X - 30, this.HOME_PLATE_Y - 40, 15, 50);

    // Right batter's box
    this.ctx.strokeRect(this.HOME_PLATE_X + 15, this.HOME_PLATE_Y - 40, 15, 50);
  }

  /**
   * Draw bases (1st, 2nd, 3rd)
   */
  private drawBases(): void {
    this.ctx.fillStyle = '#ffffff';
    const baseSize = 8;

    // 1st base (right side)
    this.ctx.fillRect(
      this.HOME_PLATE_X - 50 + this.INFIELD_RADIUS - baseSize / 2,
      this.HOME_PLATE_Y - baseSize / 2,
      baseSize,
      baseSize
    );

    // 2nd base (top)
    this.ctx.fillRect(
      this.HOME_PLATE_X - 50 - baseSize / 2,
      this.HOME_PLATE_Y - this.INFIELD_RADIUS - baseSize / 2,
      baseSize,
      baseSize
    );

    // 3rd base (left side)
    this.ctx.fillRect(
      this.HOME_PLATE_X - 50 - this.INFIELD_RADIUS - baseSize / 2,
      this.HOME_PLATE_Y - baseSize / 2,
      baseSize,
      baseSize
    );
  }

  /**
   * Draw foul lines
   */
  private drawFoulLines(): void {
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    // First base line
    this.ctx.beginPath();
    this.ctx.moveTo(this.HOME_PLATE_X, this.HOME_PLATE_Y);
    this.ctx.lineTo(this.config.width, this.HOME_PLATE_Y);
    this.ctx.stroke();

    // Third base line
    this.ctx.beginPath();
    this.ctx.moveTo(this.HOME_PLATE_X, this.HOME_PLATE_Y);
    this.ctx.lineTo(0, this.HOME_PLATE_Y);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
  }

  /**
   * Draw grass mowing pattern for visual effect
   */
  private drawGrassPattern(): void {
    this.ctx.fillStyle = 'rgba(45, 107, 49, 0.3)';
    const stripeWidth = 30;

    for (let i = 0; i < this.config.width; i += stripeWidth * 2) {
      this.ctx.fillRect(i, 50, stripeWidth, this.config.height * 0.9 - 50);
    }
  }

  /**
   * Draw a player
   */
  public drawPlayer(player: Player, isAnimating: boolean = false): void {
    const { x, y } = player.position;

    // Draw player body
    this.ctx.fillStyle = player.color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw player outline
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw player name
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(player.name, x, y - 20);

    // Add animation effect if active
    if (isAnimating) {
      this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 18, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw bat for batter
    if (player.role === 'batter') {
      this.drawBat(player.position, isAnimating);
    }
  }

  /**
   * Draw a bat for the batter
   */
  private drawBat(position: Vector2, isSwinging: boolean): void {
    this.ctx.strokeStyle = '#8b4513';
    this.ctx.lineWidth = 4;

    const batLength = 30;
    const angle = isSwinging ? Math.PI / 4 : Math.PI / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(position.x, position.y);
    this.ctx.lineTo(
      position.x + Math.cos(angle) * batLength,
      position.y - Math.sin(angle) * batLength
    );
    this.ctx.stroke();
  }

  /**
   * Draw the ball
   */
  public drawBall(ball: Ball): void {
    if (!ball.active) return;

    const { x, y } = ball.position;

    // Ball shadow (for depth perception)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, this.config.height * 0.9, ball.radius * 0.8, ball.radius * 0.3, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Ball body
    const gradient = this.ctx.createRadialGradient(
      x - ball.radius * 0.3,
      y - ball.radius * 0.3,
      0,
      x,
      y,
      ball.radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#cccccc');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Ball outline
    this.ctx.strokeStyle = '#999999';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Stitches
    this.ctx.strokeStyle = '#cc0000';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(x, y, ball.radius * 0.6, -Math.PI / 4, Math.PI / 4);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(x, y, ball.radius * 0.6, Math.PI * 0.75, Math.PI * 1.25);
    this.ctx.stroke();
  }

  /**
   * Draw ball trajectory prediction (dotted line)
   */
  public drawTrajectory(startPos: Vector2, endPos: Vector2): void {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 10]);

    this.ctx.beginPath();
    this.ctx.moveTo(startPos.x, startPos.y);

    // Draw a curved line (simple quadratic curve)
    const controlX = (startPos.x + endPos.x) / 2;
    const controlY = Math.min(startPos.y, endPos.y) - 50;
    this.ctx.quadraticCurveTo(controlX, controlY, endPos.x, endPos.y);

    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  /**
   * Draw text on screen
   */
  public drawText(text: string, x: number, y: number, size: number = 20, color: string = '#ffffff'): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `bold ${size}px Comic Sans MS`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, x, y);
  }

  /**
   * Draw a fielding indicator (circle around fielder's target position)
   */
  public drawFieldingIndicator(position: Vector2, radius: number): void {
    this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([5, 5]);

    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
  }

  /**
   * Get canvas dimensions
   */
  public getDimensions(): { width: number; height: number } {
    return {
      width: this.config.width,
      height: this.config.height
    };
  }

  /**
   * Get pitcher mound position
   */
  public getPitcherPosition(): Vector2 {
    return { x: this.PITCHER_MOUND_X, y: this.PITCHER_MOUND_Y };
  }

  /**
   * Get home plate position
   */
  public getHomePlatePosition(): Vector2 {
    return { x: this.HOME_PLATE_X, y: this.HOME_PLATE_Y };
  }

  /**
   * Get batter position
   */
  public getBatterPosition(): Vector2 {
    return { x: this.HOME_PLATE_X + 20, y: this.HOME_PLATE_Y - 10 };
  }
}
