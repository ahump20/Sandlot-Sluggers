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

        // Improved Hit Check: check both x and y coordinates
        const BAT_X = 360;
        const BAT_WIDTH = isSwinging ? 60 : 20; // Swinging bat is wider
        const HIT_MIN_X = BAT_X - 5; // Add some tolerance
        const HIT_MAX_X = BAT_X + BAT_WIDTH + 5;
        if (
            gameState === 'HITTING' &&
            ball.y > 450 && ball.y < 520 &&
            ball.x > HIT_MIN_X && ball.x < HIT_MAX_X
        ) {
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
