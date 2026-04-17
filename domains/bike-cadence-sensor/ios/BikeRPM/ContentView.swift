import SwiftUI

struct ContentView: View {
    @StateObject private var detector = CadenceDetector()

    private var cadenceColor: Color {
        switch detector.cadenceRPM {
        case 0:         return .gray
        case ..<60:     return .blue
        case 60..<80:   return .cyan
        case 80..<100:  return .green
        case 100..<120: return .yellow
        default:        return .orange
        }
    }

    private var zoneLabel: String {
        switch detector.cadenceRPM {
        case 0:         return "Not riding"
        case ..<60:     return "Low — push harder"
        case 60..<80:   return "Moderate"
        case 80..<100:  return "Optimal zone"
        case 100..<120: return "High"
        default:        return "Very high"
        }
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 36) {
                Text("Bike Cadence")
                    .font(.largeTitle.bold())
                    .foregroundStyle(.white)

                // Circular gauge
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.08), lineWidth: 22)
                        .frame(width: 250, height: 250)

                    Circle()
                        .trim(from: 0, to: CGFloat(min(detector.cadenceRPM / 180.0, 1.0)))
                        .stroke(
                            cadenceColor,
                            style: StrokeStyle(lineWidth: 22, lineCap: .round)
                        )
                        .frame(width: 250, height: 250)
                        .rotationEffect(.degrees(-90))
                        .animation(.easeInOut(duration: 0.4), value: detector.cadenceRPM)

                    VStack(spacing: 6) {
                        Text(detector.isRunning ? String(format: "%.0f", detector.cadenceRPM) : "—")
                            .font(.system(size: 76, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                            .contentTransition(.numericText())
                            .animation(.easeInOut(duration: 0.3), value: detector.cadenceRPM)

                        Text("RPM")
                            .font(.title3.bold())
                            .foregroundStyle(.gray)

                        Text(detector.isRunning ? zoneLabel : "Tap Start to measure")
                            .font(.caption)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 3)
                            .background(cadenceColor.opacity(0.2))
                            .foregroundStyle(cadenceColor)
                            .clipShape(Capsule())
                    }
                }

                // Signal strength bar
                VStack(alignment: .leading, spacing: 6) {
                    Text("VIBRATION SIGNAL")
                        .font(.caption2.bold())
                        .foregroundStyle(.gray)
                        .tracking(1.5)

                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.white.opacity(0.1))

                            RoundedRectangle(cornerRadius: 4)
                                .fill(
                                    LinearGradient(
                                        colors: [.green, .yellow, .orange],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: geo.size.width * CGFloat(detector.signalStrength))
                                .animation(.easeInOut(duration: 0.15), value: detector.signalStrength)
                        }
                    }
                    .frame(height: 10)

                    Text(detector.isRunning
                         ? (detector.signalStrength < 0.05 ? "Weak — keep pedaling" : "Signal detected")
                         : "Mount iPhone on handlebar or bike frame")
                        .font(.caption2)
                        .foregroundStyle(.gray)
                }
                .padding(.horizontal, 32)
                .opacity(detector.isRunning ? 1 : 0.4)

                // Cadence reference
                CadenceScaleView()

                Spacer()

                Button {
                    if detector.isRunning { detector.stop() } else { detector.start() }
                } label: {
                    Text(detector.isRunning ? "Stop" : "Start")
                        .font(.title2.bold())
                        .foregroundStyle(.black)
                        .frame(width: 180, height: 58)
                        .background(detector.isRunning ? Color.red : Color.green)
                        .clipShape(Capsule())
                }
                .padding(.bottom, 20)
            }
            .padding()
        }
    }
}

struct CadenceScaleView: View {
    private let zones: [(range: String, label: String, color: Color)] = [
        ("<60",    "Low",     .blue),
        ("60–80",  "Moderate",.cyan),
        ("80–100", "Optimal", .green),
        ("100+",   "High",    .orange),
    ]

    var body: some View {
        HStack(spacing: 6) {
            ForEach(zones, id: \.range) { zone in
                VStack(spacing: 3) {
                    Text(zone.range)
                        .font(.caption2.bold())
                        .foregroundStyle(zone.color)
                    Text(zone.label)
                        .font(.caption2)
                        .foregroundStyle(.gray)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
                .background(zone.color.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .padding(.horizontal, 16)
    }
}

#Preview {
    ContentView()
}
