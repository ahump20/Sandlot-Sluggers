import { Scene, Vector3, PhysicsImpostor, AbstractMesh, PhysicsEngine, HavokPlugin, Quaternion, Matrix, Observable, Ray, PickingInfo, Mesh, VertexBuffer } from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';

/**
 * Physics material presets
 */
export enum PhysicsMaterial {
    WOOD = 'wood',
    METAL = 'metal',
    RUBBER = 'rubber',
    LEATHER = 'leather',
    DIRT = 'dirt',
    GRASS = 'grass',
    ICE = 'ice',
    CONCRETE = 'concrete',
    PLASTIC = 'plastic'
}

/**
 * Collision groups
 */
export enum CollisionGroup {
    BALL = 1 << 0,           // 1
    PLAYER = 1 << 1,         // 2
    BAT = 1 << 2,            // 4
    GLOVE = 1 << 3,          // 8
    FIELD = 1 << 4,          // 16
    WALL = 1 << 5,           // 32
    TRIGGER = 1 << 6,        // 64
    SENSOR = 1 << 7,         // 128
    PARTICLE = 1 << 8        // 256
}

/**
 * Physics material properties
 */
export interface PhysicsMaterialProperties {
    friction: number;
    restitution: number;    // Bounciness
    mass: number;
    linearDamping: number;
    angularDamping: number;
}

/**
 * Ball physics properties
 */
export interface BallPhysicsProperties {
    mass: number;
    radius: number;
    restitution: number;
    drag: number;
    magnusCoefficient: number;  // Spin effect
    spinDecay: number;
    airDensity: number;
}

/**
 * Collision event
 */
export interface CollisionEvent {
    timestamp: number;
    mesh1: AbstractMesh;
    mesh2: AbstractMesh;
    point: Vector3;
    normal: Vector3;
    impulse: number;
    relativeVelocity: Vector3;
}

/**
 * Raycast result
 */
export interface RaycastResult {
    hit: boolean;
    point?: Vector3;
    normal?: Vector3;
    distance?: number;
    mesh?: AbstractMesh;
}

/**
 * Trigger zone
 */
export interface TriggerZone {
    id: string;
    mesh: AbstractMesh;
    group: CollisionGroup;
    onEnter?: (other: AbstractMesh) => void;
    onStay?: (other: AbstractMesh) => void;
    onExit?: (other: AbstractMesh) => void;
    activeObjects: Set<AbstractMesh>;
}

/**
 * Force field
 */
export interface ForceField {
    id: string;
    position: Vector3;
    radius: number;
    strength: number;
    type: 'radial' | 'directional' | 'vortex' | 'turbulence';
    direction?: Vector3;
    falloff: 'linear' | 'quadratic' | 'constant';
    enabled: boolean;
}

/**
 * Cloth simulation node
 */
export interface ClothNode {
    position: Vector3;
    velocity: Vector3;
    mass: number;
    fixed: boolean;
    forces: Vector3;
}

/**
 * Cloth simulation
 */
export interface ClothSimulation {
    id: string;
    mesh: Mesh;
    nodes: ClothNode[][];
    stiffness: number;
    damping: number;
    gravity: number;
    enabled: boolean;
}

/**
 * Advanced Physics System
 * Comprehensive physics simulation with custom behaviors
 */
export class AdvancedPhysicsSystem {
    private scene: Scene;
    private physicsEngine?: PhysicsEngine;
    private havokPlugin?: HavokPlugin;

    // Material presets
    private materialProperties: Map<PhysicsMaterial, PhysicsMaterialProperties> = new Map();

    // Physics objects
    private physicsObjects: Map<AbstractMesh, PhysicsImpostor> = new Map();

    // Ball physics
    private activeBalls: Map<string, {
        mesh: AbstractMesh;
        impostor: PhysicsImpostor;
        spin: Vector3;
        properties: BallPhysicsProperties;
    }> = new Map();

