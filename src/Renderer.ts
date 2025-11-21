export class Renderer {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;

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
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Dirt Diamond
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.moveTo(400, 500); // Home
        this.ctx.lineTo(550, 350); // 1st
        this.ctx.lineTo(400, 200); // 2nd
        this.ctx.lineTo(250, 350); // 3rd
        this.ctx.closePath();
        this.ctx.fill();

        // Bases
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(390, 490, 20, 20); // Home
        this.ctx.fillRect(540, 340, 20, 20); // 1st
        this.ctx.fillRect(390, 190, 20, 20); // 2nd
        this.ctx.fillRect(240, 340, 20, 20); // 3rd
    }

    drawBall(x: number, y: number): void {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawBatter(x: number, y: number, isSwinging: boolean): void {
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(x, y, 20, 40);

        // Draw Bat
        this.ctx.fillStyle = 'brown';
        if (isSwinging) {
            this.ctx.fillRect(x + 20, y + 10, 40, 10);
        } else {
            this.ctx.fillRect(x + 5, y - 20, 10, 40);
        }
    }
}
