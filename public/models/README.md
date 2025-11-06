# 3D Models Directory

This directory contains all 3D models for Sandlot Sluggers.

## Required Models

### Characters (`/characters/`)
Create GLB files for each character:
- rocket_rodriguez.glb (CF - Power hitter)
- ace_mckenzie.glb (P - Pitcher)
- thunder_thompson.glb (1B - Slugger)
- dizzy_daniels.glb (SS - Balanced)
- flash_freeman.glb (LF - Speed)
- brick_martinez.glb (C - Defense)
- pepper_sanchez.glb (2B - Contact)
- zoom_williams.glb (RF - Fast)
- knuckles_obrien.glb (P - Control)
- slider_jackson.glb (3B - All-around)
- comet_carter.glb (Unlockable - Perfect stats)
- blaze_dog.glb (Unlockable - Dog fielder)

### Stadiums (`/stadiums/`)
- dusty_acres.glb (Desert theme)
- frostbite_field.glb (Winter theme)
- treehouse_park.glb (Forest theme)
- rooftop_rally.glb (Urban theme)
- beach_bash.glb (Beach theme)

## Specifications

### Character Models
- **Format:** GLB (GLTF Binary)
- **Polygons:** 5,000-15,000 triangles
- **Height:** 1.8-2.0 Babylon.js units
- **Rigging:** Standard humanoid skeleton
- **Textures:** 2048x2048 (diffuse, normal, roughness, metallic)
- **Animations:** Embedded or separate
  - idle, pitch_windup, pitch_throw
  - bat_stance, bat_swing, bat_hit, bat_miss
  - run, slide, catch, throw, celebrate, dive

### Stadium Models
- **Format:** GLB
- **Polygons:** 50,000-150,000 triangles
- **Includes:** Field, fence, dugouts, bleachers
- **Materials:** PBR with baked ambient occlusion
- **Skybox:** Separate .env or .hdr file

## Export Settings (Blender)

```
File > Export > glTF 2.0 (.glb)
- Format: glTF Binary (.glb)
- Include: Selected Objects
- Transform: +Y Up
- Geometry:
  - Apply Modifiers: Yes
  - UVs: Yes
  - Normals: Yes
  - Tangents: Yes
- Animation: Yes
- Skinning: Yes
```

## Tools

- **Blender:** Free 3D modeling (recommended)
- **Substance Painter:** Texturing
- **Mixamo:** Character rigging and animations

## Placeholder Assets

Currently using:
- Colored capsules for characters
- Procedural field geometry

See `ASSETS_GUIDE.md` for complete specifications.
