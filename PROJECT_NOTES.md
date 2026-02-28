# Thirty Seven — Project Notes

**A Parable of Desire, Death, and the Undying Cycle**

Documentation of project structure, game mechanics, implementation details, and fixes.

---

## Project Structure

| Path | Platform | Description |
|------|----------|-------------|
| `games/web/` | Web | Three.js top-down orthographic. Pointer-to-world movement. |
| `games/web3d/` | Web | Three.js 6DOF first-person. Descent-style controls. Rear view mirrors. |
| `games/python/` | Desktop | Pygame 2D. Musical instrument: souls play notes when near. |
| `games/ios/` | iOS | Swift/SpriteKit 2D. Touch to move, tap BREATHE. iPhone & iPad. |
| `screenplay/` | — | Screenplay and Grok film prompt. |

---

## Game Mechanics

### Core Loop

- **While true. Do.** — Move the Wanderer, carry the song.
- **Breathe** — 3–7 second pause before the fall. Tap again for Lights Out.
- **Lights Out** — Voluntary death. Fall, then rise invulnerable.
- **Rise** — Return invulnerable. Cycle continues.
- **Goal** — Awaken crowd (stay near grey souls until they turn amber). Avoid Pale Ones.
- **Progressive difficulty (level 10+)**: Each +1 progress requires multiple "hits" (frames in range). `hitsPerProgress = 1 + levelIndex / 10`. Color shifts grey→amber with each progress step.

### Timing (All Platforms)

| Constant | Value | Notes |
|----------|-------|-------|
| Breathing | 3–7 seconds | Random each tap. Was 0.5s fixed. |
| Level timer | 37 seconds | Countdown per level. Timeout = restart (same as caught). |
| Awaken time | 60 frames | Time near soul to awaken. |
| Lights Out cooldown | 180 frames | Before next Lights Out. |
| Rise invuln | 300 frames (5s) | Invulnerable during rise. |
| Lights Out fall | 300 frames (5s) | Fade-out when falling. |
| Lights Out rise | 300 frames (5s) | Fade-in when rising. **10 seconds total.** |

### Progressive Awakening (Level 10+)

| Level range | Hits per +1 progress | Example: frames to awaken |
|-------------|---------------------|---------------------------|
| 0–9        | 1                   | 60                        |
| 10–19      | 2                   | 120                       |
| 20–29      | 3                   | 180                       |
| 30+        | 4+                  | 240+                      |

Color interpolates grey → amber with each +1 progress (60 steps).

### Entities

- **Wanderer** — Player. Grey sphere. Radius 22 (scaled on iOS).
- **Pale Ones** — Hunters. N-body swarm (separation, cohesion, seek). Radius 18.
- **Crowd** — Souls to awaken. Grey → amber. Radius 14.
- **Collision radius** — 38 (wanderer + pale one centers).
- **Awaken radius** — 90 (distance to progress awakening).

---

## Platform Notes

### iOS (Swift/SpriteKit)

**Files:**
- `GameScene.swift` — Game logic, touch, entities, sphere textures.
- `GameContainerView.swift` — SwiftUI wrapper, level complete overlay, header.
- `GameState.swift` — Level index, awaken count, timer, `advanceLevel`.
- `AudioManager.swift` — Procedural sine-tone audio.
- `LevelData.swift` — Preset levels, `coolColor`, random generation.

**Fixes applied:**
1. **Breathe button hit test** — Tapping BREATHE label (SKLabelNode) missed. Now checks `hit.parent === breatheButton`.
2. **AudioManager** — Reuses single `AVAudioPlayerNode`. Was creating one per sound, never detaching.
3. **Crowd texture thrashing** — Cached progress textures by tier (5 tiers). Was creating 20+ textures/frame during awakening.
4. **Responsive layout** — Scene size from `GeometryReader` (actual view size). Reload on resize/rotation.
5. **iPad/iPhone scaling** — `entityScale = min(1.5, max(0.7, shortSide/400))`. UI and entities scale. Safe margins: 7–8% from edges.
6. **Level timer** — 37 seconds. Displayed in HUD. Restart on timeout.

### Python (Pygame)

**Constants:** `games/python/constants.py`  
**Key:** `BREATH_DURATION_MIN/MAX`, `LEVEL_TIME_SECONDS`, `FPS`, `AWAKEN_TIME`, etc.

**Files:**
- `main.py` — Game loop, input, load_level.
- `entities.py` — Wanderer, PaleOne, CrowdMember.
- `levels.py` — Level data.
- `ui.py` — HUD, menu, vow, breathe button.
- `audio.py` — Procedural tones, proximity notes.

### Web (Three.js 2D)

**Files:**
- `index.html` — Layout, accessibility modal.
- `game.js` — Game logic, LEVELS, loadLevel, update, draw.
- `styles.css` — Dark theme, BREATHE button.

**Accessibility:** Keyboard, cursor smoothing, larger hitboxes, longer awaken, breathe audio cues.

### Web 3D (Three.js 6DOF)

**Files:**
- `index.html` — Layout.
- `game.js` — 6DOF controls, mirrors, arena, LEVELS.
- `styles.css` — Styling.

**Controls:** Mouse look, thrust/slide/roll, jump, afterburner, BREATHE.

---

## Audio (Procedural)

All platforms generate sine tones. No audio files.

| Sound | Freq (Hz) | Duration | Notes |
|-------|-----------|----------|-------|
| Menu tap | 880 | 0.08s | — |
| Breathe | 220 | 0.15s | — |
| Lights Out | 110 | 0.4s | Low drone |
| Rise | 440 | 0.2s | — |
| Awaken | 660 | 0.12s | Soul turns amber |
| Caught | 150 | 0.5s | Timeout or Pale One |
| Level complete | 523 | 0.25s | — |

Python adds: proximity notes when near crowd (pentatonic).

---

## Preset Levels (6) — Constellation-Inspired

Crowd positions trace star patterns. Pale Ones hunt in the void between.

| Level | Constellation | Pattern |
|-------|---------------|---------|
| 1. **The Birthplace** | Orion | Belt (3) + shoulders. 3 awaken, no Pale Ones. |
| 2. **Old World Tavern** | Ursa Major | Big Dipper (7 stars). 4 awaken, 2 Pale Ones. |
| 3. **Neon Alley** | Cassiopeia | W shape (8 stars). 5 awaken, 4 Pale Ones. |
| 4. **Forest** | Cygnus | Northern Cross (9 stars). 5 awaken, 5 Pale Ones. |
| 5. **The Crowd** | Lyra + Pleiades | Dense star field (20). 12 awaken, 6 Pale Ones. |
| 6. **Lights Out** | Scorpius | Scorpion's curve (9 stars). 5 awaken, 5 Pale Ones. |

Random levels beyond index 6. Same layout logic across platforms.

---

## Credits

Based on the screenplay *Thirty Seven* and *37.md*.  
*"The fire never dies. And neither does the longing that kindles it."*
