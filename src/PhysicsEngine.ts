export interface Vector2 {
    x: number;
    y: number;
}

export class PhysicsEngine {
    gravity: number = 0.5;
    friction: number = 0.98;

    updateBall(position: Vector2, velocity: Vector2): { position: Vector2, velocity: Vector2 } {
        // Apply gravity
        velocity.y += this.gravity;
        
        // Apply air resistance/friction
        velocity.x *= this.friction;
        velocity.y *= this.friction;

        // Update position
        position.x += velocity.x;
        position.y += velocity.y;

        // Simple ground bounce (assuming y=500 is ground)
        if (position.y > 500) {
            position.y = 500;
            velocity.y *= -0.7; // Bounce with energy loss
        }

        return { position, velocity };
    }

    checkCollision(ballPos: Vector2, batRect: { x: number, y: number, width: number, height: number }): boolean {
        return (
            ballPos.x >= batRect.x &&
            ballPos.x <= batRect.x + batRect.width &&
            ballPos.y >= batRect.y &&
            ballPos.y <= batRect.y + batRect.height
        );
    }
}
