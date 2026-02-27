//
//  GameScene.swift
//  Thirty Seven
//
//  3D-style sphere rendering (radial gradient + shadow) to match web.
//

import SpriteKit
import CoreGraphics
import UIKit

final class GameScene: SKScene {
    weak var gameState: GameState!

    private var wanderer: SKSpriteNode!
    private var paleOnes: [SKSpriteNode] = []
    private var crowdMembers: [(node: SKSpriteNode, progress: Int, subProgress: Int, awakened: Bool)] = []
    private var levelData: LevelData!
    private var vowLabel: SKLabelNode!
    private var breatheButton: SKShapeNode!
    private var breatheLabel: SKLabelNode!

    private var wandererState = "alive"
    private var breathTimer = 0
    private var fallTimer = 0
    private var riseTimer = 0
    private var invulnTimer = 0
    private var lightsOutCooldown = 0
    private var levelTimer = 37 * 60

    private let baseWandererRadius: CGFloat = 22
    private let basePaleOneRadius: CGFloat = 18
    private let baseCrowdRadius: CGFloat = 14
    private let baseAwakenRadius: CGFloat = 90
    private let awakenTime = 60
    private let basePaleOneSpeed: CGFloat = 2.8
    private let baseCollisionRadius: CGFloat = 38
    private let lightsOutFall = 60 * 5
    private let lightsOutRise = 60 * 5

    private var entityScale: CGFloat { min(1.5, max(0.7, min(size.width, size.height) / 400)) }
    private var wandererRadius: CGFloat { baseWandererRadius * entityScale }
    private var paleOneRadius: CGFloat { basePaleOneRadius * entityScale }
    private var crowdRadius: CGFloat { baseCrowdRadius * entityScale }
    private var awakenRadius: CGFloat { baseAwakenRadius * entityScale }
    private var paleOneSpeed: CGFloat { basePaleOneSpeed * entityScale }
    private var collisionRadius: CGFloat { baseCollisionRadius * entityScale }

    private var touchPosition: CGPoint?

    override func didMove(to view: SKView) {
        backgroundColor = .black
        gameState.gameScene = self
        loadLevel()
        setupUI()
    }

    func reloadLevel() {
        isPaused = false
        loadLevel()
    }

    private func loadLevel() {
        removeAllChildren()
        paleOnes = []
        crowdMembers = []
        wanderer = nil
        vowLabel = nil
        breatheButton = nil
        breatheLabel = nil

        levelData = gameState.currentLevel
        gameState.awakenGoal = levelData.awakenGoal
        gameState.currentLevelName = levelData.name

        let (r, g, b) = levelData.backgroundColorRGB
        backgroundColor = UIColor(red: CGFloat(r), green: CGFloat(g), blue: CGFloat(b), alpha: 1)

        let w = size.width
        let h = size.height

        wanderer = createWanderer()
        wanderer.position = CGPoint(x: levelData.wandererStart.x * w, y: (1 - levelData.wandererStart.y) * h)
        addChild(wanderer)

        wandererState = "alive"
        breathTimer = 0
        fallTimer = 0
        riseTimer = 0
        invulnTimer = 0
        lightsOutCooldown = 0
        levelTimer = 37 * 60

        for pos in levelData.paleOnePositions {
            let node = createPaleOne()
            let x = pos.x * w
            let y = (1 - pos.y) * h
            node.position = CGPoint(x: x, y: y)
            node.userData = ["x": x, "y": y, "vx": CGFloat(0), "vy": CGFloat(0)]
            addChild(node)
            paleOnes.append(node)
        }

        for pos in levelData.crowdPositions {
            let node = createCrowdMember(awakened: false)
            node.position = CGPoint(x: pos.x * w, y: (1 - pos.y) * h)
            addChild(node)
            crowdMembers.append((node: node, progress: 0, subProgress: 0, awakened: false))
        }

        setupUI()
    }

