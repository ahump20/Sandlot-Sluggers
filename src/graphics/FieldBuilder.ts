import {
  Scene,
  MeshBuilder,
  Vector3,
  Color3,
  Mesh,
  StandardMaterial,
  PBRMaterial,
  Texture,
  DynamicTexture,
  Path3D,
  VertexData
} from "@babylonjs/core";
import { AdvancedRenderer } from "./AdvancedRenderer";

/**
 * Builds a realistic baseball field inspired by Backyard Baseball 2001
 * with accurate MLB dimensions and vibrant, stylized graphics
 */
export class FieldBuilder {
  private scene: Scene;
  private renderer: AdvancedRenderer;

  // Standard baseball dimensions (in meters, converted from feet)
  // 1 foot = 0.3048 meters
  private static readonly BASE_DISTANCE = 27.432; // 90 feet
  private static readonly PITCHING_DISTANCE = 18.44; // 60.5 feet
  private static readonly MOUND_HEIGHT = 0.254; // 10 inches
  private static readonly HOME_TO_SECOND = 38.795; // 127 feet 3 3⁄8 inches

  constructor(scene: Scene, renderer: AdvancedRenderer) {
    this.scene = scene;
    this.renderer = renderer;
  }

  /**
   * Build the complete baseball field
   */
  public buildField(
    outfieldDimensions: { left: number; center: number; right: number }
  ): void {
    this.createGrassField(outfieldDimensions);
    this.createInfield();
    this.createBasePaths();
    this.createBases();
    this.createPitchersMound();
    this.createFoulLines();
    this.createOutfieldFence(outfieldDimensions);
    this.createBattersBoxes();
    this.createCoachesBoxes();
    this.createOnDeckCircles();
    this.addFieldDetails();
  }

  /**
   * Create grass field with realistic PBR material
   */
  private createGrassField(dimensions: { left: number; center: number; right: number }): void {
    const maxDimension = Math.max(dimensions.left, dimensions.center, dimensions.right);
    const fieldSize = maxDimension * 2.5; // Extra space beyond fence

    const grass = MeshBuilder.CreateGround("grass", {
      width: fieldSize,
      height: fieldSize,
      subdivisions: 50
    }, this.scene);

    // Apply realistic grass material
    const grassMaterial = this.renderer.createGrassMaterial(
      "grassMat",
      new Color3(0.15, 0.5, 0.15) // Rich grass green
    );
    grass.material = grassMaterial;

    // Enable to receive shadows
    this.renderer.enableShadowReceiver(grass);

    // Add slight variation to grass height for realism
    this.addGrassVariation(grass);
  }

  /**
   * Create infield dirt area
   */
  private createInfield(): void {
    // Create custom shape for infield
    const infieldShape: Vector3[] = [];

    // Home plate area (circular around home)
    const homeRadius = 19.2; // 63 feet circle
    for (let angle = -45; angle <= 45; angle += 5) {
      const rad = (angle * Math.PI) / 180;
      infieldShape.push(new Vector3(
        homeRadius * Math.sin(rad),
        0.05,
        homeRadius * Math.cos(rad)
      ));
    }

    // Connect to first base
    infieldShape.push(new Vector3(FieldBuilder.BASE_DISTANCE, 0.05, FieldBuilder.BASE_DISTANCE));

    // Arc around second base
    const secondBasePos = new Vector3(0, 0.05, FieldBuilder.HOME_TO_SECOND);
    for (let angle = 45; angle <= 135; angle += 5) {
      const rad = (angle * Math.PI) / 180;
      const offset = new Vector3(
        homeRadius * Math.cos(rad),
        0,
        homeRadius * Math.sin(rad)
      );
      infieldShape.push(secondBasePos.add(offset));
    }

    // Connect to third base
    infieldShape.push(new Vector3(-FieldBuilder.BASE_DISTANCE, 0.05, FieldBuilder.BASE_DISTANCE));

    // Back to home
    infieldShape.push(infieldShape[0]);

    // Create the infield mesh
    const infield = MeshBuilder.CreateRibbon("infield", {
      pathArray: [infieldShape, infieldShape.map(p => new Vector3(p.x, 0.051, p.z))],
      closeArray: true,
      closePath: true
    }, this.scene);

    const dirtMaterial = this.renderer.createDirtMaterial("infieldDirt");
    infield.material = dirtMaterial;
    this.renderer.enableShadowReceiver(infield);
  }

