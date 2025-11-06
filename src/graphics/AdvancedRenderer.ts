import {
  Scene,
  Engine,
  DirectionalLight,
  ShadowGenerator,
  Vector3,
  Color3,
  Color4,
  PBRMaterial,
  Texture,
  CubeTexture,
  StandardMaterial,
  Mesh,
  ImageProcessingConfiguration,
  DefaultRenderingPipeline,
  DepthOfFieldEffectBlurLevel,
  SSAORenderingPipeline,
  RefractionTexture,
  HDRCubeTexture,
  GlowLayer
} from "@babylonjs/core";

/**
 * Advanced rendering system with PBR materials, post-processing, and lighting
 * Inspired by Backyard Baseball 2001's vibrant, stylized look but with modern tech
 */
export class AdvancedRenderer {
  private scene: Scene;
  private engine: Engine;
  private sunLight: DirectionalLight | null = null;
  private shadowGenerator: ShadowGenerator | null = null;
  private pipeline: DefaultRenderingPipeline | null = null;
  private glowLayer: GlowLayer | null = null;

  constructor(scene: Scene, engine: Engine) {
    this.scene = scene;
    this.engine = engine;
    this.setupEnvironment();
    this.setupLighting();
    this.setupPostProcessing();
  }

  /**
   * Set up the environment and atmosphere
   */
  private setupEnvironment(): void {
    // Clear color (sky blue for default outdoor field)
    this.scene.clearColor = new Color4(0.53, 0.81, 0.92, 1.0);

    // Enable HDR
    this.scene.imageProcessingConfiguration.toneMappingEnabled = true;
    this.scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
    this.scene.imageProcessingConfiguration.exposure = 1.2;
    this.scene.imageProcessingConfiguration.contrast = 1.1;

    // Enhance colors for that vibrant Backyard Baseball look
    this.scene.imageProcessingConfiguration.colorCurvesEnabled = true;
    if (this.scene.imageProcessingConfiguration.colorCurves) {
      this.scene.imageProcessingConfiguration.colorCurves.globalSaturation = 1.3;
      this.scene.imageProcessingConfiguration.colorCurves.globalExposure = 0.2;
    }
  }

  /**
   * Set up realistic lighting with shadows
   */
  private setupLighting(): void {
    // Sun (main directional light)
    this.sunLight = new DirectionalLight(
      "sun",
      new Vector3(-0.5, -1, -0.5),
      this.scene
    );
    this.sunLight.position = new Vector3(50, 100, 50);
    this.sunLight.intensity = 1.5;
    this.sunLight.diffuse = new Color3(1.0, 0.98, 0.95); // Warm sunlight
    this.sunLight.specular = new Color3(1.0, 0.98, 0.9);

    // Shadow generator for realistic shadows
    this.shadowGenerator = new ShadowGenerator(2048, this.sunLight);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 32;
    this.shadowGenerator.darkness = 0.3;
    this.shadowGenerator.bias = 0.00001;

    // Ambient light for fill (prevents pure black shadows)
    const ambient = new DirectionalLight(
      "ambient",
      new Vector3(0, -1, 0),
      this.scene
    );
    ambient.intensity = 0.3;
    ambient.diffuse = new Color3(0.7, 0.8, 1.0); // Cool ambient (sky bounce light)
    ambient.specular = Color3.Black(); // No specular from ambient

    // Enable shadows on the scene
    this.scene.shadowsEnabled = true;
  }

