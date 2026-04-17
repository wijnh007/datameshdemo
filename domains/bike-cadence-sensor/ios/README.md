# BikeRPM — iOS Cadence Sensor

An iPhone app that measures bike cadence (pedal RPM) using the device accelerometer — no external hardware required.

## How it works

1. The accelerometer samples at **50 Hz**.
2. A high-pass filter removes gravity, leaving only dynamic (vibration) acceleration.
3. The magnitude of that vector is accumulated into a 6-second rolling window.
4. **Autocorrelation** is computed over that window every second to find the dominant periodic frequency.
5. The period with the strongest correlation in the 30–200 RPM range is converted to RPM.

Mounting the iPhone on the **handlebar or frame** gives the best signal. Pocket/jersey mounting also works but may show more noise.

## Setup in Xcode

1. Open Xcode (≥ 15) and choose **File → New → Project**.
2. Select **iOS → App**, set:
   - Product Name: `BikeRPM`
   - Bundle Identifier: `com.yourname.bikerpm`
   - Interface: **SwiftUI**
   - Language: **Swift**
3. Delete the generated `ContentView.swift` and `<AppName>App.swift`.
4. Drag the four source files from `BikeRPM/` into the project:
   - `BikeRPMApp.swift`
   - `ContentView.swift`
   - `CadenceDetector.swift`
   - `Info.plist` (replace the generated one)
5. Select your physical iPhone as the run destination (the simulator has no accelerometer).
6. Build and run (`⌘R`).

## Permissions

The app requests **Motion & Fitness** access at runtime via `NSMotionUsageDescription` in `Info.plist`. No network or location permissions are needed.

## Cadence zones

| RPM      | Zone     |
|----------|----------|
| < 60     | Low      |
| 60 – 80  | Moderate |
| 80 – 100 | Optimal  |
| 100 +    | High     |

## Data Mesh context

This app acts as a **data producer** in the bike-cadence domain. Future iterations can:
- Publish cadence events to a Kafka topic (`bike.cadence.measured`)
- Expose a local BLE GATT characteristic for nearby consumers
- POST to the platform data gateway for aggregation across sessions