  /**
   * Create base paths (dirt paths connecting bases)
   */
  private createBasePaths(): void {
    const pathWidth = 2.0; // meters
    const pathHeight = 0.06;

    const bases = [
      { from: new Vector3(0, 0, 0), to: new Vector3(FieldBuilder.BASE_DISTANCE, 0, FieldBuilder.BASE_DISTANCE) },
      { from: new Vector3(FieldBuilder.BASE_DISTANCE, 0, FieldBuilder.BASE_DISTANCE), to: new Vector3(0, 0, FieldBuilder.HOME_TO_SECOND) },
      { from: new Vector3(0, 0, FieldBuilder.HOME_TO_SECOND), to: new Vector3(-FieldBuilder.BASE_DISTANCE, 0, FieldBuilder.BASE_DISTANCE) },
      { from: new Vector3(-FieldBuilder.BASE_DISTANCE, 0, FieldBuilder.BASE_DISTANCE), to: new Vector3(0, 0, 0) }
    ];

    bases.forEach((path, index) => {
      const direction = path.to.subtract(path.from).normalize();
      const perpendicular = new Vector3(-direction.z, 0, direction.x);

      const pathMesh = MeshBuilder.CreateBox(`basePath${index}`, {
        width: pathWidth,
        height: pathHeight,
        depth: Vector3.Distance(path.from, path.to)
      }, this.scene);

      const midpoint = path.from.add(path.to).scale(0.5);
      midpoint.y = pathHeight / 2;
      pathMesh.position = midpoint;

      // Rotate to align with path
      const angle = Math.atan2(direction.x, direction.z);
      pathMesh.rotation.y = angle;

      const pathMaterial = this.renderer.createDirtMaterial(`basePathMat${index}`);
      pathMesh.material = pathMaterial;
      this.renderer.enableShadowReceiver(pathMesh);
    });
  }

  /**
   * Create bases (home, first, second, third)
   */
  private createBases(): void {
    const baseSize = 0.381; // 15 inches (official MLB base size)
    const baseHeight = 0.127; // 5 inches

    // Home plate (pentagonal shape)
    const homeShape = [
      new Vector3(-baseSize / 2, 0, 0),
      new Vector3(-baseSize / 2, 0, -baseSize / 2),
      new Vector3(0, 0, -baseSize),
      new Vector3(baseSize / 2, 0, -baseSize / 2),
      new Vector3(baseSize / 2, 0, 0)
    ];

    const homePlate = MeshBuilder.ExtrudePolygon("homePlate", {
      shape: homeShape,
      depth: baseHeight
    }, this.scene);
    homePlate.position = new Vector3(0, baseHeight / 2, 0);
    homePlate.rotation.x = -Math.PI / 2;

    const homeMateria = new PBRMaterial("homePlateMat", this.scene);
    homeMateria.albedoColor = new Color3(0.95, 0.95, 0.95);
    homeMateria.roughness = 0.8;
    homePlate.material = homeMateria;
    this.renderer.addShadowCaster(homePlate);

    // First, second, and third bases (square)
    const basePositions = [
      { name: "first", pos: new Vector3(FieldBuilder.BASE_DISTANCE, 0, FieldBuilder.BASE_DISTANCE) },
      { name: "second", pos: new Vector3(0, 0, FieldBuilder.HOME_TO_SECOND) },
      { name: "third", pos: new Vector3(-FieldBuilder.BASE_DISTANCE, 0, FieldBuilder.BASE_DISTANCE) }
    ];

    basePositions.forEach(base => {
      const baseMesh = MeshBuilder.CreateBox(base.name + "Base", {
        width: baseSize,
        height: baseHeight,
        depth: baseSize
      }, this.scene);

      baseMesh.position = base.pos;
      baseMesh.position.y = baseHeight / 2;

      const baseMaterial = new PBRMaterial(base.name + "BaseMat", this.scene);
      baseMaterial.albedoColor = new Color3(0.95, 0.95, 0.95);
      baseMaterial.roughness = 0.8;
      baseMesh.material = baseMaterial;

      this.renderer.addShadowCaster(baseMesh);
    });
  }

