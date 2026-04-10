// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Permissions",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "Permissions", targets: ["Permissions"])
    ],
    targets: [
        .target(name: "Permissions"),
        .testTarget(name: "PermissionsTests", dependencies: ["Permissions"])
    ]
)