  /**
   * Set up post-processing effects
   */
  private setupPostProcessing(): void {
    // Default rendering pipeline (includes bloom, DOF, etc.)
    this.pipeline = new DefaultRenderingPipeline(
      "default",
      true, // HDR
      this.scene,
      this.scene.cameras
    );

    // Bloom (for that glowy Backyard Baseball aesthetic)
    this.pipeline.bloomEnabled = true;
    this.pipeline.bloomThreshold = 0.8;
    this.pipeline.bloomWeight = 0.3;
    this.pipeline.bloomKernel = 64;
    this.pipeline.bloomScale = 0.5;

    // Chromatic aberration (subtle)
    this.pipeline.chromaticAberrationEnabled = false;

    // Grain (adds texture, very subtle)
    this.pipeline.grainEnabled = true;
    if (this.pipeline.grain) {
      this.pipeline.grain.intensity = 5;
      this.pipeline.grain.animated = true;
    }

    // Sharpen (makes everything crisp)
    this.pipeline.sharpenEnabled = false;

    // Depth of field (cinematic focus during key moments)
    this.pipeline.depthOfFieldEnabled = false; // Enable during replays
    if (this.pipeline.depthOfField) {
      this.pipeline.depthOfField.focusDistance = 2000;
      this.pipeline.depthOfField.focalLength = 150;
      this.pipeline.depthOfField.fStop = 1.4;
      this.pipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Medium;
    }

    // Glow layer for special effects (ball, power-ups, etc.)
    this.glowLayer = new GlowLayer("glow", this.scene);
    this.glowLayer.intensity = 0.5;

    // SSAO for ambient occlusion (optional, performance hit)
    // Uncomment if performance allows
    // const ssao = new SSAORenderingPipeline("ssao", this.scene, 0.75);
    // ssao.totalStrength = 1.0;
    // ssao.radius = 0.5;
  }

  /**
   * Load skybox for stadium atmosphere
   */
  public async loadSkybox(path: string): Promise<void> {
    try {
      // HDR skybox for realistic lighting
      const hdrTexture = CubeTexture.CreateFromPrefilteredData(path, this.scene);
      this.scene.environmentTexture = hdrTexture;
      this.scene.createDefaultSkybox(hdrTexture, true, 1000, 0.3);
    } catch (error) {
      console.warn("Could not load HDR skybox, using fallback", error);
      // Fallback to procedural skybox
      this.createProceduralSkybox();
    }
  }

  /**
   * Create a procedural skybox (fallback)
   */
  private createProceduralSkybox(): void {
    const skybox = Mesh.CreateBox("skyBox", 1000, this.scene);
    const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;

    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.emissiveColor = new Color3(0.53, 0.81, 0.92);
  }

  /**
   * Create PBR material for grass
   */
  public createGrassMaterial(name: string, baseColor: Color3): PBRMaterial {
    const material = new PBRMaterial(name, this.scene);

    // Base color
    material.albedoColor = baseColor;

    // Roughness (grass is not shiny)
    material.roughness = 0.9;
    material.metallic = 0.0;

    // Enable subsurface scattering for realistic grass
    material.subSurface.isTranslucencyEnabled = true;
    material.subSurface.translucencyIntensity = 0.3;
    material.subSurface.tintColor = new Color3(0.2, 0.6, 0.2);

    return material;
  }

  /**
   * Create PBR material for dirt/clay
   */
  public createDirtMaterial(name: string): PBRMaterial {
    const material = new PBRMaterial(name, this.scene);

    // Dirt color
    material.albedoColor = new Color3(0.55, 0.4, 0.25);

    // Roughness (dirt is rough)
    material.roughness = 0.95;
    material.metallic = 0.0;

    // Add bump for texture
    material.bumpTexture = this.createProceduralNoise(512);
    material.bumpTexture.level = 0.5;

    return material;
  }

  /**
   * Create PBR material for baseball
   */
  public createBaseballMaterial(): PBRMaterial {
    const material = new PBRMaterial("baseball", this.scene);

    // White leather
    material.albedoColor = new Color3(0.95, 0.95, 0.95);
    material.roughness = 0.7;
    material.metallic = 0.0;

    // Make it glow slightly when hit
    const bindedMeshes = material.getBindedMeshes();
    if (bindedMeshes.length > 0 && bindedMeshes[0] instanceof Mesh) {
      this.glowLayer?.addIncludedOnlyMesh(bindedMeshes[0] as Mesh);
    }

    return material;
  }

  /**
   * Create stylized character material (Backyard Baseball style)
   */
  public createCharacterMaterial(name: string, mainColor: Color3): PBRMaterial {
    const material = new PBRMaterial(name, this.scene);

    // Slightly cartoon shading with cel-shading approach
    material.albedoColor = mainColor;
    material.roughness = 0.6;
    material.metallic = 0.1;

    // Enable clear coat for glossy look
    material.clearCoat.isEnabled = true;
    material.clearCoat.intensity = 0.3;
    material.clearCoat.roughness = 0.2;

    return material;
  }