    // Collision tracking
    private collisionHistory: Map<string, CollisionEvent> = new Map();
    private maxCollisionHistory: number = 100;

    // Observables
    private onCollisionObservable: Observable<CollisionEvent> = new Observable();
    private onBallHitObservable: Observable<{ ball: AbstractMesh; bat: AbstractMesh; velocity: Vector3 }> = new Observable();

    // Trigger zones
    private triggerZones: Map<string, TriggerZone> = new Map();

    // Force fields
    private forceFields: Map<string, ForceField> = new Map();

    // Cloth simulations
    private clothSimulations: Map<string, ClothSimulation> = new Map();

    // Settings
    private gravity: Vector3 = new Vector3(0, -9.81, 0);
    private timeStep: number = 1 / 60;
    private subSteps: number = 1;
    private windForce: Vector3 = Vector3.Zero();

    // Performance
    private enabled: boolean = true;
    private ballPhysicsEnabled: boolean = true;
    private clothPhysicsEnabled: boolean = false;

    constructor(scene: Scene) {
        this.scene = scene;
        this.initializeMaterialPresets();
        this.initializePhysics();
    }

    /**
     * Initialize physics engine
     */
    private async initializePhysics(): Promise<void> {
        try {
            const havokInstance = await HavokPhysics();
            this.havokPlugin = new HavokPlugin(true, havokInstance);

            this.physicsEngine = new PhysicsEngine(this.gravity, this.havokPlugin);
            this.scene.enablePhysics(this.gravity, this.havokPlugin);

            console.log('Havok physics initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Havok physics:', error);
        }
    }

    /**
     * Initialize material presets
     */
    private initializeMaterialPresets(): void {
        this.materialProperties.set(PhysicsMaterial.WOOD, {
            friction: 0.5,
            restitution: 0.4,
            mass: 1.0,
            linearDamping: 0.1,
            angularDamping: 0.1
        });

        this.materialProperties.set(PhysicsMaterial.METAL, {
            friction: 0.3,
            restitution: 0.3,
            mass: 5.0,
            linearDamping: 0.05,
            angularDamping: 0.05
        });

        this.materialProperties.set(PhysicsMaterial.RUBBER, {
            friction: 0.9,
            restitution: 0.8,
            mass: 0.5,
            linearDamping: 0.2,
            angularDamping: 0.2
        });

        this.materialProperties.set(PhysicsMaterial.LEATHER, {
            friction: 0.6,
            restitution: 0.3,
            mass: 0.8,
            linearDamping: 0.15,
            angularDamping: 0.15
        });

        this.materialProperties.set(PhysicsMaterial.DIRT, {
            friction: 0.8,
            restitution: 0.2,
            mass: 1.5,
            linearDamping: 0.4,
            angularDamping: 0.3
        });

        this.materialProperties.set(PhysicsMaterial.GRASS, {
            friction: 0.7,
            restitution: 0.3,
            mass: 1.0,
            linearDamping: 0.3,
            angularDamping: 0.2
        });

        this.materialProperties.set(PhysicsMaterial.ICE, {
            friction: 0.05,
            restitution: 0.5,
            mass: 1.0,
            linearDamping: 0.01,
            angularDamping: 0.01
        });

        this.materialProperties.set(PhysicsMaterial.CONCRETE, {
            friction: 0.6,
            restitution: 0.4,
            mass: 10.0,
            linearDamping: 0.1,
            angularDamping: 0.1
        });

        this.materialProperties.set(PhysicsMaterial.PLASTIC, {
            friction: 0.4,
            restitution: 0.6,
            mass: 0.3,
            linearDamping: 0.1,
            angularDamping: 0.1
        });
    }

