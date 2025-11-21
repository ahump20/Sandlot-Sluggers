import { Renderer } from './Renderer';
import { PhysicsEngine } from './PhysicsEngine';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const renderer = new Renderer(canvas);
const physics = new PhysicsEngine();

const BATTER_HIT_ZONE_TOP = 450;
const BATTER_HIT_ZONE_BOTTOM = 520;

let ball = { x: 400, y: 400 };
let ballVelocity = { x: 0, y: 0 };
let isSwinging = false;
let gameState = 'PITCHING'; // PITCHING, HITTING, RUNNING
let isPitching = false;

// Input Handling
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'PITCHING' && !isPitching) {
        // Pitch the ball
        isPitching = true;
        gameState = 'HITTING';
        ball = { x: 400, y: 200 }; // Start from pitcher mound
        ballVelocity = { x: 0, y: 4 }; // Throw towards home
    } else if (e.code === 'KeyZ') {
        isSwinging = true;
        setTimeout(() => isSwinging = false, 300);
        
        // Simple Hit Check
        if (gameState === 'HITTING' && ball.y > BATTER_HIT_ZONE_TOP && ball.y < BATTER_HIT_ZONE_BOTTOM) {
            ballVelocity = { x: (Math.random() - 0.5) * 10, y: -15 }; // Hit into outfield
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        isPitching = false;
    }
});

function gameLoop(): void {
    renderer.clear();
    renderer.drawField();

    if (gameState === 'HITTING') {
        const result = physics.updateBall(ball, ballVelocity);
        ball = result.position;
        ballVelocity = result.velocity;
    }

    renderer.drawBatter(360, 460, isSwinging);
    renderer.drawBall(ball.x, ball.y);

    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
