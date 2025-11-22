import { Renderer } from './Renderer';
import { PhysicsEngine, Vector2 } from './PhysicsEngine';

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Field positions
const PITCHER_POSITION_X = 400;
const PITCHER_POSITION_Y = 200;
const HOME_PLATE_Y = 400;

// Batter position
const BATTER_X = 360;
const BATTER_Y = 460;

// Hit detection zone
const HIT_DETECTION_MIN_Y = 450;
const HIT_DETECTION_MAX_Y = 520;
const HIT_TOLERANCE = 5;

// Ball physics constants
const PITCH_VELOCITY_Y = 4;
const HIT_VELOCITY_Y = -15;
const HIT_VELOCITY_X_RANGE = 10;

// Swing animation duration
const SWING_DURATION_MS = 300;

// Ball velocity thresholds for game state reset
const VELOCITY_SETTLED_THRESHOLD = 0.1;

// Game state type
type GameState = 'PITCHING' | 'HITTING' | 'RUNNING';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
if (!canvas) {
    throw new Error('Canvas element with id "gameCanvas" not found');
}
const renderer = new Renderer(canvas);
const physics = new PhysicsEngine();

let ball: Vector2 = { x: PITCHER_POSITION_X, y: PITCHER_POSITION_Y };
let ballVelocity: Vector2 = { x: 0, y: 0 };
let isSwinging = false;
let gameState: GameState = 'PITCHING';

// Input Handling
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'PITCHING') {
        e.preventDefault(); // Prevent page scroll
        // Pitch the ball
        gameState = 'HITTING';
        ball = { x: PITCHER_POSITION_X, y: PITCHER_POSITION_Y }; // Start from pitcher mound
        ballVelocity = { x: 0, y: PITCH_VELOCITY_Y }; // Throw towards home
    } else if (e.code === 'KeyZ') {
        isSwinging = true;
        setTimeout(() => isSwinging = false, SWING_DURATION_MS);

        // Improved Hit Check: check both x and y coordinates
        const BAT_WIDTH = isSwinging ? 60 : 20; // Swinging bat is wider
        const HIT_MIN_X = BATTER_X - HIT_TOLERANCE;
        const HIT_MAX_X = BATTER_X + BAT_WIDTH + HIT_TOLERANCE;
        if (
            gameState === 'HITTING' &&
            ball.y > HIT_DETECTION_MIN_Y && ball.y < HIT_DETECTION_MAX_Y &&
            ball.x > HIT_MIN_X && ball.x < HIT_MAX_X
        ) {
            ballVelocity = { x: (Math.random() - 0.5) * HIT_VELOCITY_X_RANGE, y: HIT_VELOCITY_Y }; // Hit into outfield
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

        // Check if ball has settled (very low velocity) or gone out of bounds
        const isSettled = Math.abs(ballVelocity.x) < VELOCITY_SETTLED_THRESHOLD && Math.abs(ballVelocity.y) < VELOCITY_SETTLED_THRESHOLD;
        const isOutOfBounds = ball.x < 0 || ball.x > CANVAS_WIDTH || ball.y < 0 || ball.y > CANVAS_HEIGHT;
        
        if (isSettled || isOutOfBounds) {
            // Reset game state for next pitch
            gameState = 'PITCHING';
            ball = { x: PITCHER_POSITION_X, y: PITCHER_POSITION_Y };
            ballVelocity = { x: 0, y: 0 };
        }
    }

    renderer.drawBatter(BATTER_X, BATTER_Y, isSwinging);
    renderer.drawBall(ball.x, ball.y);

    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
