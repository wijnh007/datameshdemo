import CoreMotion
import Combine
import Foundation

class CadenceDetector: ObservableObject {
    private let motionManager = CMMotionManager()
    private let sampleRate: Double = 50.0
    private let windowDuration: Double = 6.0

    @Published var cadenceRPM: Double = 0
    @Published var isRunning: Bool = false
    @Published var signalStrength: Double = 0

    private var sampleBuffer: [Double] = []
    private var maxBufferSize: Int { Int(sampleRate * windowDuration) }

    // Low-pass filter to estimate and subtract gravity
    private var gravity = (x: 0.0, y: 0.0, z: 0.0)
    private let gravityAlpha = 0.9

    private var lastAutocorrTime: TimeInterval = 0

    func start() {
        guard motionManager.isAccelerometerAvailable else { return }
        motionManager.accelerometerUpdateInterval = 1.0 / sampleRate
        isRunning = true
        sampleBuffer = []
        gravity = (0, 0, 0)
        lastAutocorrTime = 0

        motionManager.startAccelerometerUpdates(to: .main) { [weak self] data, _ in
            guard let self, let data else { return }
            self.process(data)
        }
    }

    func stop() {
        motionManager.stopAccelerometerUpdates()
        isRunning = false
        cadenceRPM = 0
        signalStrength = 0
        sampleBuffer = []
    }

    private func process(_ data: CMAccelerometerData) {
        let ax = data.acceleration.x
        let ay = data.acceleration.y
        let az = data.acceleration.z

        // Track gravity via low-pass filter
        gravity.x = gravityAlpha * gravity.x + (1 - gravityAlpha) * ax
        gravity.y = gravityAlpha * gravity.y + (1 - gravityAlpha) * ay
        gravity.z = gravityAlpha * gravity.z + (1 - gravityAlpha) * az

        // Dynamic (non-gravitational) acceleration magnitude
        let dx = ax - gravity.x
        let dy = ay - gravity.y
        let dz = az - gravity.z
        let magnitude = sqrt(dx*dx + dy*dy + dz*dz)

        sampleBuffer.append(magnitude)
        if sampleBuffer.count > maxBufferSize {
            sampleBuffer.removeFirst()
        }

        signalStrength = min(1.0, rms(of: sampleBuffer.suffix(Int(sampleRate))) / 0.4)

        // Recompute cadence via autocorrelation once per second after 3s of data
        let now = data.timestamp
        if now - lastAutocorrTime >= 1.0 && sampleBuffer.count >= Int(sampleRate * 3) {
            lastAutocorrTime = now
            updateCadence()
        }
    }

    private func rms(of slice: ArraySlice<Double>) -> Double {
        guard !slice.isEmpty else { return 0 }
        return sqrt(slice.reduce(0) { $0 + $1 * $1 } / Double(slice.count))
    }

    private func updateCadence() {
        let signal = sampleBuffer
        let n = signal.count
        let mean = signal.reduce(0, +) / Double(n)
        let centered = signal.map { $0 - mean }

        // Lag range corresponding to 30–200 RPM at current sample rate
        let minLag = Int(sampleRate * 60.0 / 200.0)  // 200 RPM → short period
        let maxLag = Int(sampleRate * 60.0 / 30.0)   // 30 RPM → long period

        guard minLag < maxLag, maxLag < n else { return }

        var bestLag = 0
        var bestValue = 0.0

        for lag in minLag...maxLag {
            var sum = 0.0
            for i in 0..<(n - lag) {
                sum += centered[i] * centered[i + lag]
            }
            let corr = sum / Double(n - lag)
            if corr > bestValue {
                bestValue = corr
                bestLag = lag
            }
        }

        guard bestLag > 0 else { return }

        // Verify it's a genuine peak (not flat noise)
        let zeroLagCorr = centered.reduce(0) { $0 + $1 * $1 } / Double(n)
        guard zeroLagCorr > 0, bestValue / zeroLagCorr > 0.15 else {
            cadenceRPM = 0
            return
        }

        let period = Double(bestLag) / sampleRate
        cadenceRPM = (60.0 / period).rounded()
    }
}
