//
//  AudioManager.swift
//  Thirty Seven
//

import AVFoundation
import UIKit

enum SoundEffect {
    case menuTap
    case breathe
    case lightsOut
    case rise
    case awaken
    case caught
    case levelComplete
}

final class AudioManager {
    static let shared = AudioManager()

    private var audioEngine: AVAudioEngine?
    private var playerNode: AVAudioPlayerNode?
    private var isSetup = false

    private init() {
        setupAudioSession()
    }

    private func setupAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
            isSetup = true
        } catch {
            print("Audio session setup failed: \(error)")
        }
    }

    func play(_ effect: SoundEffect) {
        guard isSetup else { return }

        let (frequency, duration, volume): (Float, Double, Float) = {
            switch effect {
            case .menuTap: return (880, 0.08, 0.3)
            case .breathe: return (220, 0.15, 0.4)
            case .lightsOut: return (110, 0.4, 0.5)
            case .rise: return (440, 0.2, 0.5)
            case .awaken: return (660, 0.12, 0.35)
            case .caught: return (150, 0.5, 0.6)
            case .levelComplete: return (523, 0.25, 0.5)
            }
        }()

        playTone(frequency: frequency, duration: duration, volume: volume)
    }

    private func playTone(frequency: Float, duration: Double, volume: Float) {
        let sampleRate: Double = 44100
        let frameCount = AVAudioFrameCount(sampleRate * duration)
        let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)!

        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return }
        buffer.frameLength = frameCount

        guard let channelData = buffer.floatChannelData?[0] else { return }

        for i in 0..<Int(frameCount) {
            let t = Float(i) / Float(sampleRate)
            let envelope = 1 - (Float(i) / Float(frameCount)) * 0.7
            channelData[i] = sin(2 * .pi * frequency * t) * volume * envelope * 0.3
        }

        DispatchQueue.main.async { [weak self] in
            self?.playBuffer(buffer, format: format)
        }
    }

    private func playBuffer(_ buffer: AVAudioPCMBuffer, format: AVAudioFormat) {
        if audioEngine == nil {
            audioEngine = AVAudioEngine()
        }
        guard let engine = audioEngine else { return }

        let node: AVAudioPlayerNode
        if let existing = playerNode {
            node = existing
            node.stop()
        } else {
            node = AVAudioPlayerNode()
            engine.attach(node)
            engine.connect(node, to: engine.mainMixerNode, format: format)
            playerNode = node
        }

        do {
            if !engine.isRunning {
                try engine.start()
            }
            node.scheduleBuffer(buffer)
            node.play()
        } catch {
            print("Audio play failed: \(error)")
        }
    }
}
