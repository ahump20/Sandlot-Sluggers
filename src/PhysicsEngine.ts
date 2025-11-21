export interface Vector2 {
    x: number;
    y: number;
}

/**
 * Basic 2D physics engine for ball movement simulation.
 * Implements gravity, air resistance, and ground collision.
 */
export class PhysicsEngine {
    /** Gravity acceleration in pixels/frame² */
    gravity: number = 0.5;
    /** Air resistance coefficient (0-1, where 1 = no resistance) */
    friction: number = 0.98;
    /** Ground level in pixels (y-coordinate) */
    private readonly groundLevel: number = 500;
    /** Bounce coefficient (energy loss on ground impact) */
    private readonly bounceCoefficient: number = 0.7;

    /**
     * Updates ball position and velocity based on physics simulation.
     * @param position - Current ball position
     * @param velocity - Current ball velocity
     * @returns Updated position and velocity
     */
    updateBall(position: Vector2, velocity: Vector2): { position: Vector2, velocity: Vector2 } {
        // Apply friction first (to previous frame's velocity)
        let newVelocity: Vector2 = {
            x: velocity.x * this.friction,
            y: velocity.y * this.friction
        };
        
        // Then add gravity
        newVelocity.y += this.gravity;

        // Create new position object
        let newPosition: Vector2 = {
            x: position.x + newVelocity.x,
            y: position.y + newVelocity.y
        };

        // Simple ground bounce
        if (newPosition.y > this.groundLevel) {
            newPosition.y = this.groundLevel;
            newVelocity.y *= -this.bounceCoefficient; // Bounce with energy loss
        }

        return { position: newPosition, velocity: newVelocity };
    }

}
