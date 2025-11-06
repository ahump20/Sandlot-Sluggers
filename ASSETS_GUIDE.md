# Sandlot Sluggers - Asset Creation Guide

## Overview

This guide explains how to create and prepare 3D models, textures, audio files, and other assets for Sandlot Sluggers.

## 3D Models

### Character Models

**Requirements:**
- Format: `.glb` (preferred) or `.gltf`
- Polygon count: 5,000 - 15,000 triangles
- Height: 1.8 - 2.0 units (Babylon.js units)
- Rigged with standard humanoid skeleton
- Texture resolution: 2048x2048 (diffuse, normal, roughness, metallic)

**Animations (FBX or embedded in GLB):**
- Idle (looping)
- Pitch windup
- Pitch throw
- Bat stance (looping)
- Bat swing
- Run (looping)
- Slide
- Catch
- Throw
- Celebrate (looping)
- Dive

**Style Guide:**
- Stylized cartoon aesthetic (Backyard Baseball inspired)
- Vibrant colors with slight cel-shading
- Exaggerated proportions for personality
- Big expressive faces

**Recommended Tools:**
- Blender (free, open-source)
- Maya
- 3ds Max

**Export Settings (Blender):**
```
File > Export > glTF 2.0 (.glb/.gltf)
- Format: glTF Binary (.glb)
- Include: Selected Objects
- Transform: +Y Up
- Geometry:
  - Apply Modifiers: Yes
  - UVs: Yes
  - Normals: Yes
  - Tangents: Yes
  - Vertex Colors: Yes
- Animation:
  - Animation: Yes
  - Shape Keys: Yes
  - Skinning: Yes
```

**Character List:**
1. Rocket Rodriguez (CF)
2. Ace McKenzie (P)
3. Thunder Thompson (1B)
4. Dizzy Daniels (SS)
5. Flash Freeman (LF)
6. Brick Martinez (C)
7. Pepper Sanchez (2B)
8. Zoom Williams (RF)
9. Knuckles O'Brien (P)
10. Slider Jackson (3B)
11. Comet Carter (unlockable)
12. Blaze the Dog (unlockable)

### Stadium Models

**Requirements:**
- Format: `.glb`
- Polygon count: 50,000 - 150,000 triangles
- Include field, fence, dugouts, bleachers
- PBR materials
- Baked ambient occlusion

**Stadium List:**
1. **Dusty Acres** - Desert theme
   - Sand textures
   - Cactus decorations
   - Warm color palette

2. **Frostbite Field** - Winter theme
   - Snow textures
   - Ice patches
   - Cool color palette

3. **Treehouse Park** - Forest theme
   - Wood textures
   - Trees, leaves
   - Green color palette

4. **Rooftop Rally** - Urban theme
   - Concrete textures
   - City skyline backdrop
   - Industrial color palette

5. **Beach Bash** - Beach theme
   - Sand, water
   - Palm trees
   - Bright tropical colors

**Skybox for Each Stadium:**
- Format: HDR cube map (`.hdr` or `.env`)
- Resolution: 2048x2048 per face
- Tone: Match stadium theme

---

## Textures

### Field Textures

**Grass:**
- Diffuse: 4096x4096 (grass_diffuse.jpg)
- Normal: 4096x4096 (grass_normal.jpg)
- Roughness: 2048x2048 (grass_roughness.jpg)
- Style: Realistic with stylized touch

**Dirt:**
- Diffuse: 2048x2048 (dirt_diffuse.jpg)
- Normal: 2048x2048 (dirt_normal.jpg)
- Roughness: 2048x2048 (dirt_roughness.jpg)

**Fence:**
- Diffuse: 2048x2048 (fence_diffuse.jpg)
- Normal: 2048x2048 (fence_normal.jpg)
- Includes wood grain and padding

### UI Textures

**Logo:**
- Format: PNG with transparency
- Size: 512x512
- High contrast for visibility

**Icons:**
- Format: PNG with transparency
- Size: 192x192, 512x512 (PWA icons)
- Consistent style

---

## Audio

### Sound Effects

**Format:** MP3 (128kbps) or OGG
**Sample Rate:** 44.1kHz
**Channels:** Mono (SFX) or Stereo (ambient)

**Required SFX:**

