# Thirty Seven — Web 3D 6DOF

A Parable of Desire, Death, and the Undying Cycle.

Three.js 6DOF first-person with Descent-style controls. You are the camera. Rear view mirrors.

## Run

```bash
cd games/web3d
python -m http.server 8000
# Open http://localhost:8000
```

## Controls (Descent-style)

- **Mouse**: Look (click to lock)
- **Shift / Ctrl**: Forward / Reverse thrust
- **W / S**: Slide up / down (view space)
- **A / D**: Slide left / right
- **Q / E**: Roll left / right
- **V**: Jump (vertical burst in view up)
- **R**: Afterburner (boost + brief invulnerability)
- **SPACE**: BREATHE, then LIGHTS OUT
- **ESC**: Unlock mouse / menu

All movement based on view direction. Trichording (thrust + slide) for maximum speed.

## Features

- **37-second** level timer per level
- **3–7 second** breathing phase (random)
- 6DOF camera, instant response (no momentum)
- Rear view mirrors (center, left, right)
- 6 preset levels + infinite random
- Accessibility options
- Procedural audio

*"The fire never dies. And neither does the longing that kindles it."*