  /**
   * Create pitcher's mound
   */
  private createPitchersMound(): void {
    const moundDiameter = 5.49; // 18 feet

    // Create mound base
    const mound = MeshBuilder.CreateCylinder("pitchersMound", {
      diameter: moundDiameter,
      height: FieldBuilder.MOUND_HEIGHT
    }, this.scene);

    mound.position = new Vector3(0, FieldBuilder.MOUND_HEIGHT / 2, FieldBuilder.PITCHING_DISTANCE);

    const moundMaterial = this.renderer.createDirtMaterial("moundMat");
    mound.material = moundMaterial;
    this.renderer.enableShadowReceiver(mound);

    // Pitcher's rubber (white)
    const rubber = MeshBuilder.CreateBox("pitchersRubber", {
      width: 0.61, // 24 inches
      height: 0.05,
      depth: 0.15 // 6 inches
    }, this.scene);

    rubber.position = new Vector3(0, FieldBuilder.MOUND_HEIGHT + 0.025, FieldBuilder.PITCHING_DISTANCE);

    const rubberMaterial = new PBRMaterial("rubberMat", this.scene);
    rubberMaterial.albedoColor = new Color3(0.9, 0.9, 0.9);
    rubberMaterial.roughness = 0.9;
    rubber.material = rubberMaterial;

    this.renderer.addShadowCaster(rubber);
  }

  /**
   * Create foul lines
   */
  private createFoulLines(): void {
    const lineWidth = 0.127; // 5 inches (official chalk line width)
    const lineHeight = 0.01;
    const lineLength = 100; // Extends to outfield fence

    // First base foul line
    const firstBaseLine = MeshBuilder.CreateBox("firstBaseFoulLine", {
      width: lineWidth,
      height: lineHeight,
      depth: lineLength
    }, this.scene);

    firstBaseLine.position = new Vector3(
      lineLength / 2 * Math.sin(Math.PI / 4),
      lineHeight / 2,
      lineLength / 2 * Math.cos(Math.PI / 4)
    );
    firstBaseLine.rotation.y = -Math.PI / 4;

    // Third base foul line
    const thirdBaseLine = MeshBuilder.CreateBox("thirdBaseFoulLine", {
      width: lineWidth,
      height: lineHeight,
      depth: lineLength
    }, this.scene);

    thirdBaseLine.position = new Vector3(
      -lineLength / 2 * Math.sin(Math.PI / 4),
      lineHeight / 2,
      lineLength / 2 * Math.cos(Math.PI / 4)
    );
    thirdBaseLine.rotation.y = Math.PI / 4;

    // Apply chalk material
    const chalkMaterial = new PBRMaterial("chalkMat", this.scene);
    chalkMaterial.albedoColor = new Color3(0.95, 0.95, 0.95);
    chalkMaterial.emissiveColor = new Color3(0.1, 0.1, 0.1); // Slight glow
    chalkMaterial.roughness = 0.95;

    firstBaseLine.material = chalkMaterial;
    thirdBaseLine.material = chalkMaterial;
  }

