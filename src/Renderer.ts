/**
 * 2D Canvas renderer for the baseball game.
 * Handles rendering of the field, ball, and batter.
 */
export class Renderer {
    /** 2D rendering context */
    ctx: CanvasRenderingContext2D;
    /** Canvas width in pixels */
    width: number;
    /** Canvas height in pixels */
    height: number;

    // Field color constants
    private readonly FIELD_COLORS = {
        grass: '#4CAF50',
        dirt: '#8B4513',
        base: 'white'
    };

    // Field coordinate constants
    private readonly FIELD_COORDS = {
        home: { x: 400, y: 500 },
        first: { x: 550, y: 350 },
        second: { x: 400, y: 200 },
        third: { x: 250, y: 350 }
    };

    // Base dimensions
    private readonly BASE_SIZE = 20;

    // Batter and bat dimensions
    private readonly BATTER_WIDTH = 20;
    private readonly BATTER_HEIGHT = 40;
    private readonly BAT_SWING_WIDTH = 40;
    private readonly BAT_SWING_HEIGHT = 10;
    private readonly BAT_REST_WIDTH = 10;
    private readonly BAT_REST_HEIGHT = 40;
    private readonly BAT_REST_OFFSET_Y = -20;

    // Ball dimensions
    private readonly BALL_RADIUS = 5;

    /**
     * Creates a new Renderer instance.
     * @param canvas - The HTML canvas element to render to
     */
    constructor(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D rendering context');
        }
        this.ctx = ctx;
        this.width = canvas.width = 800;
        this.height = canvas.height = 600;
    }

    clear(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawField(): void {
        // Draw grass
        this.ctx.fillStyle = this.FIELD_COLORS.grass;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Dirt Diamond
        this.ctx.fillStyle = this.FIELD_COLORS.dirt;
        this.ctx.beginPath();
        this.ctx.moveTo(this.FIELD_COORDS.home.x, this.FIELD_COORDS.home.y);
        this.ctx.lineTo(this.FIELD_COORDS.first.x, this.FIELD_COORDS.first.y);
        this.ctx.lineTo(this.FIELD_COORDS.second.x, this.FIELD_COORDS.second.y);
        this.ctx.lineTo(this.FIELD_COORDS.third.x, this.FIELD_COORDS.third.y);
        this.ctx.closePath();
        this.ctx.fill();

        // Bases
        this.ctx.fillStyle = this.FIELD_COLORS.base;
        this.ctx.fillRect(this.FIELD_COORDS.home.x - 10, this.FIELD_COORDS.home.y - 10, this.BASE_SIZE, this.BASE_SIZE);
        this.ctx.fillRect(this.FIELD_COORDS.first.x - 10, this.FIELD_COORDS.first.y - 10, this.BASE_SIZE, this.BASE_SIZE);
        this.ctx.fillRect(this.FIELD_COORDS.second.x - 10, this.FIELD_COORDS.second.y - 10, this.BASE_SIZE, this.BASE_SIZE);
        this.ctx.fillRect(this.FIELD_COORDS.third.x - 10, this.FIELD_COORDS.third.y - 10, this.BASE_SIZE, this.BASE_SIZE);
    }

    drawBall(x: number, y: number): void {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.BALL_RADIUS, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawBatter(x: number, y: number, isSwinging: boolean): void {
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(x, y, this.BATTER_WIDTH, this.BATTER_HEIGHT);

        // Draw Bat
        this.ctx.fillStyle = 'brown';
        if (isSwinging) {
            this.ctx.fillRect(x + this.BATTER_WIDTH, y + 10, this.BAT_SWING_WIDTH, this.BAT_SWING_HEIGHT);
        } else {
            this.ctx.fillRect(x + 5, y + this.BAT_REST_OFFSET_Y, this.BAT_REST_WIDTH, this.BAT_REST_HEIGHT);
        }
    }
}