  /**
   * Create fence material (wood)
   */
  public createFenceMaterial(): PBRMaterial {
    const material = new PBRMaterial("fence", this.scene);

    material.albedoColor = new Color3(0.4, 0.25, 0.1);
    material.roughness = 0.85;
    material.metallic = 0.0;

    return material;
  }

  /**
   * Add a mesh to cast shadows
   */
  public addShadowCaster(mesh: Mesh): void {
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(mesh);
    }
  }

  /**
   * Enable a mesh to receive shadows
   */
  public enableShadowReceiver(mesh: Mesh): void {
    mesh.receiveShadows = true;
  }

  /**
   * Enable depth of field for cinematic moments
   */
  public enableDepthOfField(focusDistance: number): void {
    if (this.pipeline) {
      this.pipeline.depthOfFieldEnabled = true;
      if (this.pipeline.depthOfField) {
        this.pipeline.depthOfField.focusDistance = focusDistance;
      }
    }
  }

  /**
   * Disable depth of field
   */
  public disableDepthOfField(): void {
    if (this.pipeline) {
      this.pipeline.depthOfFieldEnabled = false;
    }
  }

  /**
   * Add glow to a mesh (for special effects)
   */
  public addGlow(mesh: Mesh, intensity: number = 0.5): void {
    if (this.glowLayer) {
      this.glowLayer.addIncludedOnlyMesh(mesh);
      this.glowLayer.intensity = intensity;
    }
  }

  /**
   * Remove glow from a mesh
   */
  public removeGlow(mesh: Mesh): void {
    if (this.glowLayer) {
      this.glowLayer.removeIncludedOnlyMesh(mesh);
    }
  }

  /**
   * Set time of day lighting
   */
  public setTimeOfDay(hour: number): void {
    if (!this.sunLight) return;

    // Hour is 0-23
    const dayProgress = hour / 24;

    if (hour >= 6 && hour < 20) {
      // Daytime (6 AM - 8 PM)
      const dayFactor = Math.sin((hour - 6) / 14 * Math.PI);
      this.sunLight.intensity = 0.8 + dayFactor * 0.7;

      // Color changes throughout day
      if (hour < 10) {
        // Morning (golden hour)
        this.sunLight.diffuse = new Color3(1.0, 0.9, 0.7);
      } else if (hour < 17) {
        // Midday
        this.sunLight.diffuse = new Color3(1.0, 0.98, 0.95);
      } else {
        // Evening (golden hour)
        this.sunLight.diffuse = new Color3(1.0, 0.7, 0.4);
      }
    } else {
      // Night (enable stadium lights instead)
      this.sunLight.intensity = 0.1;
      this.sunLight.diffuse = new Color3(0.3, 0.3, 0.5);
    }
  }

  /**
   * Create procedural noise texture for bump maps
   */
  private createProceduralNoise(size: number): Texture {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.random() * 255;
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new Texture(canvas.toDataURL(), this.scene);
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.WRAP_ADDRESSMODE;

    return texture;
  }

  /**
   * Update rendering settings for mobile vs desktop
   */
  public optimizeForPlatform(isMobile: boolean): void {
    if (!this.pipeline) return;

    if (isMobile) {
      // Reduce quality for mobile
      this.pipeline.bloomEnabled = false;
      this.pipeline.grainEnabled = false;
      if (this.shadowGenerator) {
        this.shadowGenerator.mapSize = 1024;
      }
      if (this.glowLayer) {
        this.glowLayer.intensity = 0.3;
      }
    } else {
      // Full quality for desktop
      this.pipeline.bloomEnabled = true;
      this.pipeline.grainEnabled = true;
      if (this.shadowGenerator) {
        this.shadowGenerator.mapSize = 2048;
      }
      if (this.glowLayer) {
        this.glowLayer.intensity = 0.5;
      }
    }
  }

  /**
   * Dispose of all rendering resources
   */
  public dispose(): void {
    this.pipeline?.dispose();
    this.glowLayer?.dispose();
    this.shadowGenerator?.dispose();
    this.sunLight?.dispose();
  }
}