  /**
   * Create outfield fence with realistic materials
   */
  private createOutfieldFence(dimensions: { left: number; center: number; right: number }): void {
    const fenceHeight = 3.05; // 10 feet (typical outfield fence)
    const fencePoints: Vector3[] = [];

    // Create fence curve using the dimensions
    // Left field
    for (let angle = 135; angle >= 90; angle -= 5) {
      const rad = (angle * Math.PI) / 180;
      fencePoints.push(new Vector3(
        dimensions.left * Math.sin(rad),
        fenceHeight / 2,
        dimensions.left * Math.cos(rad)
      ));
    }

    // Left-center to center
    for (let angle = 90; angle >= 45; angle -= 5) {
      const rad = (angle * Math.PI) / 180;
      const distance = dimensions.left + (dimensions.center - dimensions.left) * ((90 - angle) / 45);
      fencePoints.push(new Vector3(
        distance * Math.sin(rad),
        fenceHeight / 2,
        distance * Math.cos(rad)
      ));
    }

    // Center to right-center
    for (let angle = 45; angle >= 0; angle -= 5) {
      const rad = (angle * Math.PI) / 180;
      const distance = dimensions.center + (dimensions.right - dimensions.center) * ((45 - angle) / 45);
      fencePoints.push(new Vector3(
        distance * Math.sin(rad),
        fenceHeight / 2,
        distance * Math.cos(rad)
      ));
    }

    // Mirror for right field
    const rightFieldPoints = fencePoints
      .slice()
      .reverse()
      .map(p => new Vector3(-p.x, p.y, p.z));

    const allFencePoints = [...rightFieldPoints, ...fencePoints];

    // Create fence mesh
    const fence = MeshBuilder.CreateTube("outfieldFence", {
      path: allFencePoints,
      radius: 0.15,
      sideOrientation: Mesh.DOUBLESIDE,
      cap: Mesh.CAP_ALL
    }, this.scene);

    const fenceMaterial = this.renderer.createFenceMaterial();
    fence.material = fenceMaterial;
    this.renderer.addShadowCaster(fence);

    // Add fence padding (yellow padded wall)
    const paddedFence = MeshBuilder.CreateTube("paddedFence", {
      path: allFencePoints.map(p => new Vector3(p.x, p.y - fenceHeight / 4, p.z)),
      radius: 0.2,
      sideOrientation: Mesh.DOUBLESIDE
    }, this.scene);

    const paddingMaterial = new PBRMaterial("paddingMat", this.scene);
    paddingMaterial.albedoColor = new Color3(0.9, 0.8, 0.1); // Yellow padding
    paddingMaterial.roughness = 0.7;
    paddedFence.material = paddingMaterial;
  }

  /**
   * Create batter's boxes
   */
  private createBattersBoxes(): void {
    const boxWidth = 1.22; // 4 feet
    const boxDepth = 1.83; // 6 feet
    const lineWidth = 0.05;
    const lineHeight = 0.01;

    // Right-handed batter's box
    this.createBox("rightBattersBox", new Vector3(0.61, lineHeight / 2, -0.3), boxWidth, boxDepth, lineWidth, lineHeight);

    // Left-handed batter's box
    this.createBox("leftBattersBox", new Vector3(-0.61, lineHeight / 2, -0.3), boxWidth, boxDepth, lineWidth, lineHeight);
  }

  /**
   * Create coaches boxes
   */
  private createCoachesBoxes(): void {
    const boxWidth = 3.05; // 10 feet
    const boxDepth = 6.1; // 20 feet
    const lineWidth = 0.05;
    const lineHeight = 0.01;

    // First base coach's box
    this.createBox(
      "firstBaseCoachBox",
      new Vector3(FieldBuilder.BASE_DISTANCE + 5, lineHeight / 2, FieldBuilder.BASE_DISTANCE),
      boxWidth,
      boxDepth,
      lineWidth,
      lineHeight
    );

    // Third base coach's box
    this.createBox(
      "thirdBaseCoachBox",
      new Vector3(-FieldBuilder.BASE_DISTANCE - 5, lineHeight / 2, FieldBuilder.BASE_DISTANCE),
      boxWidth,
      boxDepth,
      lineWidth,
      lineHeight
    );
  }

