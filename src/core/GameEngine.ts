import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/loaders";

export interface PlayerAvatar {
  id: string;
  name: string;
  position: string;
  accentColor: string;
}

export interface StadiumConfig {
  id: string;
  name: string;
  skylineColor: string;
}

export type EngineMode = "webgpu" | "webgl";

export class GameEngine {
  private engine: Engine;
  private scene: Scene;
  private camera?: ArcRotateCamera;
  private stadiumId?: string;
  private mode: EngineMode;

  private constructor(engine: Engine, scene: Scene, mode: EngineMode) {
    this.engine = engine;
    this.scene = scene;
    this.mode = mode;
  }

  static async bootstrap(canvas: HTMLCanvasElement): Promise<GameEngine> {
    let engine: Engine;
    let mode: EngineMode = "webgl";

    if (await WebGPUEngine.IsSupportedAsync()) {
      try {
        const webGpuEngine = new WebGPUEngine(canvas, {
          adaptToDeviceRatio: true
        });
        await webGpuEngine.initAsync();
        engine = webGpuEngine;
        mode = "webgpu";
      } catch (error) {
        console.warn("Falling back to WebGL engine", error);
        engine = new Engine(canvas, true);
      }
    } else {
      engine = new Engine(canvas, true);
    }

    const scene = new Scene(engine);
    scene.clearColor = Color3.FromHexString("#081b33").toColor4(1);

    const instance = new GameEngine(engine, scene, mode);
    instance.createBaseLighting();
    instance.attachRenderLoop();
    return instance;
  }

  getScene(): Scene {
    return this.scene;
  }

  getEngineMode(): EngineMode {
    return this.mode;
  }

  loadStadium(stadium: StadiumConfig): void {
    if (this.stadiumId === stadium.id) {
      return;
    }

    this.clearScene();
    this.stadiumId = stadium.id;
    this.createBaseLighting();

    const field = MeshBuilder.CreateGround(
      "field",
      { width: 120, height: 120 },
      this.scene
    );
    field.position = Vector3.Zero();
    field.material = this.createFieldMaterial(stadium.skylineColor);

    this.camera = new ArcRotateCamera(
      "game-camera",
      Math.PI / 2.5,
      Math.PI / 3,
      180,
      new Vector3(0, 30, 0),
      this.scene
    );
    this.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
  }

  spawnPlayers(players: PlayerAvatar[]): void {
    players.forEach((player, index) => {
      const mesh = MeshBuilder.CreateCylinder(
        `avatar-${player.id}`,
        { height: 6, diameter: 2 },
        this.scene
      );
      mesh.position = new Vector3(index * 4 - players.length, 3, 0);
      mesh.material = this.createAccentMaterial(player.accentColor, player.name);
    });
  }

  private createBaseLighting(): void {
    const light = new HemisphericLight("stadium-light", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.9;
    light.diffuse = Color3.White();
    light.groundColor = Color3.FromHexString("#0a1126");
  }

  private createFieldMaterial(color: string): StandardMaterial {
    const material = new StandardMaterial("field-material", this.scene);
    material.diffuseColor = Color3.FromHexString(color);
    material.specularColor = Color3.FromHexString("#183d5d");
    material.emissiveColor = Color3.FromHexString("#0f2d4a").scale(0.2);
    return material;
  }

  private createAccentMaterial(color: string, name: string): StandardMaterial {
    const material = new StandardMaterial(`accent-${name}`, this.scene);
    material.diffuseColor = Color3.FromHexString(color);
    material.specularColor = Color3.Black();
    return material;
  }

  private clearScene(): void {
    this.scene.meshes.slice().forEach((mesh) => mesh.dispose());
    this.scene.materials.slice().forEach((material) => material.dispose());
    this.scene.lights.slice().forEach((light) => light.dispose());
    if (this.camera) {
      this.camera.dispose();
      this.camera = undefined;
    }
  }

  private attachRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
}