    /**
     * Create physics impostor for mesh
     */
    public createPhysicsImpostor(
        mesh: AbstractMesh,
        impostorType: number,
        material: PhysicsMaterial,
        options?: any
    ): PhysicsImpostor {
        const materialProps = this.materialProperties.get(material);
        if (!materialProps) {
            throw new Error(`Unknown material: ${material}`);
        }

        const impostorOptions = {
            mass: materialProps.mass,
            friction: materialProps.friction,
            restitution: materialProps.restitution,
            ...options
        };

        const impostor = new PhysicsImpostor(
            mesh,
            impostorType,
            impostorOptions,
            this.scene
        );

        // Set damping
        impostor.physicsBody.setDamping(
            materialProps.linearDamping,
            materialProps.angularDamping
        );

        this.physicsObjects.set(mesh, impostor);

        return impostor;
    }

    /**
     * Create baseball physics
     */
    public createBaseball(
        mesh: AbstractMesh,
        properties?: Partial<BallPhysicsProperties>
    ): string {
        const ballId = `ball_${this.activeBalls.size}`;

        const defaultProps: BallPhysicsProperties = {
            mass: 0.145, // kg (MLB regulation)
            radius: 0.0366, // meters (MLB regulation)
            restitution: 0.55,
            drag: 0.2,
            magnusCoefficient: 0.00043,
            spinDecay: 0.98,
            airDensity: 1.225
        };

        const ballProps = { ...defaultProps, ...properties };

        // Create impostor
        const impostor = new PhysicsImpostor(
            mesh,
            PhysicsImpostor.SphereImpostor,
            {
                mass: ballProps.mass,
                restitution: ballProps.restitution,
                friction: 0.1
            },
            this.scene
        );

        // Track ball
        this.activeBalls.set(ballId, {
            mesh,
            impostor,
            spin: Vector3.Zero(),
            properties: ballProps
        });

        this.physicsObjects.set(mesh, impostor);

        return ballId;
    }

    /**
     * Apply force to ball with spin
     */
    public hitBall(
        ballId: string,
        velocity: Vector3,
        spin: Vector3,
        contactPoint?: Vector3
    ): void {
        const ball = this.activeBalls.get(ballId);
        if (!ball) return;

        // Apply velocity
        ball.impostor.setLinearVelocity(velocity);

        // Apply spin (stored for Magnus effect)
        ball.spin = spin.clone();

        // Apply angular velocity
        const angularVel = spin.scale(0.01); // Convert to radians/s
        ball.impostor.setAngularVelocity(angularVel);

        // If contact point specified, apply torque
        if (contactPoint) {
            const center = ball.mesh.position;
            const offset = contactPoint.subtract(center);
            const torque = Vector3.Cross(offset, velocity).scale(0.1);
            ball.impostor.applyImpulse(Vector3.Zero(), torque);
        }
    }

    /**
     * Update ball physics (Magnus effect, drag)
     */
    private updateBallPhysics(deltaTime: number): void {
        if (!this.ballPhysicsEnabled) return;

        for (const ball of this.activeBalls.values()) {
            const velocity = ball.impostor.getLinearVelocity();
            if (!velocity) continue;

            const speed = velocity.length();
            if (speed < 0.1) continue;

            const velocityDir = velocity.normalize();

            // Air drag force
            const dragMagnitude = 0.5 * ball.properties.airDensity *
                                 speed * speed *
                                 Math.PI * ball.properties.radius * ball.properties.radius *
                                 ball.properties.drag;

            const dragForce = velocityDir.scale(-dragMagnitude);

            // Magnus force (spin effect)
            const magnusForce = Vector3.Cross(ball.spin, velocity).scale(
                ball.properties.magnusCoefficient * ball.properties.airDensity
            );

            // Combined force
            const totalForce = dragForce.add(magnusForce).add(this.windForce);

            // Apply force
            ball.impostor.applyForce(
                totalForce.scale(ball.properties.mass),
                ball.mesh.position
            );

            // Spin decay
            ball.spin.scaleInPlace(ball.properties.spinDecay);

            // Update angular velocity based on spin
            const angularVel = ball.spin.scale(0.01);
            ball.impostor.setAngularVelocity(angularVel);
        }
    }