  /**
   * Create on-deck circles
   */
  private createOnDeckCircles(): void {
    const circleRadius = 1.52; // 5 feet
    const lineHeight = 0.01;

    // Home team on-deck circle (third base side)
    const homeCircle = MeshBuilder.CreateDisc("homeOnDeck", {
      radius: circleRadius,
      tessellation: 32
    }, this.scene);
    homeCircle.position = new Vector3(-8, lineHeight, -5);
    homeCircle.rotation.x = Math.PI / 2;

    // Away team on-deck circle (first base side)
    const awayCircle = MeshBuilder.CreateDisc("awayOnDeck", {
      radius: circleRadius,
      tessellation: 32
    }, this.scene);
    awayCircle.position = new Vector3(8, lineHeight, -5);
    awayCircle.rotation.x = Math.PI / 2;

    const circleMaterial = new PBRMaterial("onDeckMat", this.scene);
    circleMaterial.albedoColor = new Color3(0.9, 0.9, 0.9);
    circleMaterial.roughness = 0.95;

    homeCircle.material = circleMaterial;
    awayCircle.material = circleMaterial;
  }

  /**
   * Add field details (logos, distance markers, etc.)
   */
  private addFieldDetails(): void {
    // Add distance markers on fence (like "350 FT")
    // This would typically use textures/decals in production

    // Add grass patterns (mowing lines) for realism
    this.addMowingPatterns();
  }

  /**
   * Add realistic grass mowing patterns
   */
  private addMowingPatterns(): void {
    // Create alternating stripe pattern in outfield
    const stripeWidth = 3;
    const numStripes = 15;

    for (let i = 0; i < numStripes; i++) {
      if (i % 2 === 0) {
        const stripe = MeshBuilder.CreateBox(`grassStripe${i}`, {
          width: stripeWidth,
          height: 0.001,
          depth: 50
        }, this.scene);

        stripe.position = new Vector3(i * stripeWidth - (numStripes * stripeWidth) / 2, 0.051, 25);

        const stripeMaterial = new PBRMaterial(`stripeMat${i}`, this.scene);
        stripeMaterial.albedoColor = new Color3(0.12, 0.45, 0.12); // Slightly darker grass
        stripeMaterial.roughness = 0.9;
        stripe.material = stripeMaterial;
      }
    }
  }

  /**
   * Helper to create a box outline (for batter's box, coach's box, etc.)
   */
  private createBox(name: string, center: Vector3, width: number, depth: number, lineWidth: number, lineHeight: number): void {
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    const lines = [
      { w: width, d: lineWidth, x: 0, z: -halfDepth }, // Front
      { w: width, d: lineWidth, x: 0, z: halfDepth },  // Back
      { w: lineWidth, d: depth, x: -halfWidth, z: 0 }, // Left
      { w: lineWidth, d: depth, x: halfWidth, z: 0 }   // Right
    ];

    const chalkMaterial = new PBRMaterial(name + "Mat", this.scene);
    chalkMaterial.albedoColor = new Color3(0.95, 0.95, 0.95);
    chalkMaterial.roughness = 0.95;

    lines.forEach((line, index) => {
      const lineMesh = MeshBuilder.CreateBox(`${name}_${index}`, {
        width: line.w,
        height: lineHeight,
        depth: line.d
      }, this.scene);

      lineMesh.position = new Vector3(
        center.x + line.x,
        center.y,
        center.z + line.z
      );

      lineMesh.material = chalkMaterial;
    });
  }

  /**
   * Add variation to grass height for realism
   */
  private addGrassVariation(mesh: Mesh): void {
    const positions = mesh.getVerticesData("position");
    if (!positions) return;

    const normals = mesh.getVerticesData("normal");
    if (!normals) return;

    for (let i = 0; i < positions.length; i += 3) {
      // Add slight random variation to y position
      positions[i + 1] += (Math.random() - 0.5) * 0.02;
    }

    mesh.setVerticesData("position", positions);
    mesh.updateVerticesData("position", positions);
  }
}