| Sound | Description | Duration | Volume |
|-------|-------------|----------|--------|
| bat_crack.mp3 | Normal hit | 0.5s | Loud |
| bat_crack_homerun.mp3 | Powerful hit | 0.8s | Very loud |
| bat_miss.mp3 | Swing and miss | 0.4s | Medium |
| catch.mp3 | Ball caught in glove | 0.3s | Medium |
| ball_land.mp3 | Ball hits ground | 0.4s | Medium |
| crowd_cheer.mp3 | Crowd celebrates | 3s | Loud |
| crowd_aww.mp3 | Crowd disappointed | 2s | Medium |
| umpire_strike.mp3 | "Strike!" call | 1s | Loud |
| umpire_ball.mp3 | "Ball!" call | 1s | Medium |
| umpire_out.mp3 | "Out!" call | 1s | Loud |
| umpire_safe.mp3 | "Safe!" call | 1s | Loud |
| whistle.mp3 | Referee whistle | 1s | Loud |
| glove_pound.mp3 | Pitcher hitting glove | 0.5s | Medium |
| dirt_slide.mp3 | Player sliding | 1s | Medium |
| fence_hit.mp3 | Ball hitting fence | 0.5s | Loud |
| footsteps_dirt.mp3 | Running on dirt | 0.5s loop | Quiet |
| footsteps_grass.mp3 | Running on grass | 0.5s loop | Quiet |
| button_click.mp3 | UI button | 0.1s | Medium |
| power_up.mp3 | Special ability | 1s | Medium |
| level_up.mp3 | Player levels up | 2s | Medium |
| achievement.mp3 | Achievement unlocked | 1.5s | Medium |
| coin.mp3 | Collect points | 0.3s | Medium |
| menu_select.mp3 | Menu selection | 0.2s | Medium |

**Sources:**
- Freesound.org (CC0 or CC-BY)
- Record custom sounds
- Commissioned audio from sound designer

**Processing:**
- Normalize all audio
- Remove background noise
- Add compression for consistency

### Music Tracks

**Format:** MP3 (192kbps) or OGG
**Sample Rate:** 44.1kHz
**Channels:** Stereo
**Length:** 2-4 minutes (looping)

**Required Tracks:**

1. **main_menu.mp3**
   - Style: Upbeat, nostalgic
   - Tempo: 120-140 BPM
   - Instruments: Synth, drums, brass

2. **game_intro.mp3**
   - Style: Epic, anticipatory
   - Tempo: 100-120 BPM
   - Length: 30 seconds

3. **gameplay_upbeat.mp3**
   - Style: Energetic, fun
   - Tempo: 130-150 BPM
   - Seamless loop

4. **gameplay_intense.mp3**
   - Style: Tense, dramatic
   - Tempo: 140-160 BPM
   - For close games

5. **victory.mp3**
   - Style: Triumphant, celebratory
   - Tempo: 120 BPM
   - Length: 20 seconds

6. **defeat.mp3**
   - Style: Melancholic, thoughtful
   - Tempo: 80-100 BPM
   - Length: 15 seconds

7. **credits.mp3**
   - Style: Cheerful, lighthearted
   - Tempo: 110-130 BPM

**Music Style:**
- Inspired by Backyard Baseball's iconic soundtrack
- Chiptune elements mixed with modern production
- Bright, colorful instrumentation
- Memorable melodies

**Recommended Tools:**
- FL Studio
- Ableton Live
- GarageBand

**Commissioning Music:**
- Hire composer familiar with game music
- Provide reference tracks
- Request stems for mixing

### Ambient Sounds

**Format:** OGG (loop-friendly)
**Length:** 30-60 seconds

| Sound | Description |
|-------|-------------|
| stadium_crowd.mp3 | General crowd ambience |
| birds.mp3 | Bird chirping (day games) |
| wind.mp3 | Gentle wind |
| night_crickets.mp3 | Crickets (night games) |

---

## Asset Optimization

### Texture Compression

Use compressed texture formats for better performance:

```bash
# Install tools
npm install -g gltf-pipeline

# Compress GLB models
gltf-pipeline -i model.glb -o model_compressed.glb --draco.compressionLevel 10

# Use KTX2 for textures (optional, advanced)
# Requires KTX software tools
```

