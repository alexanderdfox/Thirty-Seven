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
        SpriteKitView(gameState: gameState, gameScene: $gameScene)
    }
}

struct SpriteKitView: UIViewRepresentable {
    @ObservedObject var gameState: GameState
    @Binding var gameScene: GameScene?

    func makeUIView(context: Context) -> SKView {
        let skView = SKView()
        skView.ignoresSiblingOrder = true
        skView.showsFPS = false
        skView.showsNodeCount = false

        let scene = GameScene(size: UIScreen.main.bounds.size)
        scene.scaleMode = .resizeFill
        scene.gameState = gameState
        gameState.gameScene = scene
        gameScene = scene

        skView.presentScene(scene)
        return skView
    }

    func updateUIView(_ uiView: SKView, context: Context) {}
}

struct GameContainerView: View {
    @StateObject private var gameState = GameState()
    @State private var gameScene: GameScene?
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            GameSceneView(gameState: gameState, gameScene: $gameScene)
                .ignoresSafeArea()

            if gameState.showLevelComplete {
                LevelCompleteOverlay(
                    levelName: gameState.currentLevelName,
                    onContinue: {
                        gameState.advanceLevel()
                        gameState.showLevelComplete = false
                    }
                )
            }

            VStack {
                HStack {
                    Button {
                        AudioManager.shared.play(.menuTap)
                        dismiss()
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundStyle(Color(red: 0.9, green: 0.85, blue: 0.7))
                            .frame(width: 44, height: 44)
                    }
                    .padding(.leading, 8)

                    Spacer()

                    Text(gameState.currentLevelName)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(Color(red: 0.5, green: 0.5, blue: 0.55))

                    Spacer()

                    Text("\(gameState.awakenedCount)/\(gameState.awakenGoal)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(Color(red: 1, green: 0.7, blue: 0.3))
                        .padding(.trailing, 20)
                }
                .padding(.top, 8)

                Spacer()
            }
        }
        .navigationBarBackButtonHidden(true)
    }
}

struct LevelCompleteOverlay: View {
    let levelName: String
    let onContinue: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.7)
                .ignoresSafeArea()

            VStack(spacing: 24) {
                Text("LEVEL COMPLETE")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(Color(red: 1, green: 0.84, blue: 0.39))

                Text(levelName)
                    .font(.system(size: 16))
                    .foregroundStyle(Color(red: 0.7, green: 0.65, blue: 0.5))

                Button {
                    AudioManager.shared.play(.levelComplete)
                    onContinue()
                } label: {
                    Text("Continue")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(.black)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 14)
                        .background(Color(red: 1, green: 0.84, blue: 0.39))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .padding(.top, 8)
            }
        }
    }
}