    private func setupUI() {
        let w = size.width
        let h = size.height
        let shortSide = min(w, h)
        let uiScale = min(1.5, max(0.8, shortSide / 400))

        vowLabel = SKLabelNode(text: "While true. Do.")
        vowLabel.fontName = "AvenirNext-Medium"
        vowLabel.fontSize = 18 * uiScale
        vowLabel.fontColor = UIColor(red: 1, green: 0.84, blue: 0.39, alpha: 1)
        vowLabel.position = CGPoint(x: w / 2, y: h - max(50, h * 0.08))
        addChild(vowLabel)

        let btnW = 140 * uiScale
        let btnH = 44 * uiScale
        breatheButton = SKShapeNode(rectOf: CGSize(width: btnW, height: btnH), cornerRadius: 8 * uiScale)
        breatheButton.fillColor = UIColor(red: 0.3, green: 0.25, blue: 0.2, alpha: 0.9)
        breatheButton.strokeColor = UIColor(red: 0.6, green: 0.5, blue: 0.3, alpha: 1)
        breatheButton.lineWidth = 1
        breatheButton.position = CGPoint(x: w / 2, y: max(50, h * 0.07))
        breatheButton.name = "breatheButton"
        addChild(breatheButton)

        breatheLabel = SKLabelNode(text: "BREATHE")
        breatheLabel.fontName = "AvenirNext-Bold"
        breatheLabel.fontSize = 16 * uiScale
        breatheLabel.fontColor = UIColor(red: 1, green: 0.84, blue: 0.39, alpha: 1)
        breatheLabel.verticalAlignmentMode = .center
        breatheButton.addChild(breatheLabel)
    }

    private static var wandererTexture: SKTexture?
    private static var paleTexture: SKTexture?
    private static var crowdGreyTexture: SKTexture?
    private static var crowdAmberTexture: SKTexture?
    private static var crowdProgressTextures: [Int: SKTexture] = [:]

