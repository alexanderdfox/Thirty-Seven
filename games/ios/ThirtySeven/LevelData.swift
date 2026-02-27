//
//  LevelData.swift
//  Thirty Seven
//

import CoreGraphics

struct LevelData {
    let name: String
    let backgroundColorRGB: (Double, Double, Double)
    let wandererStart: CGPoint
    let paleOnePositions: [CGPoint]
    let crowdPositions: [CGPoint]
    let awakenGoal: Int

    static let presetLevels: [LevelData] = [
        LevelData(
            name: "THE BIRTHPLACE",
            backgroundColorRGB: (0.02, 0.02, 0.08),
            wandererStart: CGPoint(x: 0.5, y: 0.5),
            paleOnePositions: [],
            crowdPositions: [(0.2, 0.3), (0.8, 0.3), (0.5, 0.8), (0.3, 0.6), (0.7, 0.5)].map { CGPoint(x: $0.0, y: $0.1) },
            awakenGoal: 3
        ),
        LevelData(
            name: "OLD WORLD TAVERN",
            backgroundColorRGB: (0.1, 0.08, 0.06),
            wandererStart: CGPoint(x: 0.2, y: 0.5),
            paleOnePositions: [(0.8, 0.3), (0.9, 0.7)].map { CGPoint(x: $0.0, y: $0.1) },
            crowdPositions: [(0.4, 0.4), (0.5, 0.5), (0.6, 0.4), (0.35, 0.7), (0.65, 0.7), (0.5, 0.25)].map { CGPoint(x: $0.0, y: $0.1) },
            awakenGoal: 4
        ),
        LevelData(
            name: "NEON ALLEY",
            backgroundColorRGB: (0.06, 0.04, 0.14),
            wandererStart: CGPoint(x: 0.5, y: 0.5),
            paleOnePositions: [(0.1, 0.2), (0.9, 0.2), (0.1, 0.8), (0.9, 0.8)].map { CGPoint(x: $0.0, y: $0.1) },
            crowdPositions: [(0.2, 0.5), (0.3, 0.4), (0.3, 0.6), (0.7, 0.5), (0.8, 0.4), (0.8, 0.6), (0.5, 0.2), (0.5, 0.8)].map { CGPoint(x: $0.0, y: $0.1) },
            awakenGoal: 5
        ),
        LevelData(
            name: "FOREST",
            backgroundColorRGB: (0.03, 0.06, 0.03),
            wandererStart: CGPoint(x: 0.5, y: 0.5),
            paleOnePositions: [(0.15, 0.15), (0.85, 0.15), (0.5, 0.1), (0.2, 0.8), (0.8, 0.8)].map { CGPoint(x: $0.0, y: $0.1) },
            crowdPositions: [(0.25, 0.3), (0.75, 0.3), (0.25, 0.7), (0.75, 0.7), (0.5, 0.4), (0.4, 0.6), (0.6, 0.6)].map { CGPoint(x: $0.0, y: $0.1) },
            awakenGoal: 5
        ),
        LevelData(
            name: "THE CROWD",
            backgroundColorRGB: (0.06, 0.04, 0.08),
            wandererStart: CGPoint(x: 0.5, y: 0.5),
            paleOnePositions: [(0.1, 0.5), (0.9, 0.5), (0.5, 0.1), (0.5, 0.9), (0.2, 0.2), (0.8, 0.8)].map { CGPoint(x: $0.0, y: $0.1) },
            crowdPositions: (0..<20).map { i in CGPoint(x: 0.2 + Double(i % 5) * 0.15, y: 0.2 + Double(i / 5) * 0.15) },
            awakenGoal: 12
        ),
        LevelData(
            name: "LIGHTS OUT",
            backgroundColorRGB: (0.01, 0.01, 0.03),
            wandererStart: CGPoint(x: 0.5, y: 0.5),
            paleOnePositions: [(0.2, 0.2), (0.8, 0.2), (0.2, 0.8), (0.8, 0.8), (0.5, 0.5)].map { CGPoint(x: $0.0, y: $0.1) },
            crowdPositions: [(0.3, 0.4), (0.7, 0.4), (0.3, 0.6), (0.7, 0.6), (0.5, 0.5)].map { CGPoint(x: $0.0, y: $0.1) },
            awakenGoal: 5
        )
    ]

    static func coolColor(seed: Int) -> (Double, Double, Double) {
        var rng = SeededRandomNumberGenerator(seed: UInt64(seed))
        let r = Double(Int.random(in: 2...15, using: &rng))
        var g = Double(Int.random(in: 5...29, using: &rng))
        let b = Double(Int.random(in: 18...45, using: &rng))
        g = min(g, b - 5)
        return (r / 255, g / 255, b / 255)
    }

    static func generateRandom(levelNumber: Int) -> LevelData {
        var rng = SeededRandomNumberGenerator(seed: UInt64(levelNumber))
        let backgroundColorRGB = coolColor(seed: levelNumber * 7919)

        let paleCount = min(12, 4 + levelNumber / 2)
        let crowdCount = min(30, 8 + levelNumber)
        let awakenGoal = max(3, min(crowdCount - 2, 5 + levelNumber / 2))

        func randomPos() -> CGPoint {
            CGPoint(
                x: 0.15 + Double.random(in: 0...0.7, using: &rng),
                y: 0.15 + Double.random(in: 0...0.7, using: &rng)
            )
        }

        let palePositions = (0..<paleCount).map { _ in randomPos() }
        let crowdPositions = (0..<crowdCount).map { _ in randomPos() }

        let eraNames = ["THE RIFT", "ECHO", "ETERNAL RETURN", "THE CYCLE", "VOID", "THE SPARK", "LONGING", "THE NOTE"]
        let name = "\(eraNames[Int.random(in: 0..<eraNames.count, using: &rng)]) #\(levelNumber)"

        return LevelData(
            name: name,
            backgroundColorRGB: backgroundColorRGB,
            wandererStart: CGPoint(x: 0.5, y: 0.5),
            paleOnePositions: palePositions,
            crowdPositions: crowdPositions,
            awakenGoal: awakenGoal
        )
    }
}

struct SeededRandomNumberGenerator: RandomNumberGenerator {
    private var state: UInt64

    init(seed: UInt64) {
        state = seed
    }

    mutating func next() -> UInt64 {
        state = state &* 6364136223846793005 &+ 1442695040888963407
        return state
    }
}
