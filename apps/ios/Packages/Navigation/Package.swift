// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Navigation",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "Navigation", targets: ["Navigation"])
    ],
    targets: [
        .target(name: "Navigation"),
        .testTarget(name: "NavigationTests", dependencies: ["Navigation"])
    ]
)
