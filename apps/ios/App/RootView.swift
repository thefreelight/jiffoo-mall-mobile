#if canImport(SwiftUI)
import AppShell
import DesignSystem
import Navigation
import Permissions
import SwiftUI

struct RootView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(AppShell.title)
                            .font(.system(size: 34, weight: .bold, design: .serif))

                        Text("Foundation means the reusable mobile base layer: shell, tokens, wrappers, and tooling that downstream private apps build on top of.")
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }

                    explanationCard()

                    ForEach(NavigationRoute.allCases, id: \.self) { route in
                        NavigationLink(value: route) {
                            galleryCard(route: route)
                        }
                        .buttonStyle(.plain)
                    }

                    Text("Open any card to inspect what belongs in the public repo before Bokmoo or any other private app adds real business features.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                .padding(24)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(red: 0.98, green: 0.97, blue: 0.94))
            .navigationTitle("Mobile Foundation")
            .navigationDestination(for: NavigationRoute.self) { route in
                DemoDetailView(route: route)
            }
        }
    }

    private func explanationCard() -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("How To Use This")
                .font(.headline)
            Text("This is not a product page. It is a demo gallery for the public foundation layer.")
                .font(.body)
            Divider()
            Text("Tap a capability card to preview what the foundation owns and what should remain in private business repos.")
                .font(.footnote.weight(.medium))
                .foregroundStyle(.secondary)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: DesignToken.cornerRadius, style: .continuous))
    }

    private func galleryCard(route: NavigationRoute) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(route.title)
                .font(.headline)
                .foregroundStyle(.white)

            Text(route.summary)
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.88))

            VStack(alignment: .leading, spacing: 8) {
                ForEach(route.pills, id: \.self) { item in
                    pill(item, dark: true)
                }
            }

            Text("Open demo")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(.white)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(tint(for: route))
        .clipShape(RoundedRectangle(cornerRadius: DesignToken.cornerRadius, style: .continuous))
    }

    private func tint(for route: NavigationRoute) -> Color {
        switch route {
        case .designSystem: return Color(red: 0.12, green: 0.48, blue: 0.39)
        case .navigation: return Color(red: 0.90, green: 0.56, blue: 0.15)
        case .permissions: return Color(red: 0.15, green: 0.21, blue: 0.42)
        case .storage: return Color(red: 0.43, green: 0.31, blue: 0.61)
        case .debug: return Color(red: 0.54, green: 0.18, blue: 0.23)
        }
    }

    private func pill(_ text: String, dark: Bool) -> some View {
        Text(text)
            .font(.subheadline.weight(.medium))
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(dark ? .white.opacity(0.16) : Color.black.opacity(0.08))
            .foregroundStyle(dark ? .white : .primary)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

private struct DemoDetailView: View {
    let route: NavigationRoute

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(route.summary)
                    .font(.body)
                    .foregroundStyle(.secondary)

                showcase(
                    title: "What The Foundation Owns",
                    tint: tint(for: route),
                    items: ownedItems(for: route)
                )

                showcase(
                    title: "What Private Apps Add",
                    tint: .black.opacity(0.72),
                    items: privateItems(for: route)
                )

                detailBody
            }
            .padding(24)
        }
        .background(Color(red: 0.98, green: 0.97, blue: 0.94))
        .navigationTitle(route.title)
    }

    @ViewBuilder
    private var detailBody: some View {
        switch route {
        case .designSystem:
            VStack(alignment: .leading, spacing: 12) {
                Text("Token Snapshot").font(.headline)
                swatch("Surface", color: Color(red: 0.98, green: 0.97, blue: 0.94))
                swatch("Primary", color: Color(red: 0.12, green: 0.48, blue: 0.39))
                swatch("Accent", color: Color(red: 0.90, green: 0.56, blue: 0.15))
                Text("Corner radius token: \(Int(DesignToken.cornerRadius))")
                    .font(.footnote.monospaced())
                    .foregroundStyle(.secondary)
            }
        case .navigation:
            VStack(alignment: .leading, spacing: 12) {
                Text("Route Contracts").font(.headline)
                pill("demo/list", dark: false)
                pill("demo/detail", dark: false)
                pill("debug/home", dark: false)
                Text("The foundation can define shell routes. Bokmoo should plug real feature flows into those contracts rather than hard-code business routes here.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        case .permissions:
            VStack(alignment: .leading, spacing: 12) {
                Text("Permission Wrappers").font(.headline)
                permissionRow("Camera", detail: "Not requested yet")
                permissionRow("Notifications", detail: "Wrapper available")
                permissionRow("Location", detail: "Explain before asking")
            }
        case .storage:
            VStack(alignment: .leading, spacing: 12) {
                Text("Storage Layers").font(.headline)
                pill("preferences", dark: false)
                pill("secure token store", dark: false)
                pill("offline cache", dark: false)
                Text("The public repo owns generic storage primitives. Private apps own the real keys, models, and retention policy.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        case .debug:
            VStack(alignment: .leading, spacing: 12) {
                Text("Debug Surface").font(.headline)
                debugCard("Mock data mode", detail: "Enabled for demo")
                debugCard("Verbose logging", detail: "Available in debug builds")
                debugCard("Environment switcher", detail: "Public shell only")
            }
        }
    }

    private func showcase(title: String, tint: Color, items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundStyle(.white)

            ForEach(items, id: \.self) { item in
                pill(item, dark: true)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(tint)
        .clipShape(RoundedRectangle(cornerRadius: DesignToken.cornerRadius, style: .continuous))
    }

    private func swatch(_ title: String, color: Color) -> some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8)
                .fill(color)
                .frame(width: 28, height: 28)
            Text(title)
        }
    }

    private func permissionRow(_ title: String, detail: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Circle()
                .fill(tint(for: route))
                .frame(width: 12, height: 12)
                .padding(.top, 4)
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.body.weight(.semibold))
                Text(detail).font(.footnote).foregroundStyle(.secondary)
            }
        }
    }

    private func debugCard(_ title: String, detail: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.body.weight(.semibold))
            Text(detail).font(.footnote).foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func pill(_ text: String, dark: Bool) -> some View {
        Text(text)
            .font(.subheadline.weight(.medium))
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(dark ? .white.opacity(0.16) : Color.black.opacity(0.08))
            .foregroundStyle(dark ? .white : .primary)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private func tint(for route: NavigationRoute) -> Color {
        switch route {
        case .designSystem: return Color(red: 0.12, green: 0.48, blue: 0.39)
        case .navigation: return Color(red: 0.90, green: 0.56, blue: 0.15)
        case .permissions: return Color(red: 0.15, green: 0.21, blue: 0.42)
        case .storage: return Color(red: 0.43, green: 0.31, blue: 0.61)
        case .debug: return Color(red: 0.54, green: 0.18, blue: 0.23)
        }
    }

    private func ownedItems(for route: NavigationRoute) -> [String] {
        switch route {
        case .designSystem: return ["shared colors", "radius scale", "typography tokens", "base components"]
        case .navigation: return ["route names", "shell entrypoints", "demo flow scaffolding"]
        case .permissions: return ["request wrappers", "educational copy patterns", "result normalization"]
        case .storage: return ["key-value adapters", "cache boundaries", "generic persistence APIs"]
        case .debug: return ["debug menu", "fake data hooks", "verbose diagnostics"]
        }
    }

    private func privateItems(for route: NavigationRoute) -> [String] {
        switch route {
        case .designSystem: return ["Bokmoo brand styling", "marketing art", "campaign visuals"]
        case .navigation: return ["checkout flow", "account flow", "private deep links"]
        case .permissions: return ["business prompts", "feature-specific timing", "conversion copy"]
        case .storage: return ["real models", "sensitive schemas", "retention policy"]
        case .debug: return ["tenant-only flags", "private APIs", "ops credentials"]
        }
    }
}
#endif
