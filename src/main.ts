import { Renderer } from './Renderer';
import { PhysicsEngine } from './PhysicsEngine';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const renderer = new Renderer(canvas);
const physics = new PhysicsEngine();

let ball = { x: 400, y: 400 };
let ballVelocity = { x: 0, y: 0 };
let isSwinging = false;
let gameState = 'PITCHING'; // PITCHING, HITTING, RUNNING

// Input Handling
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'PITCHING') {
        // Pitch the ball
        gameState = 'HITTING';
        ball = { x: 400, y: 200 }; // Start from pitcher mound
        ballVelocity = { x: 0, y: 4 }; // Throw towards home
    } else if (e.code === 'KeyZ') {
        isSwinging = true;
        setTimeout(() => isSwinging = false, 300);

        // Simple Hit Check
        if (gameState === 'HITTING' && ball.y > 450 && ball.y < 520) {
            ballVelocity = { x: (Math.random() - 0.5) * 10, y: -15 }; // Hit into outfield
        }
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
