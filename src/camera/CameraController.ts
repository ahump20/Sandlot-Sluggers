import {
  Scene,
  ArcRotateCamera,
  TargetCamera,
  Vector3,
  Animation,
  Camera,
  Mesh
} from "@babylonjs/core";

/**
 * Advanced camera system with cinematic views
 * Inspired by Backyard Baseball's dynamic camera angles
 */
export class CameraController {
  private scene: Scene;
  private mainCamera: ArcRotateCamera;
  private pitchCamera: TargetCamera | null = null;
  private hitCamera: TargetCamera | null = null;
  private currentView: "overview" | "pitch" | "hit" | "fielding" | "replay" = "overview";

  private ballMesh: Mesh | null = null;
  private batterPosition: Vector3 = Vector3.Zero();
  private pitcherPosition: Vector3 = new Vector3(0, 0, 18.44);

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.scene = scene;

    // Main arc rotate camera (overview)
    this.mainCamera = new ArcRotateCamera(
      "mainCamera",
      -Math.PI / 2, // Alpha (horizontal rotation)
      Math.PI / 3,  // Beta (vertical angle)
      50,           // Radius (distance)
      new Vector3(0, 5, 15), // Target (slightly behind home plate)
      scene
    );

    this.mainCamera.attachControl(canvas, true);
    this.mainCamera.lowerRadiusLimit = 15;
    this.mainCamera.upperRadiusLimit = 80;
    this.mainCamera.lowerBetaLimit = 0.1;
    this.mainCamera.upperBetaLimit = Math.PI / 2 - 0.1;

    // Smooth camera movement
    this.mainCamera.inertia = 0.7;
    this.mainCamera.angularSensibilityX = 1000;
    this.mainCamera.angularSensibilityY = 1000;
    this.mainCamera.wheelPrecision = 20;

