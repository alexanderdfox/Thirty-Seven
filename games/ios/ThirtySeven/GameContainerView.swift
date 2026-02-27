//
//  GameContainerView.swift
//  Thirty Seven
//

import SwiftUI
import SpriteKit
import UIKit

struct GameSceneView: View {
    @ObservedObject var gameState: GameState
    @Binding var gameScene: GameScene?

    var body: some View {
        GeometryReader { geometry in
            SpriteKitView(
                gameState: gameState,
                gameScene: $gameScene,
                size: geometry.size
            )
        }
        .ignoresSafeArea()
    }
}

struct SpriteKitView: UIViewRepresentable {
    @ObservedObject var gameState: GameState
    @Binding var gameScene: GameScene?
    var size: CGSize

    func makeUIView(context: Context) -> SKView {
        let skView = SKView()
        skView.ignoresSiblingOrder = true
        skView.showsFPS = false
        skView.showsNodeCount = false

        let sceneSize = size.width > 0 && size.height > 0 ? size : UIScreen.main.bounds.size
        let scene = GameScene(size: sceneSize)
        scene.scaleMode = .resizeFill
        scene.gameState = gameState
        gameState.gameScene = scene
        gameScene = scene

        skView.presentScene(scene)
        return skView
    }

    func updateUIView(_ uiView: SKView, context: Context) {
        let sceneSize = size.width > 0 && size.height > 0 ? size : UIScreen.main.bounds.size
        if let scene = uiView.scene as? GameScene, scene.size != sceneSize {
            scene.size = sceneSize
            scene.reloadLevel()
        }
    }
}

struct GameContainerView: View {
    @StateObject private var gameState = GameState()
    @State private var gameScene: GameScene?
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            GameSceneView(gameState: gameState, gameScene: $gameScene)

            if gameState.showLevelComplete {
                LevelCompleteOverlay(
                    levelName: gameState.currentLevelName,
                    onContinue: {
                        gameState.advanceLevel()
                        gameState.showLevelComplete = false
                    }
                )
            }

            GeometryReader { geo in
                let scale = min(1.4, max(0.9, min(geo.size.width, geo.size.height) / 400))
                VStack {
                    HStack {
                        Button {
                            AudioManager.shared.play(.menuTap)
                            dismiss()
                        } label: {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 20 * scale, weight: .semibold))
                                .foregroundStyle(Color(red: 0.9, green: 0.85, blue: 0.7))
                                .frame(width: 44 * scale, height: 44 * scale)
                        }
                        .padding(.leading, max(8, 20 * scale))

                        Spacer()

                        Text(gameState.currentLevelName)
                            .font(.system(size: 14 * scale, weight: .medium))
                            .foregroundStyle(Color(red: 0.5, green: 0.5, blue: 0.55))

                        Spacer()

                        HStack(spacing: 8) {
                            Text("\(gameState.levelTimerRemaining)")
                                .font(.system(size: 14 * scale, weight: .medium, design: .monospaced))
                                .foregroundStyle(Color(red: 0.6, green: 0.58, blue: 0.5))
                            Text("\(gameState.awakenedCount)/\(gameState.awakenGoal)")
                                .font(.system(size: 16 * scale, weight: .bold))
                                .foregroundStyle(Color(red: 1, green: 0.7, blue: 0.3))
                        }
                        .padding(.trailing, max(20, 24 * scale))
                    }
                    .padding(.top, max(8, 12 * scale))

                    Spacer()
                }
            }
        }
        .navigationBarBackButtonHidden(true)
    }
}

struct LevelCompleteOverlay: View {
    let levelName: String
    let onContinue: () -> Void

    var body: some View {
        GeometryReader { geo in
            let scale = min(1.4, max(0.9, min(geo.size.width, geo.size.height) / 400))
            ZStack {
                Color.black.opacity(0.7)
                    .ignoresSafeArea()

                VStack(spacing: 24 * scale) {
                    Text("LEVEL COMPLETE")
                        .font(.system(size: 28 * scale, weight: .bold))
                        .foregroundStyle(Color(red: 1, green: 0.84, blue: 0.39))

                    Text(levelName)
                        .font(.system(size: 16 * scale))
                        .foregroundStyle(Color(red: 0.7, green: 0.65, blue: 0.5))

                    Button {
                        AudioManager.shared.play(.levelComplete)
                        onContinue()
                    } label: {
                        Text("Continue")
                            .font(.system(size: 18 * scale, weight: .semibold))
                            .foregroundStyle(.black)
                            .padding(.horizontal, 32 * scale)
                            .padding(.vertical, 14 * scale)
                            .background(Color(red: 1, green: 0.84, blue: 0.39))
                            .clipShape(RoundedRectangle(cornerRadius: 10 * scale))
                    }
                    .padding(.top, 8 * scale)
                }
            }
        }
    }
}