### Audio Compression

```bash
# Convert to OGG with ffmpeg
ffmpeg -i input.wav -c:a libvorbis -q:a 4 output.ogg

# Convert to MP3
ffmpeg -i input.wav -b:a 128k output.mp3
```

### Model Optimization Tips

1. **Remove Hidden Geometry:** Delete faces not visible to player
2. **Merge Vertices:** Remove duplicate vertices
3. **Optimize Materials:** Use texture atlases when possible
4. **Bake Lighting:** Pre-bake ambient occlusion and shadows
5. **LOD Models:** Create multiple detail levels (optional)

---

## Asset Pipeline Workflow

### 1. Creation
- Model in Blender/Maya
- Texture in Substance Painter
- Animate with rigs

### 2. Export
- Export to GLB format
- Ensure proper scale and orientation

### 3. Test Locally
- Place in `/public/models/`
- Test in development build
- Verify animations play correctly

### 4. Optimize
- Compress with gltf-pipeline
- Reduce texture sizes if needed
- Test performance

### 5. Upload to R2
```bash
wrangler r2 object put sandlot-sluggers-assets/models/rocket_rodriguez.glb \
  --file=./public/models/rocket_rodriguez.glb \
  --content-type model/gltf-binary
```

### 6. Update Asset Paths
- Modify character data to point to R2 URLs
- Test in staging environment

---

## Asset Checklist

### Pre-Launch Checklist

- [ ] All 12 character models created
- [ ] All character animations working
- [ ] All 5 stadium models created
- [ ] All 5 skyboxes created
- [ ] All 22 sound effects recorded
- [ ] All 7 music tracks composed
- [ ] All 4 ambient sounds created
- [ ] App icons (192x192, 512x512) created
- [ ] Field textures (grass, dirt) created
- [ ] All assets uploaded to R2
- [ ] Asset loading tested on mobile
- [ ] Asset loading tested on desktop
- [ ] Performance benchmarks passed

---

## Placeholder Assets (Temporary)

Until real assets are created, use these placeholders:

### Characters
- Simple colored capsules (current implementation)
- Different colors per position

### Stadiums
- Procedurally generated field (current implementation)
- Simple skybox color

### Audio
- Silent audio files (current fallback)
- Browser default sounds

### Workflow for Replacing Placeholders
1. Create/commission real asset
2. Test locally
3. Upload to R2
4. Update code to use new asset
5. Deploy and test

---

## Asset Budget

**Recommended Sizes:**

| Asset Type | Size Limit | Total Budget |
|------------|-----------|--------------|
| Character Model | 5 MB | 60 MB (12 characters) |
| Stadium Model | 15 MB | 75 MB (5 stadiums) |
| Skybox | 8 MB | 40 MB (5 skyboxes) |
| SFX (each) | 100 KB | 2.2 MB (22 sounds) |
| Music (each) | 3 MB | 21 MB (7 tracks) |
| Textures | - | 50 MB |
| **TOTAL** | - | **~250 MB** |

On first load, use:
- Progressive loading
- Asset streaming from R2
- Caching strategy

---

## License and Attribution

When using third-party assets:

1. Check license (CC0, CC-BY, etc.)
2. Provide attribution if required
3. Keep LICENSE.txt with asset credits
4. Include in game credits

Example attribution:
```
Sound Effects:
- "Baseball Hit" by User123 (Freesound.org) - CC-BY 4.0
- "Crowd Cheer" by SoundArtist - CC0

3D Models:
- Character rigs based on Mixamo skeleton - Adobe Mixamo

Music:
- Composed by [Composer Name]
- Licensed exclusively for Sandlot Sluggers
```

---

## Resources

### Free 3D Models
- Sketchfab (search for CC-licensed)
- TurboSquid Free
- Mixamo (characters and animations)

### Free Textures
- Poly Haven (CC0 textures)
- Texture.com
- AmbientCG

### Free Audio
- Freesound.org
- Zapsplat.com
- BBC Sound Effects Library

### Paid Assets
- Unity Asset Store
- Unreal Marketplace
- Envato Elements
- AudioJungle

---

## Contact

For asset creation inquiries:
- Email: assets@sandlotslugging.com
- Discord: #asset-creation channel
