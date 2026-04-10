// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "DebugTools",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "DebugTools", targets: ["DebugTools"])
    ],
    targets: [
        .target(name: "DebugTools"),
        .testTarget(name: "DebugToolsTests", dependencies: ["DebugTools"])
    ]
)