    private func makeSphereTexture(radius: CGFloat, baseColor: UIColor, highlight: CGFloat = 0.35) -> SKTexture {
        let size = radius * 2 + 4
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: size, height: size))
        let image = renderer.image { _ in
            let rect = CGRect(x: 2, y: 2, width: radius * 2, height: radius * 2)
            guard let ctx = UIGraphicsGetCurrentContext() else { return }
            ctx.saveGState()
            ctx.addEllipse(in: rect)
            ctx.clip()
            var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
            baseColor.getRed(&r, green: &g, blue: &b, alpha: &a)
            let light = UIColor(red: min(1, r + 0.15), green: min(1, g + 0.15), blue: min(1, b + 0.15), alpha: 1)
            let dark = UIColor(red: max(0, r - 0.2), green: max(0, g - 0.2), blue: max(0, b - 0.2), alpha: 1)
            let colors = [light.cgColor, dark.cgColor] as CFArray
            let space = CGColorSpaceCreateDeviceRGB()
            guard let gradient = CGGradient(colorsSpace: space, colors: colors, locations: [0, 1]) else {
                ctx.restoreGState()
                return
            }
            ctx.drawRadialGradient(
                gradient,
                startCenter: CGPoint(x: rect.midX, y: rect.midY),
                startRadius: 0,
                endCenter: CGPoint(x: rect.midX, y: rect.midY),
                endRadius: radius,
                options: []
            )
            ctx.restoreGState()
        }
        return SKTexture(image: image)
    }

    private func createWanderer() -> SKSpriteNode {
        let tex = Self.wandererTexture ?? makeSphereTexture(radius: baseWandererRadius, baseColor: UIColor(red: 0.35, green: 0.35, blue: 0.37, alpha: 1))
        Self.wandererTexture = tex
        let node = SKSpriteNode(texture: tex, size: CGSize(width: baseWandererRadius * 2, height: baseWandererRadius * 2))
        node.setScale(entityScale)
        node.name = "wanderer"
        addShadow(to: node)
        return node
    }

    private func createPaleOne() -> SKSpriteNode {
        let tex = Self.paleTexture ?? makeSphereTexture(radius: basePaleOneRadius, baseColor: UIColor(red: 0.86, green: 0.82, blue: 0.78, alpha: 1))
        Self.paleTexture = tex
        let node = SKSpriteNode(texture: tex, size: CGSize(width: basePaleOneRadius * 2, height: basePaleOneRadius * 2))
        node.setScale(entityScale)
        addShadow(to: node)
        return node
    }

    private func createCrowdMember(awakened: Bool) -> SKSpriteNode {
        let base: UIColor = awakened
            ? UIColor(red: 1, green: 0.55, blue: 0.2, alpha: 1)
            : UIColor(red: 0.24, green: 0.24, blue: 0.25, alpha: 1)
        let tex = awakened
            ? (Self.crowdAmberTexture ?? makeSphereTexture(radius: baseCrowdRadius, baseColor: base, highlight: 0.4))
            : (Self.crowdGreyTexture ?? makeSphereTexture(radius: baseCrowdRadius, baseColor: base))
        if awakened { Self.crowdAmberTexture = tex } else { Self.crowdGreyTexture = tex }
        let node = SKSpriteNode(texture: tex, size: CGSize(width: baseCrowdRadius * 2, height: baseCrowdRadius * 2))
        node.setScale(entityScale)
        addShadow(to: node)
        return node
    }

    private func addShadow(to node: SKNode) {
        let radius = node.frame.width / 2
        let shadow = SKShapeNode(ellipseOf: CGSize(width: radius * 3.2, height: radius))
        shadow.fillColor = UIColor(red: 0.06, green: 0.06, blue: 0.08, alpha: 0.35)
        shadow.strokeColor = .clear
        shadow.position = CGPoint(x: 3, y: -4)
        shadow.zPosition = -1
        node.addChild(shadow)
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let loc = touch.location(in: self)

        let hit = atPoint(loc)
        if hit.name == "breatheButton" || hit.parent === breatheButton {
            handleBreatheTap()
            return
        }

        touchPosition = loc
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        touchPosition = touches.first?.location(in: self)
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        touchPosition = nil
    }

    private func handleBreatheTap() {
        if wandererState == "alive", lightsOutCooldown <= 0 {
            wandererState = "breathing"
            breathTimer = Int.random(in: 180...420)
            AudioManager.shared.play(.breathe)
        } else if wandererState == "breathing" {
            wandererState = "falling"
            fallTimer = lightsOutFall
            lightsOutCooldown = 180
            AudioManager.shared.play(.lightsOut)
        }
    }

    override func update(_ currentTime: TimeInterval) {
        guard wanderer != nil else { return }

        let w = size.width
        let h = size.height

        if wandererState == "alive" || wandererState == "breathing" {
            if let pos = touchPosition {
                let x = max(wandererRadius, min(w - wandererRadius, pos.x))
                let y = max(wandererRadius, min(h - wandererRadius, pos.y))
                wanderer.position = CGPoint(x: x, y: y)
            }
        }

        if wandererState == "breathing" {
            breathTimer -= 1
            if breathTimer <= 0 { wandererState = "alive" }
            vowLabel.text = "Breathe..."
        } else if wandererState == "falling" {
            fallTimer -= 1
            wanderer.alpha = max(0, CGFloat(fallTimer) / CGFloat(lightsOutFall))
            vowLabel.text = "Fall."
            if fallTimer <= 0 {
                wandererState = "rising"
                riseTimer = lightsOutRise
                invulnTimer = lightsOutRise
                wanderer.alpha = 0.5
                AudioManager.shared.play(.rise)
            }
        } else if wandererState == "rising" {
            riseTimer -= 1
            invulnTimer -= 1
            wanderer.alpha = 0.5 + (1 - CGFloat(riseTimer) / CGFloat(lightsOutRise)) * 0.5
            if riseTimer <= 0 {
                wandererState = "alive"
                wanderer.alpha = 1
            }
            vowLabel.text = "Rise."
        } else {
            vowLabel.text = "While true. Do."
        }

        if lightsOutCooldown > 0 { lightsOutCooldown -= 1 }

        if wandererState != "falling", wandererState != "rising", invulnTimer <= 0, !paleOnes.isEmpty {
            let n = paleOnes.count
            let swarmFactor: CGFloat = n <= 1 ? 0 : min(1, CGFloat(n - 1) * 0.18)
            let sepR = max(paleOneRadius * 2.5 + 12, 40 + CGFloat(n) * 4)
            let cohR: CGFloat = 90 + CGFloat(n) * 10
            let seekK: CGFloat = 1.2
            let repelK: CGFloat = 2.2
            let cohK: CGFloat = 0.12

            for paleNode in paleOnes {
                guard let ud = paleNode.userData,
                      var px = ud["x"] as? CGFloat,
                      var py = ud["y"] as? CGFloat else { continue }
                var vx = (ud["vx"] as? CGFloat) ?? 0
                var vy = (ud["vy"] as? CGFloat) ?? 0

                var fx: CGFloat = 0
                var fy: CGFloat = 0
                let dx0 = wanderer.position.x - px
                let dy0 = wanderer.position.y - py
                let d0 = hypot(dx0, dy0)
                if d0 > 0.01 {
                    fx += (dx0 / d0) * seekK
                    fy += (dy0 / d0) * seekK
                }

                for other in paleOnes where other !== paleNode {
                    guard let ou = other.userData,
                          let ox = ou["x"] as? CGFloat,
                          let oy = ou["y"] as? CGFloat else { continue }
                    let dx = ox - px
                    let dy = oy - py
                    let d = hypot(dx, dy)
                    if d < 0.01 { continue }
                    if d < sepR {
                        let s = (sepR - d) / sepR * swarmFactor * repelK
                        fx -= (dx / d) * s
                        fy -= (dy / d) * s
                    } else if d < cohR {
                        let s = (1 - (d - sepR) / (cohR - sepR)) * swarmFactor * cohK
                        fx += (dx / d) * s
                        fy += (dy / d) * s
                    }
                }

                let fMag = hypot(fx, fy)
                if fMag > 0.01 {
                    vx = vx * 0.88 + (fx / fMag) * paleOneSpeed * 0.4
                    vy = vy * 0.88 + (fy / fMag) * paleOneSpeed * 0.4
                }
                let vMag = hypot(vx, vy)
                if vMag > paleOneSpeed {
                    let scale = paleOneSpeed / vMag
                    vx *= scale
                    vy *= scale
                }
                px += vx
                py += vy
                px = max(wandererRadius + 20, min(w - wandererRadius - 20, px))
                py = max(wandererRadius + 20, min(h - wandererRadius - 20, py))

                paleNode.position = CGPoint(x: px, y: py)
                paleNode.userData?["x"] = px
                paleNode.userData?["y"] = py
                paleNode.userData?["vx"] = vx
                paleNode.userData?["vy"] = vy
            }

            let minDist = paleOneRadius * 2.5
            for i in 0..<paleOnes.count {
                for j in (i + 1)..<paleOnes.count {
                    let p = paleOnes[i]
                    let q = paleOnes[j]
                    guard var px = p.userData?["x"] as? CGFloat,
                          var py = p.userData?["y"] as? CGFloat,
                          var qx = q.userData?["x"] as? CGFloat,
                          var qy = q.userData?["y"] as? CGFloat else { continue }
                    let dx = qx - px
                    let dy = qy - py
                    let d = hypot(dx, dy)
                    if d < minDist, d > 0 {
                        let overlap = minDist - d
                        let nx = dx / d
                        let ny = dy / d
                        px -= nx * overlap * 0.5
                        py -= ny * overlap * 0.5
                        qx += nx * overlap * 0.5
                        qy += ny * overlap * 0.5
                        p.position = CGPoint(x: px, y: py)
                        q.position = CGPoint(x: qx, y: qy)
                        p.userData?["x"] = px
                        p.userData?["y"] = py
                        q.userData?["x"] = qx
                        q.userData?["y"] = qy
                    }
                }
            }

            for paleNode in paleOnes {
                let colDist = hypot(wanderer.position.x - paleNode.position.x, wanderer.position.y - paleNode.position.y)
                if colDist < collisionRadius {
                    AudioManager.shared.play(.caught)
                    loadLevel()
                    return
                }
            }
        }

        let hitsPerProgress = 1 + gameState.levelIndex / 10
        for i in crowdMembers.indices {
            var (node, progress, subProgress, awakened) = crowdMembers[i]
            if awakened { continue }
            let dist = hypot(wanderer.position.x - node.position.x, wanderer.position.y - node.position.y)
            if dist < awakenRadius, wandererState == "alive" {
                subProgress += 1
                while subProgress >= hitsPerProgress, progress < awakenTime {
                    subProgress -= hitsPerProgress
                    progress += 1
                    if progress >= awakenTime {
                        awakened = true
                        node.texture = Self.crowdAmberTexture ?? makeSphereTexture(radius: baseCrowdRadius, baseColor: UIColor(red: 1, green: 0.55, blue: 0.2, alpha: 1), highlight: 0.4)
                        if Self.crowdAmberTexture == nil { Self.crowdAmberTexture = node.texture }
                        AudioManager.shared.play(.awaken)
                        break
                    } else {
                        let t = CGFloat(progress) / CGFloat(awakenTime)
                        let r = 0.24 + t * 0.76
                        let g = 0.24 + t * 0.31
                        let b = 0.25 - t * 0.05
                        let color = UIColor(red: r, green: g, blue: b, alpha: 1)
                        if let tex = Self.crowdProgressTextures[progress] {
                            node.texture = tex
                        } else {
                            let tex = makeSphereTexture(radius: baseCrowdRadius, baseColor: color)
                            Self.crowdProgressTextures[progress] = tex
                            node.texture = tex
                        }
                    }
                }
            }
            crowdMembers[i] = (node, progress, subProgress, awakened)
        }

        gameState.awakenedCount = crowdMembers.filter { $0.2 }.count
        if gameState.awakenedCount >= gameState.awakenGoal {
            AudioManager.shared.play(.levelComplete)
            gameState.showLevelComplete = true
            isPaused = true
        } else {
            levelTimer -= 1
            gameState.levelTimerRemaining = max(0, levelTimer / 60)
            if levelTimer <= 0 {
                AudioManager.shared.play(.caught)
                loadLevel()
            }
        }
    }
}