    /**
     * Create trigger zone
     */
    public createTriggerZone(
        id: string,
        mesh: AbstractMesh,
        group: CollisionGroup,
        callbacks?: {
            onEnter?: (other: AbstractMesh) => void;
            onStay?: (other: AbstractMesh) => void;
            onExit?: (other: AbstractMesh) => void;
        }
    ): void {
        // Make mesh a trigger (no physical collision)
        const impostor = new PhysicsImpostor(
            mesh,
            PhysicsImpostor.BoxImpostor,
            {
                mass: 0,
                restitution: 0
            },
            this.scene
        );

        impostor.physicsBody.disablePreStep = false;

        const zone: TriggerZone = {
            id,
            mesh,
            group,
            onEnter: callbacks?.onEnter,
            onStay: callbacks?.onStay,
            onExit: callbacks?.onExit,
            activeObjects: new Set()
        };

        this.triggerZones.set(id, zone);
    }

    /**
     * Update trigger zones
     */
    private updateTriggerZones(): void {
        for (const zone of this.triggerZones.values()) {
            const currentObjects = new Set<AbstractMesh>();

            // Check all physics objects
            for (const mesh of this.physicsObjects.keys()) {
                if (this.isInsideTrigger(mesh, zone.mesh)) {
                    currentObjects.add(mesh);

                    // Check if just entered
                    if (!zone.activeObjects.has(mesh)) {
                        zone.onEnter?.(mesh);
                    } else {
                        // Still inside
                        zone.onStay?.(mesh);
                    }
                }
            }

            // Check for exits
            for (const mesh of zone.activeObjects) {
                if (!currentObjects.has(mesh)) {
                    zone.onExit?.(mesh);
                }
            }

            zone.activeObjects = currentObjects;
        }
    }

    /**
     * Check if mesh is inside trigger
     */
    private isInsideTrigger(mesh: AbstractMesh, trigger: AbstractMesh): boolean {
        const distance = Vector3.Distance(mesh.position, trigger.position);
        const triggerSize = trigger.getBoundingInfo().boundingSphere.radius;
        return distance < triggerSize;
    }

    /**
     * Create force field
     */
    public createForceField(
        id: string,
        position: Vector3,
        radius: number,
        strength: number,
        type: ForceField['type'],
        options?: {
            direction?: Vector3;
            falloff?: 'linear' | 'quadratic' | 'constant';
        }
    ): void {
        const field: ForceField = {
            id,
            position: position.clone(),
            radius,
            strength,
            type,
            direction: options?.direction?.clone(),
            falloff: options?.falloff || 'linear',
            enabled: true
        };

        this.forceFields.set(id, field);
    }

    /**
     * Update force fields
     */
    private updateForceFields(deltaTime: number): void {
        for (const field of this.forceFields.values()) {
            if (!field.enabled) continue;

            for (const [mesh, impostor] of this.physicsObjects) {
                const distance = Vector3.Distance(mesh.position, field.position);

                if (distance < field.radius) {
                    let forceMagnitude = field.strength;

                    // Apply falloff
                    switch (field.falloff) {
                        case 'linear':
                            forceMagnitude *= (1 - distance / field.radius);
                            break;
                        case 'quadratic':
                            forceMagnitude *= Math.pow(1 - distance / field.radius, 2);
                            break;
                        case 'constant':
                            // No falloff
                            break;
                    }

                    let forceDirection: Vector3;

                    // Calculate force direction based on type
                    switch (field.type) {
                        case 'radial':
                            // Push away from center
                            forceDirection = mesh.position.subtract(field.position).normalize();
                            break;

                        case 'directional':
                            // Fixed direction
                            forceDirection = field.direction || Vector3.Up();
                            break;

                        case 'vortex':
                            // Circular motion
                            const toCenter = field.position.subtract(mesh.position);
                            const tangent = Vector3.Cross(toCenter, Vector3.Up()).normalize();
                            forceDirection = tangent;
                            break;

                        case 'turbulence':
                            // Random direction
                            forceDirection = new Vector3(
                                Math.random() * 2 - 1,
                                Math.random() * 2 - 1,
                                Math.random() * 2 - 1
                            ).normalize();
                            break;
                    }

                    const force = forceDirection.scale(forceMagnitude);
                    impostor.applyForce(force, mesh.position);
                }
            }
        }
    }

