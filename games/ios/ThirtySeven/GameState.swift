//
//  GameState.swift
//  Thirty Seven
//

import SwiftUI

class GameState: ObservableObject {
    weak var gameScene: GameScene?

    @Published var levelIndex: Int = 0
    @Published var showLevelComplete: Bool = false
    @Published var awakenedCount: Int = 0
    @Published var awakenGoal: Int = 3
    @Published var currentLevelName: String = "THE BIRTHPLACE"
    @Published var levelTimerRemaining: Int = 37

    var currentLevel: LevelData {
        if levelIndex < LevelData.presetLevels.count {
            return LevelData.presetLevels[levelIndex]
        } else {
            return LevelData.generateRandom(levelNumber: levelIndex + 1)
        }
    }

    func advanceLevel() {
        levelIndex += 1
        let level = currentLevel
        awakenGoal = level.awakenGoal
        currentLevelName = level.name
        gameScene?.reloadLevel()
    }

    func reset() {
        levelIndex = 0
        showLevelComplete = false
        awakenedCount = 0
        let level = currentLevel
        awakenGoal = level.awakenGoal
        currentLevelName = level.name
    }
}
