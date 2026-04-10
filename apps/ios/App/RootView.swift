#if canImport(SwiftUI)
import AppShell
import DesignSystem
import Navigation
import Permissions
import SwiftUI

struct RootView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(AppShell.title)
                        .font(.system(size: 34, weight: .bold, design: .serif))

                    Text(AppShell.description)
                        .font(.body)
                        .foregroundStyle(.secondary)
                }

                foundationCard(
                    title: "Public Boundary",
                    items: [
                        "App shell",
                        "Design tokens",
                        "Navigation contracts",
                        "Debug tooling"
                    ],
                    tint: Color(red: 0.12, green: 0.48, blue: 0.39)
                )

                foundationCard(
                    title: "Package Map",
                    items: NavigationRoute.allCases.map(\.rawValue),
                    tint: Color(red: 0.90, green: 0.56, blue: 0.15)
                )

                foundationCard(
                    title: "System Wrappers",
                    items: [
                        PermissionKind.camera.rawValue,
                        PermissionKind.notifications.rawValue,
                        PermissionKind.location.rawValue
                    ],
                    tint: Color(red: 0.15, green: 0.21, blue: 0.42)
                )

                Text("Corner radius token: \(Int(DesignToken.cornerRadius))")
                    .font(.footnote.monospaced())
                    .foregroundStyle(.secondary)
            }
            .padding(24)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.98, green: 0.97, blue: 0.94))
    }

    private func foundationCard(title: String, items: [String], tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundStyle(.white)

            ForEach(items, id: \.self) { item in
                Text(item)
                    .font(.subheadline.weight(.medium))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(.white.opacity(0.16))
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(tint)
        .clipShape(RoundedRectangle(cornerRadius: DesignToken.cornerRadius, style: .continuous))
    }
}
#endif
