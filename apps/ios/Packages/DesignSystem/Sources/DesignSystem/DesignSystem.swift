import SwiftUI

public struct TokenSwatch: Hashable {
    public let name: String
    public let color: Color

    public init(name: String, color: Color) {
        self.name = name
        self.color = color
    }
}

@MainActor
public enum DesignToken {
    public static let cornerRadius: Double = 16
    public static let surface = Color(red: 0.98, green: 0.97, blue: 0.94)
    public static let primary = Color(red: 0.12, green: 0.48, blue: 0.39)
    public static let accent = Color(red: 0.90, green: 0.56, blue: 0.15)
    public static let tertiary = Color(red: 0.15, green: 0.21, blue: 0.42)
    public static let swatches: [TokenSwatch] = [
        TokenSwatch(name: "Surface", color: surface),
        TokenSwatch(name: "Primary", color: primary),
        TokenSwatch(name: "Accent", color: accent),
        TokenSwatch(name: "Tertiary", color: tertiary)
    ]
}
