import {
  Scene,
  Mesh,
  Animation,
  Vector3,
  AnimationGroup,
  Skeleton,
  Bone,
  Quaternion
} from "@babylonjs/core";

/**
 * Animation system for player actions
 * Handles batting, pitching, running, and fielding animations
 */

export type AnimationType =
  | "idle"
  | "pitch_windup"
  | "pitch_throw"
  | "bat_stance"
  | "bat_swing"
  | "bat_hit"
  | "bat_miss"
  | "run"
  | "slide"
  | "catch"
  | "throw"
  | "dive"
  | "celebrate";

export class AnimationController {
  private scene: Scene;
  private animationGroups: Map<string, Map<AnimationType, AnimationGroup>> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Load animations for a character mesh
   */
  public loadAnimationsForCharacter(characterId: string, mesh: Mesh): void {
    const animations = new Map<AnimationType, AnimationGroup>();

    // If mesh has skeleton (from loaded model), animations are already there
    // Otherwise, create procedural animations

    if (mesh.skeleton) {
      // Use loaded animations from GLB/GLTF model
      this.scene.animationGroups.forEach(group => {
        const animType = this.mapAnimationName(group.name);
        if (animType) {
          animations.set(animType, group);
        }
      });
    } else {
      // Create procedural animations for simple meshes
      animations.set("idle", this.createIdleAnimation(mesh));
      animations.set("pitch_windup", this.createPitchWindupAnimation(mesh));
      animations.set("pitch_throw", this.createPitchThrowAnimation(mesh));
      animations.set("bat_stance", this.createBatStanceAnimation(mesh));
      animations.set("bat_swing", this.createBatSwingAnimation(mesh));
      animations.set("bat_hit", this.createBatHitAnimation(mesh));
      animations.set("bat_miss", this.createBatMissAnimation(mesh));
      animations.set("run", this.createRunAnimation(mesh));
      animations.set("catch", this.createCatchAnimation(mesh));
      animations.set("throw", this.createThrowAnimation(mesh));
      animations.set("celebrate", this.createCelebrationAnimation(mesh));
    }

    this.animationGroups.set(characterId, animations);
  }

  /**
   * Play animation for a character
   */
  public playAnimation(
    characterId: string,
    animType: AnimationType,
    loop: boolean = false,
    onComplete?: () => void
  ): void {
    const animations = this.animationGroups.get(characterId);
    if (!animations) return;

    // Stop all current animations for this character
    animations.forEach(anim => anim.stop());

    // Play requested animation
    const animation = animations.get(animType);
    if (animation) {
      animation.play(loop);

      if (onComplete) {
        animation.onAnimationGroupEndObservable.addOnce(onComplete);
      }
    }
  }

  /**
   * Stop animation for a character
   */
  public stopAnimation(characterId: string, animType?: AnimationType): void {
    const animations = this.animationGroups.get(characterId);
    if (!animations) return;

    if (animType) {
      animations.get(animType)?.stop();
    } else {
      animations.forEach(anim => anim.stop());
    }
  }

  /**
   * Map animation name from model to our type system
   */
  private mapAnimationName(name: string): AnimationType | null {
    const nameLower = name.toLowerCase();

    if (nameLower.includes("idle") || nameLower.includes("stand")) return "idle";
    if (nameLower.includes("pitch") && nameLower.includes("windup")) return "pitch_windup";
    if (nameLower.includes("pitch") && nameLower.includes("throw")) return "pitch_throw";
    if (nameLower.includes("bat") && nameLower.includes("stance")) return "bat_stance";
    if (nameLower.includes("swing")) return "bat_swing";
    if (nameLower.includes("run")) return "run";
    if (nameLower.includes("slide")) return "slide";
    if (nameLower.includes("catch")) return "catch";
    if (nameLower.includes("throw")) return "throw";
    if (nameLower.includes("dive")) return "dive";
    if (nameLower.includes("celebrate")) return "celebrate";

    return null;
  }

  // ========================================
  // PROCEDURAL ANIMATION CREATORS
  // ========================================

