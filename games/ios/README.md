# Thirty Seven — iOS

A Parable of Desire, Death, and the Undying Cycle.

Swift/SpriteKit 2D game for iPhone and iPad. Aligned with web 2D: Pale Ones use N-body swarm (separation, cohesion), keep minimum distance. Touch to move, tap Breathe (3–7 sec) then Lights Out, avoid the Pale Ones. 37-second level timer. Responsive layout for all screen sizes.

## Setup in Xcode

1. Open Xcode. From `games/ios/` use an existing project, or create new: **File → New → Project**
2. Choose **App** under iOS
3. Product Name: `ThirtySeven`
4. Interface: **SwiftUI**
5. Life Cycle: **SwiftUI App**
6. Language: **Swift**
7. Uncheck "Include Tests"

8. Delete the default `ContentView.swift` and `ThirtySevenApp.swift` from the project (or replace their contents)

9. Add the source files:
   - Right-click the `ThirtySeven` folder in the navigator
   - **Add Files to "ThirtySeven"...**
   - Select all `.swift` files from `ThirtySeven/`:
     - `ThirtySevenApp.swift`
     - `ContentView.swift`
     - `GameContainerView.swift`
     - `GameScene.swift`
     - `GameState.swift`
     - `LevelData.swift`
     - `AudioManager.swift`
   - Ensure "Copy items if needed" and the target is checked

10. SpriteKit is included by default in iOS apps. If needed: **Target → General → Frameworks and Libraries** → `+` → **SpriteKit**

11. Add `Info.plist` if not auto-generated, or merge the keys (Display Name, orientations, etc.)

12. Build and run on a simulator or device

## Controls

- **Touch & drag**: Move the Wanderer (your character)
- **Tap BREATHE**: Begin the breath (3–7 seconds). Tap again during breath for Lights Out—voluntary death, then rise invulnerable.
- **Back button**: Return to menu

## Sound

Sounds are generated procedurally (sine-wave tones) — no audio files required:
- Menu tap
- Breathe
- Lights Out (low drone)
- Rise
- Awaken (soul turns amber)
- Caught (when Pale Ones get you)
- Level complete

## Menu

- **PLAY**: Start the game
- **HOW TO PLAY**: Instructions

## Credits

Based on the screenplay *Thirty Seven* and *37.md*.
*"The fire never dies. And neither does the longing that kindles it."*
