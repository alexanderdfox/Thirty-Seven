# Thirty Seven

**A Parable of Desire, Death, and the Undying Cycle**

Based on the screenplay and parable by the same name. *"The fire never dies. And neither does the longing that kindles it."*

See **PROJECT_NOTES.md** for mechanics, timing, and implementation details.

## Structure

- **`games/web/`** — Three.js, top-down 3D. Mouse/touch to move. Play in browser.
- **`games/web3d/`** — Three.js, 6DOF first-person. Descent-style controls. Rear view mirrors.
- **`games/nes/`** — NES-style 2D Canvas. D-pad, chiptune. Play in browser.
- **`games/python/`** — Pygame. Desktop game.
- **`games/ios/`** — Swift/SpriteKit. iPhone & iPad.
- **`screenplay/`** — Screenplay and Grok film prompt.

## Quick Start

**Menu:** Open `index.html` in the project root for a launcher to all web versions.

**Web (top-down):** Open `games/web/index.html` or serve the project and visit `/games/web/`

**Web 3D (6DOF):** Open `games/web3d/index.html` or serve the project and visit `/games/web3d/`

**NES Style:** Open `games/nes/index.html` or visit `/games/nes/`

From project root: `python -m http.server 8000` → http://localhost:8000

**Python:** `cd games/python && pip install -r requirements.txt && python main.py`

**iOS:** Open `games/ios` in Xcode, add Swift files, build.