    // Set as active camera
    scene.activeCamera = this.mainCamera;
  }

  /**
   * Set the ball mesh to track during flight
   */
  public setBall(ball: Mesh): void {
    this.ballMesh = ball;
  }

  /**
   * Set batter position for camera targeting
   */
  public setBatterPosition(position: Vector3): void {
    this.batterPosition = position;
  }

  /**
   * Set pitcher position for camera targeting
   */
  public setPitcherPosition(position: Vector3): void {
    this.pitcherPosition = position;
  }

  /**
   * Switch to pitch view (behind pitcher looking at batter)
   */
  public toPitchView(duration: number = 1000): void {
    if (this.currentView === "pitch") return;

    this.currentView = "pitch";

    // Animate camera to behind pitcher position
    const targetPosition = this.pitcherPosition.add(new Vector3(0, 8, 5));
    const lookAtTarget = this.batterPosition;

    this.animateToPosition(targetPosition, lookAtTarget, duration);
  }

  /**
   * Switch to batting view (behind batter looking at pitcher)
   */
  public toBattingView(duration: number = 800): void {
    if (this.currentView === "pitch") return;

    this.currentView = "pitch";

    // Animate camera to behind batter position
    const targetPosition = this.batterPosition.add(new Vector3(0, 5, -8));
    const lookAtTarget = this.pitcherPosition;

    this.animateToPosition(targetPosition, lookAtTarget, duration);
  }

  /**
   * Follow the ball during flight
   */
  public followBall(startTracking: boolean = true): void {
    if (!this.ballMesh) return;

    if (startTracking) {
      this.currentView = "hit";

      // Smooth ball tracking
      this.scene.onBeforeRenderObservable.add(() => {
        if (!this.ballMesh || this.currentView !== "hit") return;

        const ballPos = this.ballMesh.position;

        // Smoothly move camera to follow ball
        const targetAlpha = Math.atan2(ballPos.x, ballPos.z);
        const targetBeta = Math.atan2(
          Math.sqrt(ballPos.x * ballPos.x + ballPos.z * ballPos.z),
          ballPos.y + 5
        );
        const targetRadius = Math.min(60, Vector3.Distance(ballPos, Vector3.Zero()) + 20);

        // Smooth interpolation
        this.mainCamera.alpha += (targetAlpha - this.mainCamera.alpha) * 0.05;
        this.mainCamera.beta += (targetBeta - this.mainCamera.beta) * 0.05;
        this.mainCamera.radius += (targetRadius - this.mainCamera.radius) * 0.05;

        // Update target to ball position
        const currentTarget = this.mainCamera.target;
        this.mainCamera.setTarget(
          currentTarget.add(ballPos.subtract(currentTarget).scale(0.1))
        );
      });
    }
  }

  /**
   * Stop following the ball
   */
  public stopFollowingBall(): void {
    this.scene.onBeforeRenderObservable.clear();
  }

  /**
   * Switch to fielding view (shows fielder making play)
   */
  public toFieldingView(fielderPosition: Vector3, ballPosition: Vector3, duration: number = 600): void {
    this.currentView = "fielding";

    // Calculate midpoint between fielder and ball
    const midpoint = fielderPosition.add(ballPosition).scale(0.5);
    const distance = Vector3.Distance(fielderPosition, ballPosition);

    // Camera position elevated and back from midpoint
    const cameraPos = midpoint.add(new Vector3(0, distance * 0.5, -distance * 0.7));

    this.animateToPosition(cameraPos, midpoint, duration);
  }

  /**
   * Replay camera (cinematic angle)
   */
  public toReplayView(
    focusPoint: Vector3,
    angle: "side" | "high" | "closeup" = "high",
    duration: number = 1000
  ): void {
    this.currentView = "replay";

    let cameraPos: Vector3;

    switch (angle) {
      case "side":
        // Side view (third base line perspective)
        cameraPos = focusPoint.add(new Vector3(-20, 8, 0));
        break;

      case "high":
        // High angle (centerfield camera)
        cameraPos = focusPoint.add(new Vector3(0, 30, 40));
        break;

      case "closeup":
        // Close-up (near the action)
        cameraPos = focusPoint.add(new Vector3(5, 3, -5));
        break;
    }

    this.animateToPosition(cameraPos, focusPoint, duration);
  }

  /**
   * Return to overview camera
   */
  public toOverview(duration: number = 1000): void {
    if (this.currentView === "overview") return;

    this.currentView = "overview";
    this.stopFollowingBall();

    // Return to default overview position
    this.animateMainCamera(
      -Math.PI / 2,
      Math.PI / 3,
      50,
      new Vector3(0, 5, 15),
      duration
    );
  }

  /**
   * Cinematic home run camera
   */
  public homeRunCamera(ballPosition: Vector3): void {
    this.currentView = "replay";

    // Follow ball from behind
    const cameraOffset = new Vector3(0, 5, -15);
    const cameraPos = ballPosition.add(cameraOffset);

    // Smooth follow
    const followAnimation = () => {
      if (!this.ballMesh || !this.ballMesh.position) return;

      const targetPos = this.ballMesh.position.add(cameraOffset);
      const currentTarget = this.mainCamera.target;

      // Smoothly interpolate
      this.mainCamera.setPosition(
        this.mainCamera.position.add(
          targetPos.subtract(this.mainCamera.position).scale(0.1)
        )
      );

      this.mainCamera.setTarget(
        currentTarget.add(
          this.ballMesh.position.subtract(currentTarget).scale(0.1)
        )
      );
    };

    this.scene.onBeforeRenderObservable.add(followAnimation);

    // Stop after 3 seconds
    setTimeout(() => {
      this.scene.onBeforeRenderObservable.removeCallback(followAnimation);
      this.toOverview();
    }, 3000);
  }

  /**
   * Shake camera (for impact moments)
   */
  public shake(intensity: number = 0.5, duration: number = 300): void {
    const originalPos = this.mainCamera.position.clone();
    const shakeInterval = 16; // ~60fps
    const numShakes = duration / shakeInterval;
    let shakeCount = 0;

    const shakeTimer = setInterval(() => {
      if (shakeCount >= numShakes) {
        clearInterval(shakeTimer);
        this.mainCamera.position = originalPos;
        return;
      }

      const offsetX = (Math.random() - 0.5) * intensity;
      const offsetY = (Math.random() - 0.5) * intensity;
      const offsetZ = (Math.random() - 0.5) * intensity;

      this.mainCamera.position = originalPos.add(new Vector3(offsetX, offsetY, offsetZ));
      shakeCount++;
    }, shakeInterval);
  }

  /**
   * Zoom in/out
   */
  public zoom(targetRadius: number, duration: number = 500): void {
    this.animateProperty(
      this.mainCamera,
      "radius",
      this.mainCamera.radius,
      targetRadius,
      duration
    );
  }

  /**
   * Enable/disable user camera control
   */
  public setUserControl(enabled: boolean): void {
    if (enabled) {
      this.mainCamera.attachControl(this.scene.getEngine().getRenderingCanvas()!, true);
    } else {
      this.mainCamera.detachControl();
    }
  }

  /**
   * Get current camera view
   */
  public getCurrentView(): string {
    return this.currentView;
  }

  /**
   * Animate main camera to specific orientation
   */
  private animateMainCamera(
    targetAlpha: number,
    targetBeta: number,
    targetRadius: number,
    targetPosition: Vector3,
    duration: number
  ): void {
    // Disable user control during animation
    this.setUserControl(false);

    // Animate alpha
    this.animateProperty(this.mainCamera, "alpha", this.mainCamera.alpha, targetAlpha, duration);

    // Animate beta
    this.animateProperty(this.mainCamera, "beta", this.mainCamera.beta, targetBeta, duration);

    // Animate radius
    this.animateProperty(this.mainCamera, "radius", this.mainCamera.radius, targetRadius, duration);

    // Animate target
    const targetAnim = new Animation(
      "targetAnim",
      "target",
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    targetAnim.setKeys([
      { frame: 0, value: this.mainCamera.target.clone() },
      { frame: 60, value: targetPosition }
    ]);

    this.mainCamera.animations.push(targetAnim);
    this.scene.beginAnimation(this.mainCamera, 0, 60, false, 1000 / duration, () => {
      // Re-enable user control after animation
      setTimeout(() => this.setUserControl(true), 100);
    });
  }

  /**
   * Animate camera to specific position
   */
  private animateToPosition(position: Vector3, lookAt: Vector3, duration: number): void {
    this.setUserControl(false);

    const posAnim = new Animation(
      "posAnim",
      "position",
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    posAnim.setKeys([
      { frame: 0, value: this.mainCamera.position.clone() },
      { frame: 60, value: position }
    ]);

    const targetAnim = new Animation(
      "targetAnim",
      "target",
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    targetAnim.setKeys([
      { frame: 0, value: this.mainCamera.target.clone() },
      { frame: 60, value: lookAt }
    ]);

    this.mainCamera.animations = [posAnim, targetAnim];
    this.scene.beginAnimation(this.mainCamera, 0, 60, false, 1000 / duration);
  }

  /**
   * Animate a single property
   */
  private animateProperty(
    target: any,
    property: string,
    from: number,
    to: number,
    duration: number
  ): void {
    const anim = new Animation(
      property + "Anim",
      property,
      60,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    anim.setKeys([
      { frame: 0, value: from },
      { frame: 60, value: to }
    ]);

    target.animations = target.animations || [];
    target.animations.push(anim);
    this.scene.beginAnimation(target, 0, 60, false, 1000 / duration);
  }

  /**
   * Dispose camera controller
   */
  public dispose(): void {
    this.stopFollowingBall();
    this.mainCamera.dispose();
    if (this.pitchCamera) this.pitchCamera.dispose();
    if (this.hitCamera) this.hitCamera.dispose();
  }
}