    /**
     * Perform raycast
     */
    public raycast(origin: Vector3, direction: Vector3, maxDistance: number = 100): RaycastResult {
        const ray = new Ray(origin, direction, maxDistance);
        const pickInfo = this.scene.pickWithRay(ray);

        if (pickInfo && pickInfo.hit) {
            return {
                hit: true,
                point: pickInfo.pickedPoint || undefined,
                normal: pickInfo.getNormal(true) || undefined,
                distance: pickInfo.distance,
                mesh: pickInfo.pickedMesh || undefined
            };
        }

        return { hit: false };
    }

    /**
     * Perform sphere cast
     */
    public sphereCast(origin: Vector3, radius: number, direction: Vector3, maxDistance: number = 100): RaycastResult[] {
        const results: RaycastResult[] = [];

        // Sample multiple rays in sphere
        const samples = 8;
        for (let i = 0; i < samples; i++) {
            const angle = (i / samples) * Math.PI * 2;
            const offset = new Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );

            const rayOrigin = origin.add(offset);
            const result = this.raycast(rayOrigin, direction, maxDistance);

            if (result.hit) {
                results.push(result);
            }
        }

        return results;
    }

    /**
     * Create cloth simulation
     */
    public createClothSimulation(
        id: string,
        mesh: Mesh,
        resolution: number = 10,
        stiffness: number = 0.9,
        damping: number = 0.1
    ): void {
        // Create node grid
        const nodes: ClothNode[][] = [];

        for (let y = 0; y < resolution; y++) {
            nodes[y] = [];
            for (let x = 0; x < resolution; x++) {
                const t = {
                    x: x / (resolution - 1),
                    y: y / (resolution - 1)
                };

                nodes[y][x] = {
                    position: new Vector3(t.x - 0.5, t.y - 0.5, 0),
                    velocity: Vector3.Zero(),
                    mass: 0.1,
                    fixed: y === 0, // Fix top row
                    forces: Vector3.Zero()
                };
            }
        }

        const cloth: ClothSimulation = {
            id,
            mesh,
            nodes,
            stiffness,
            damping,
            gravity: 9.81,
            enabled: true
        };

        this.clothSimulations.set(id, cloth);
    }

    /**
     * Update cloth simulations
     */
    private updateClothSimulations(deltaTime: number): void {
        if (!this.clothPhysicsEnabled) return;

        for (const cloth of this.clothSimulations.values()) {
            if (!cloth.enabled) continue;

            const dt = Math.min(deltaTime, 0.016); // Cap at 60 FPS

            // Apply forces
            for (let y = 0; y < cloth.nodes.length; y++) {
                for (let x = 0; x < cloth.nodes[y].length; x++) {
                    const node = cloth.nodes[y][x];
                    if (node.fixed) continue;

                    // Reset forces
                    node.forces = new Vector3(0, -cloth.gravity * node.mass, 0);

                    // Wind force
                    node.forces.addInPlace(this.windForce.scale(node.mass));

                    // Spring forces to neighbors
                    const neighbors = [
                        [y - 1, x], [y + 1, x],
                        [y, x - 1], [y, x + 1]
                    ];

                    for (const [ny, nx] of neighbors) {
                        if (ny >= 0 && ny < cloth.nodes.length &&
                            nx >= 0 && nx < cloth.nodes[ny].length) {
                            const neighbor = cloth.nodes[ny][nx];
                            const delta = neighbor.position.subtract(node.position);
                            const distance = delta.length();
                            const restLength = 1 / (cloth.nodes.length - 1);

                            // Spring force
                            const force = delta.normalize().scale(
                                (distance - restLength) * cloth.stiffness
                            );

                            node.forces.addInPlace(force);
                        }
                    }
                }
            }

            // Integrate
            for (let y = 0; y < cloth.nodes.length; y++) {
                for (let x = 0; x < cloth.nodes[y].length; x++) {
                    const node = cloth.nodes[y][x];
                    if (node.fixed) continue;

                    // Verlet integration
                    const acceleration = node.forces.scale(1 / node.mass);
                    node.velocity.addInPlace(acceleration.scale(dt));
                    node.velocity.scaleInPlace(1 - cloth.damping);
                    node.position.addInPlace(node.velocity.scale(dt));
                }
            }

            // Update mesh vertices
            this.updateClothMesh(cloth);
        }
    }

    /**
     * Update cloth mesh vertices
     */
    private updateClothMesh(cloth: ClothSimulation): void {
        const positions = cloth.mesh.getVerticesData(VertexBuffer.PositionKind);
        if (!positions) return;

        let index = 0;
        for (let y = 0; y < cloth.nodes.length; y++) {
            for (let x = 0; x < cloth.nodes[y].length; x++) {
                const node = cloth.nodes[y][x];
                positions[index++] = node.position.x;
                positions[index++] = node.position.y;
                positions[index++] = node.position.z;
            }
        }

        cloth.mesh.updateVerticesData(VertexBuffer.PositionKind, positions);
        cloth.mesh.refreshBoundingInfo();
    }

    /**
     * Set gravity
     */
    public setGravity(gravity: Vector3): void {
        this.gravity = gravity.clone();
        if (this.physicsEngine) {
            this.physicsEngine.setGravity(gravity);
        }
    }

    /**
     * Set wind force
     */
    public setWindForce(wind: Vector3): void {
        this.windForce = wind.clone();
    }

    /**
     * Get ball velocity
     */
    public getBallVelocity(ballId: string): Vector3 | null {
        const ball = this.activeBalls.get(ballId);
        return ball ? ball.impostor.getLinearVelocity() : null;
    }

    /**
     * Get ball spin
     */
    public getBallSpin(ballId: string): Vector3 | null {
        const ball = this.activeBalls.get(ballId);
        return ball ? ball.spin.clone() : null;
    }

    /**
     * Remove ball
     */
    public removeBall(ballId: string): void {
        const ball = this.activeBalls.get(ballId);
        if (ball) {
            ball.impostor.dispose();
            this.physicsObjects.delete(ball.mesh);
            this.activeBalls.delete(ballId);
        }
    }

    /**
     * Update system
     */
    public update(deltaTime: number): void {
        if (!this.enabled || !this.physicsEngine) return;

        // Update ball physics
        this.updateBallPhysics(deltaTime);

        // Update trigger zones
        this.updateTriggerZones();

        // Update force fields
        this.updateForceFields(deltaTime);

        // Update cloth simulations
        this.updateClothSimulations(deltaTime);
    }

    /**
     * Subscribe to collisions
     */
    public onCollision(callback: (event: CollisionEvent) => void): void {
        this.onCollisionObservable.add(callback);
    }

    /**
     * Subscribe to ball hits
     */
    public onBallHit(callback: (data: { ball: AbstractMesh; bat: AbstractMesh; velocity: Vector3 }) => void): void {
        this.onBallHitObservable.add(callback);
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Enable/disable ball physics
     */
    public setBallPhysicsEnabled(enabled: boolean): void {
        this.ballPhysicsEnabled = enabled;
    }

    /**
     * Enable/disable cloth physics
     */
    public setClothPhysicsEnabled(enabled: boolean): void {
        this.clothPhysicsEnabled = enabled;
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        // Dispose all impostors
        for (const impostor of this.physicsObjects.values()) {
            impostor.dispose();
        }

        this.physicsObjects.clear();
        this.activeBalls.clear();
        this.triggerZones.clear();
        this.forceFields.clear();
        this.clothSimulations.clear();

        this.onCollisionObservable.clear();
        this.onBallHitObservable.clear();
    }
}