  /**
   * Create idle animation (gentle bobbing)
   */
  private createIdleAnimation(mesh: Mesh): AnimationGroup {
    const group = new AnimationGroup("idle", this.scene);

    const bobbing = new Animation(
      "idleBob",
      "position.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const startY = mesh.position.y;
    bobbing.setKeys([
      { frame: 0, value: startY },
      { frame: 15, value: startY + 0.05 },
      { frame: 30, value: startY }
    ]);

    group.addTargetedAnimation(bobbing, mesh);
    group.normalize(0, 30);

    return group;
  }

  /**
   * Create pitch windup animation
   */
  private createPitchWindupAnimation(mesh: Mesh): AnimationGroup {
    const group = new AnimationGroup("pitch_windup", this.scene);

    // Lean back
    const leanBack = new Animation(
      "windupLean",
      "rotation.x",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    leanBack.setKeys([
      { frame: 0, value: 0 },
      { frame: 20, value: -0.3 },
      { frame: 30, value: -0.4 }
    ]);

    // Lift leg
    const liftLeg = new Animation(
      "windupLift",
      "position.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const startY = mesh.position.y;
    liftLeg.setKeys([
      { frame: 0, value: startY },
      { frame: 15, value: startY + 0.3 },
      { frame: 30, value: startY + 0.5 }
    ]);

    group.addTargetedAnimation(leanBack, mesh);
    group.addTargetedAnimation(liftLeg, mesh);
    group.normalize(0, 30);

    return group;
  }

  /**
   * Create pitch throw animation
   */
  private createPitchThrowAnimation(mesh: Mesh): AnimationGroup {
    const group = new AnimationGroup("pitch_throw", this.scene);

    // Forward motion
    const throwForward = new Animation(
      "throwForward",
      "position.z",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const startZ = mesh.position.z;
    throwForward.setKeys([
      { frame: 0, value: startZ },
      { frame: 10, value: startZ - 1.5 },
      { frame: 30, value: startZ }
    ]);

    // Rotation (follow through)
    const followThrough = new Animation(
      "throwRotation",
      "rotation.x",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    followThrough.setKeys([
      { frame: 0, value: -0.4 },
      { frame: 10, value: 0.3 },
      { frame: 30, value: 0 }
    ]);

    group.addTargetedAnimation(throwForward, mesh);
    group.addTargetedAnimation(followThrough, mesh);
    group.normalize(0, 30);

    return group;
  }

  /**
   * Create batting stance animation
   */
  private createBatStanceAnimation(mesh: Mesh): AnimationGroup {
    const group = new AnimationGroup("bat_stance", this.scene);

    // Slight weight shift
    const weightShift = new Animation(
      "stanceShift",
      "rotation.z",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    weightShift.setKeys([
      { frame: 0, value: 0 },
      { frame: 15, value: 0.05 },
      { frame: 30, value: 0 }
    ]);

    group.addTargetedAnimation(weightShift, mesh);
    group.normalize(0, 30);

    return group;
  }

  /**
   * Create bat swing animation
   */
  private createBatSwingAnimation(mesh: Mesh): AnimationGroup {
    const group = new AnimationGroup("bat_swing", this.scene);

    // Hip rotation (full swing)
    const hipRotation = new Animation(
      "swingRotation",
      "rotation.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const startRot = mesh.rotation.y;
    hipRotation.setKeys([
      { frame: 0, value: startRot },
      { frame: 5, value: startRot - 0.2 },  // Load
      { frame: 15, value: startRot + 1.5 }, // Swing through
      { frame: 30, value: startRot + 1.8 }  // Follow through
    ]);

    // Weight transfer
    const weightTransfer = new Animation(
      "swingWeight",
      "position.x",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const startX = mesh.position.x;
    weightTransfer.setKeys([
      { frame: 0, value: startX },
      { frame: 5, value: startX - 0.2 },
      { frame: 15, value: startX + 0.3 },
      { frame: 30, value: startX + 0.2 }
    ]);

    group.addTargetedAnimation(hipRotation, mesh);
    group.addTargetedAnimation(weightTransfer, mesh);
    group.normalize(0, 30);

    return group;
  }

  /**
   * Create successful hit animation
   */
  private createBatHitAnimation(mesh: Mesh): AnimationGroup {
    // Similar to swing but with slight recoil on contact
    const group = this.createBatSwingAnimation(mesh);
    group.name = "bat_hit";
    return group;
  }

  /**
   * Create swing and miss animation
   */
  private createBatMissAnimation(mesh: Mesh): AnimationGroup {
    // Similar to swing but with off-balance follow through
    const group = this.createBatSwingAnimation(mesh);

    // Add stumble
    const stumble = new Animation(
      "missStumble",
      "rotation.z",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    stumble.setKeys([
      { frame: 0, value: 0 },
      { frame: 15, value: 0 },
      { frame: 25, value: -0.2 },
      { frame: 30, value: -0.1 }
    ]);

    group.addTargetedAnimation(stumble, mesh);
    group.name = "bat_miss";

    return group;
  }

  /**
   * Create running animation
   */
  private createRunAnimation(mesh: Mesh): AnimationGroup {
    const group = new AnimationGroup("run", this.scene);

    // Bobbing motion
    const bobbing = new Animation(
      "runBob",
      "position.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const startY = mesh.position.y;
    bobbing.setKeys([
      { frame: 0, value: startY },
      { frame: 8, value: startY + 0.1 },
      { frame: 15, value: startY },
      { frame: 23, value: startY + 0.1 },
      { frame: 30, value: startY }
    ]);

    // Forward lean
    const lean = new Animation(
      "runLean",
      "rotation.x",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    lean.setKeys([
      { frame: 0, value: 0.2 },
      { frame: 30, value: 0.2 }
    ]);

    group.addTargetedAnimation(bobbing, mesh);
    group.addTargetedAnimation(lean, mesh);
    group.normalize(0, 30);

    return group;
  }

  /**
   * Create catch animation
   */
  private createCatchAnimation(mesh: Mesh): AnimationGroup {
    const group = new AnimationGroup("catch", this.scene);

    // Reach up
    const reach = new Animation(
      "catchReach",
      "position.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const startY = mesh.position.y;
    reach.setKeys([
      { frame: 0, value: startY },
      { frame: 10, value: startY + 0.5 },
      { frame: 20, value: startY + 0.3 },
      { frame: 30, value: startY }
    ]);

    // Glove close motion (scale)
    const closeGlove = new Animation(
      "catchClose",
      "scaling.x",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    closeGlove.setKeys([
      { frame: 0, value: 1 },
      { frame: 10, value: 1.1 },
      { frame: 15, value: 0.95 },
      { frame: 30, value: 1 }
    ]);

    group.addTargetedAnimation(reach, mesh);
    group.addTargetedAnimation(closeGlove, mesh);
    group.normalize(0, 30);

    return group;
  }

  /**
   * Create throw animation
   */
  private createThrowAnimation(mesh: Mesh): AnimationGroup {
    const group = new AnimationGroup("throw", this.scene);

    // Wind up
    const windUp = new Animation(
      "throwWindUp",
      "rotation.x",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    windUp.setKeys([
      { frame: 0, value: 0 },
      { frame: 10, value: -0.3 },
      { frame: 20, value: 0.3 },
      { frame: 30, value: 0 }
    ]);

    // Follow through
    const followThrough = new Animation(
      "throwFollow",
      "position.z",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const startZ = mesh.position.z;
    followThrough.setKeys([
      { frame: 0, value: startZ },
      { frame: 15, value: startZ - 0.5 },
      { frame: 30, value: startZ }
    ]);

    group.addTargetedAnimation(windUp, mesh);
    group.addTargetedAnimation(followThrough, mesh);
    group.normalize(0, 30);

    return group;
  }

  /**
   * Create celebration animation
   */
  private createCelebrationAnimation(mesh: Mesh): AnimationGroup {
    const group = new AnimationGroup("celebrate", this.scene);

    // Jump
    const jump = new Animation(
      "celebrateJump",
      "position.y",
      60,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const startY = mesh.position.y;
    jump.setKeys([
      { frame: 0, value: startY },
      { frame: 15, value: startY + 1.0 },
      { frame: 30, value: startY },
      { frame: 45, value: startY + 0.8 },
      { frame: 60, value: startY }
    ]);

    // Spin
    const spin = new Animation(
      "celebrateSpin",
      "rotation.y",
      60,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const startRot = mesh.rotation.y;
    spin.setKeys([
      { frame: 0, value: startRot },
      { frame: 30, value: startRot + Math.PI },
      { frame: 60, value: startRot + Math.PI * 2 }
    ]);

    group.addTargetedAnimation(jump, mesh);
    group.addTargetedAnimation(spin, mesh);
    group.normalize(0, 60);

    return group;
  }

  /**
   * Blend between two animations
   */
  public blendAnimation(
    characterId: string,
    fromAnim: AnimationType,
    toAnim: AnimationType,
    blendTime: number = 0.3
  ): void {
    // Simple crossfade between animations
    const animations = this.animationGroups.get(characterId);
    if (!animations) return;

    const from = animations.get(fromAnim);
    const to = animations.get(toAnim);

    if (from && to) {
      // Fade out current
      from.stop();

      // Fade in new
      to.play(false);
    }
  }

  /**
   * Dispose animations for a character
   */
  public disposeCharacterAnimations(characterId: string): void {
    const animations = this.animationGroups.get(characterId);
    if (animations) {
      animations.forEach(anim => anim.dispose());
      this.animationGroups.delete(characterId);
    }
  }

  /**
   * Dispose all animations
   */
  public dispose(): void {
    this.animationGroups.forEach(animations => {
      animations.forEach(anim => anim.dispose());
    });
    this.animationGroups.clear();
  }
}
