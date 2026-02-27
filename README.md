# Thirty Seven

**A Parable of Desire, Death, and the Undying Cycle**

Based on the screenplay and parable by the same name. *"The fire never dies. And neither does the longing that kindles it."*

See **PROJECT_NOTES.md** for mechanics, timing, and implementation details.

## Structure

- **`games/web/`** — Three.js, top-down 3D. Mouse/touch to move. Play in browser.
- **`games/web3d/`** — Three.js, 6DOF first-person. Descent-style controls. Rear view mirrors.
- **`games/python/`** — Pygame. Desktop game.
- **`games/ios/`** — Swift/SpriteKit. iPhone & iPad.
- **`screenplay/`** — Screenplay and Grok film prompt.

## Quick Start

**Web (top-down):** Open `games/web/index.html` or run `python -m http.server 8000` from `games/web`

**Web 3D (6DOF):** Open `games/web3d/index.html` or serve `games/web3d`

**Python:** `cd games/python && pip install -r requirements.txt && python main.py`

**iOS:** Open `games/ios` in Xcode, add Swift files, build.
