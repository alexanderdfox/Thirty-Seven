//
//  ContentView.swift
//  Thirty Seven
//

import SwiftUI

struct ContentView: View {
    @State private var showGame = false
    @State private var showHowToPlay = false

    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(
                    colors: [
                        Color(red: 0.02, green: 0.02, blue: 0.08),
                        Color(red: 0.05, green: 0.05, blue: 0.15)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                VStack(spacing: 32) {
                    Spacer()

                    Text("THIRTY SEVEN")
                        .font(.system(size: 42, weight: .bold))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color(red: 1, green: 0.84, blue: 0.39), Color(red: 1, green: 0.55, blue: 0.2)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .shadow(color: Color(red: 1, green: 0.7, blue: 0.3).opacity(0.5), radius: 8)

                    Text("A Parable of Desire, Death,\nand the Undying Cycle")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(Color(red: 0.6, green: 0.6, blue: 0.65))
                        .multilineTextAlignment(.center)
                        .padding(.bottom, 24)

                    Spacer()

                    VStack(spacing: 16) {
                        Button {
                            AudioManager.shared.play(.menuTap)
                            showGame = true
                        } label: {
                            Text("PLAY")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundStyle(.black)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 18)
                                .background(
                                    LinearGradient(
                                        colors: [Color(red: 1, green: 0.84, blue: 0.39), Color(red: 1, green: 0.55, blue: 0.2)],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .buttonStyle(.plain)

                        Button {
                            AudioManager.shared.play(.menuTap)
                            showHowToPlay = true
                        } label: {
                            Text("HOW TO PLAY")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundStyle(Color(red: 0.9, green: 0.85, blue: 0.7))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color(red: 0.6, green: 0.55, blue: 0.4), lineWidth: 1)
                                )
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.horizontal, 40)
                    .padding(.bottom, 60)
                }
            }
            .navigationDestination(isPresented: $showGame) {
                GameContainerView()
            }
            .sheet(isPresented: $showHowToPlay) {
                HowToPlayView()
            }
        }
    }
}

struct HowToPlayView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            Color(red: 0.05, green: 0.05, blue: 0.12)
                .ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Text("How to Play")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundStyle(Color(red: 1, green: 0.84, blue: 0.39))

                    VStack(alignment: .leading, spacing: 16) {
                        InstructionRow(icon: "hand.draw", text: "Touch and drag to move the Wanderer")
                        InstructionRow(icon: "circle.circle", text: "Get near souls (grey circles) to awaken them")
                        InstructionRow(icon: "flame", text: "Awakened souls turn amber—reach the goal to advance")
                        InstructionRow(icon: "eye.slash", text: "Avoid the Pale Ones (pale circles)—they hunt you")
                        InstructionRow(icon: "sparkles", text: "Tap BREATHE, then LIGHTS OUT to become invulnerable")
                        InstructionRow(icon: "arrow.trianglehead.2.clockwise", text: "During fall/rise you cannot be caught")
                    }

                    Text("While true. Breathe. Fall. Rise. Done.")
                        .font(.system(size: 16, weight: .medium, design: .serif))
                        .foregroundStyle(Color(red: 0.7, green: 0.65, blue: 0.5))
                        .italic()
                        .padding(.top, 8)

                    Text("The fire never dies.")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Color(red: 1, green: 0.55, blue: 0.2))
                }
                .padding(24)
            }

            VStack {
                HStack {
                    Spacer()
                    Button("Done") {
                        AudioManager.shared.play(.menuTap)
                        dismiss()
                    }
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(Color(red: 1, green: 0.84, blue: 0.39))
                    .padding()
                }
                Spacer()
            }
        }
    }
}

struct InstructionRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(Color(red: 1, green: 0.7, blue: 0.3))
                .frame(width: 32, alignment: .center)
            Text(text)
                .font(.system(size: 16))
                .foregroundStyle(Color(red: 0.85, green: 0.82, blue: 0.78))
        }
    }
}

#Preview {
    ContentView()
}
