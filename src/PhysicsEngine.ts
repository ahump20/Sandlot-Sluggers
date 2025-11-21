export interface Vector2 {
    x: number;
    y: number;
}

export class PhysicsEngine {
    gravity: number = 0.5;
    friction: number = 0.98;

    updateBall(position: Vector2, velocity: Vector2): { position: Vector2, velocity: Vector2 } {
        // Create new velocity object with gravity and friction applied
        let newVelocity: Vector2 = {
            x: velocity.x * this.friction,
            y: velocity.y + this.gravity
        };

        // Create new position object
        let newPosition: Vector2 = {
            x: position.x + newVelocity.x,
            y: position.y + newVelocity.y
        };

        // Simple ground bounce (assuming y=500 is ground)
        if (newPosition.y > 500) {
            newPosition.y = 500;
            newVelocity.y *= -0.7; // Bounce with energy loss
        }

        return { position: newPosition, velocity: newVelocity };
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
