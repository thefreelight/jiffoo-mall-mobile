// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Observability",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "Observability", targets: ["Observability"])
    ],
    targets: [
        .target(name: "Observability"),
        .testTarget(name: "ObservabilityTests", dependencies: ["Observability"])
    ]
)
