//
//  GameScene.swift
//  Thirty Seven
//

import SpriteKit

final class GameScene: SKScene {
    weak var gameState: GameState!

    private var wanderer: SKShapeNode!
    private var paleOnes: [SKShapeNode] = []
    private var crowdMembers: [(node: SKShapeNode, progress: Int, awakened: Bool)] = []
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

    private let wandererRadius: CGFloat = 22
    private let paleOneRadius: CGFloat = 18
    private let crowdRadius: CGFloat = 14
    private let awakenRadius: CGFloat = 90
    private let awakenTime = 60
    private let paleOneSpeed: CGFloat = 2.8
    private let collisionRadius: CGFloat = 38

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

        for pos in levelData.paleOnePositions {
            let node = createPaleOne()
            node.position = CGPoint(x: pos.x * w, y: (1 - pos.y) * h)
            node.userData = ["x": pos.x * w, "y": (1 - pos.y) * h]
            addChild(node)
            paleOnes.append(node)
        }

        for pos in levelData.crowdPositions {
            let node = createCrowdMember(awakened: false)
            node.position = CGPoint(x: pos.x * w, y: (1 - pos.y) * h)
            addChild(node)
            crowdMembers.append((node: node, progress: 0, awakened: false))
        }

        setupUI()
    }

    private func setupUI() {
        vowLabel = SKLabelNode(text: "While true. Do.")
        vowLabel.fontName = "AvenirNext-Medium"
        vowLabel.fontSize = 18
        vowLabel.fontColor = UIColor(red: 1, green: 0.84, blue: 0.39, alpha: 1)
        vowLabel.position = CGPoint(x: size.width / 2, y: size.height - 50)
        addChild(vowLabel)

        breatheButton = SKShapeNode(rectOf: CGSize(width: 140, height: 44), cornerRadius: 8)
        breatheButton.fillColor = UIColor(red: 0.3, green: 0.25, blue: 0.2, alpha: 0.9)
        breatheButton.strokeColor = UIColor(red: 0.6, green: 0.5, blue: 0.3, alpha: 1)
        breatheButton.lineWidth = 1
        breatheButton.position = CGPoint(x: size.width / 2, y: 50)
        breatheButton.name = "breatheButton"
        addChild(breatheButton)

        breatheLabel = SKLabelNode(text: "BREATHE")
        breatheLabel.fontName = "AvenirNext-Bold"
        breatheLabel.fontSize = 16
        breatheLabel.fontColor = UIColor(red: 1, green: 0.84, blue: 0.39, alpha: 1)
        breatheLabel.verticalAlignmentMode = .center
        breatheButton.addChild(breatheLabel)
    }

    private func createWanderer() -> SKShapeNode {
        let node = SKShapeNode(circleOfRadius: wandererRadius)
        node.fillColor = UIColor(red: 0.35, green: 0.35, blue: 0.37, alpha: 1)
        node.strokeColor = .clear
        node.name = "wanderer"
        return node
    }

    private func createPaleOne() -> SKShapeNode {
        let node = SKShapeNode(circleOfRadius: paleOneRadius)
        node.fillColor = UIColor(red: 0.86, green: 0.82, blue: 0.78, alpha: 1)
        node.strokeColor = .clear
        let leftEye = SKShapeNode(circleOfRadius: 3)
        leftEye.fillColor = UIColor(red: 0.7, green: 0.67, blue: 0.78, alpha: 1)
        leftEye.position = CGPoint(x: -5, y: 3)
        node.addChild(leftEye)
        let rightEye = SKShapeNode(circleOfRadius: 3)
        rightEye.fillColor = UIColor(red: 0.7, green: 0.67, blue: 0.78, alpha: 1)
        rightEye.position = CGPoint(x: 5, y: 3)
        node.addChild(rightEye)
        return node
    }

    private func createCrowdMember(awakened: Bool) -> SKShapeNode {
        let node = SKShapeNode(circleOfRadius: crowdRadius)
        node.fillColor = awakened
            ? UIColor(red: 1, green: 0.55, blue: 0.2, alpha: 1)
            : UIColor(red: 0.24, green: 0.24, blue: 0.25, alpha: 1)
        node.strokeColor = .clear
        return node
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let loc = touch.location(in: self)

        if let button = atPoint(loc) as? SKShapeNode, button.name == "breatheButton" {
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
            breathTimer = 30
            AudioManager.shared.play(.breathe)
        } else if wandererState == "breathing" {
            wandererState = "falling"
            fallTimer = 60
            lightsOutCooldown = 180
            AudioManager.shared.play(.lightsOut)
        }
    }

    override func update(_ currentTime: TimeInterval) {
        guard wanderer != nil else { return }

        let dt: CGFloat = 1.0 / 60.0
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
            wanderer.alpha = max(0, CGFloat(fallTimer) / 60)
            vowLabel.text = "Fall."
            if fallTimer <= 0 {
                wandererState = "rising"
                riseTimer = 45
                invulnTimer = 90
                wanderer.alpha = 0.5
                AudioManager.shared.play(.rise)
            }
        } else if wandererState == "rising" {
            riseTimer -= 1
            invulnTimer -= 1
            wanderer.alpha = 0.5 + (1 - CGFloat(riseTimer) / 45) * 0.5
            if riseTimer <= 0 {
                wandererState = "alive"
                wanderer.alpha = 1
            }
            vowLabel.text = "Rise."
        } else {
            vowLabel.text = "While true. Do."
        }

        if lightsOutCooldown > 0 { lightsOutCooldown -= 1 }

        if wandererState != "falling", wandererState != "rising", invulnTimer <= 0 {
            for paleNode in paleOnes {
                guard let ud = paleNode.userData,
                      var px = ud["x"] as? CGFloat,
                      var py = ud["y"] as? CGFloat else { continue }
                let dx = wanderer.position.x - px
                let dy = wanderer.position.y - py
                let dist = sqrt(dx * dx + dy * dy)
                if dist > 5 {
                    let speed = paleOneSpeed * dt * 60
                    px += (dx / dist) * speed
                    py += (dy / dist) * speed
                    paleNode.position = CGPoint(x: px, y: py)
                    paleNode.userData?["x"] = px
                    paleNode.userData?["y"] = py
                }
                let colDist = sqrt(pow(wanderer.position.x - paleNode.position.x, 2) + pow(wanderer.position.y - paleNode.position.y, 2))
                if colDist < collisionRadius {
                    AudioManager.shared.play(.caught)
                    loadLevel()
                    return
                }
            }
        }

        for i in crowdMembers.indices {
            var (node, progress, awakened) = crowdMembers[i]
            if awakened { continue }
            let dist = hypot(wanderer.position.x - node.position.x, wanderer.position.y - node.position.y)
            if dist < awakenRadius, wandererState == "alive" {
                progress = min(awakenTime, progress + 1)
                if progress >= awakenTime {
                    awakened = true
                    node.fillColor = UIColor(red: 1, green: 0.55, blue: 0.2, alpha: 1)
                    AudioManager.shared.play(.awaken)
                } else {
                    let grey = 0.24 + CGFloat(progress) / CGFloat(awakenTime) * 0.3
                    node.fillColor = UIColor(red: grey, green: grey, blue: grey + 0.01, alpha: 1)
                }
            }
            crowdMembers[i] = (node, progress, awakened)
        }

        gameState.awakenedCount = crowdMembers.filter { $0.2 }.count
        if awakenedCount >= gameState.awakenGoal {
            AudioManager.shared.play(.levelComplete)
            gameState.showLevelComplete = true
            isPaused = true
        }
    }
}
