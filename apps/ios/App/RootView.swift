#if canImport(SwiftUI)
import AppShell
import DebugTools
import DesignSystem
import Navigation
import Networking
import Observability
import Permissions
import Storage
import SwiftUI

@MainActor
struct RootView: View {
    @State private var requestedThemeSlug = "builtin-default"

    var body: some View {
        let themeResolution = StorefrontPreviewData.resolveTheme(requestedThemeSlug)

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

                    storefrontBasicVersionCard(themeResolution: themeResolution)
                    explanationCard()

                    ForEach(NavigationRoute.allCases, id: \.self) { route in
                        NavigationLink(value: route) {
                            galleryCard(route: route)
                        }
                        .buttonStyle(.plain)
                    }

                    Text("Environment: \(AppShell.environmentName). Open any card to inspect what belongs in the public repo before Bokmoo or any other private app adds real business features.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                .padding(24)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(DesignToken.surface)
            .navigationTitle("Mobile Foundation")
            .navigationDestination(for: NavigationRoute.self) { route in
                DemoDetailView(route: route)
            }
        }
    }

    private func storefrontBasicVersionCard(themeResolution: ThemeAdapterResolution) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Storefront Basic Version")
                .font(.headline)

            Text("This first mobile reference flow targets `builtin-default` and uses explicit fallback for non-baseline themes. Core commerce semantics stay the same either way.")
                .font(.body)
                .foregroundStyle(.secondary)

            Divider()

            Text("Resolved from /api/store/context + /api/themes/active in production. This host currently uses preview contract data while the adapter pipeline is being wired.")
                .font(.footnote.weight(.medium))
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 8) {
                pill("store: \(StorefrontPreviewData.context.storeName)", dark: false)
                pill("requested: \(requestedThemeSlug)", dark: false)
                pill("effective: \(themeResolution.effectiveThemeSlug)", dark: false)
                pill("official status: \(themeResolution.officialStatus)", dark: false)
            }

            Text("Preview theme switch")
                .font(.subheadline.weight(.semibold))

            VStack(alignment: .leading, spacing: 8) {
                ForEach(StorefrontPreviewData.officialThemes, id: \.self) { entry in
                    Button {
                        requestedThemeSlug = entry.slug
                    } label: {
                        pill(entry.slug, dark: false, selected: requestedThemeSlug == entry.slug)
                    }
                    .buttonStyle(.plain)
                }
            }

            if themeResolution.usesFallback {
                fallbackNotice(themeResolution)
            }

            Text("Basic storefront flows")
                .font(.subheadline.weight(.semibold))

            VStack(alignment: .leading, spacing: 8) {
                ForEach(StorefrontPreviewData.basicFlows, id: \.self) { flow in
                    pill(flow, dark: false)
                }
            }

            Text("Supported theme modes: \(StorefrontClientProfile.supportedThemeModes.joined(separator: ", "))")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: DesignToken.cornerRadius, style: .continuous))
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
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: iconName(for: route))
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(10)
                    .background(.black.opacity(0.16), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

                VStack(alignment: .leading, spacing: 8) {
                    Text(route.title)
                        .font(.headline)
                        .foregroundStyle(.white)

                    Text(route.summary)
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.88))
                }
            }

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

    private func fallbackNotice(_ resolution: ThemeAdapterResolution) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Fallback active")
                .font(.subheadline.weight(.semibold))
            Text(resolution.fallbackReason ?? "Theme fallback is active.")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.96, green: 0.90, blue: 0.78))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func tint(for route: NavigationRoute) -> Color {
        switch route {
        case .designSystem: return DesignToken.primary
        case .navigation: return DesignToken.accent
        case .permissions: return DesignToken.tertiary
        case .storage: return Color(red: 0.43, green: 0.31, blue: 0.61)
        case .networking: return Color(red: 0.14, green: 0.38, blue: 0.55)
        case .observability: return Color(red: 0.42, green: 0.23, blue: 0.10)
        case .debug: return Color(red: 0.54, green: 0.18, blue: 0.23)
        }
    }

    private func iconName(for route: NavigationRoute) -> String {
        switch route {
        case .designSystem: return "paintpalette.fill"
        case .navigation: return "arrow.trianglehead.branch"
        case .permissions: return "lock.shield.fill"
        case .storage: return "externaldrive.fill"
        case .networking: return "network"
        case .observability: return "waveform.path.ecg"
        case .debug: return "ladybug.fill"
        }
    }

    private func pill(_ text: String, dark: Bool, selected: Bool = false) -> some View {
        Text(text)
            .font(.subheadline.weight(.medium))
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(selected ? tint(for: .designSystem) : (dark ? .white.opacity(0.16) : Color.black.opacity(0.08)))
            .foregroundStyle(dark || selected ? .white : .primary)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

@MainActor
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
        .background(DesignToken.surface)
        .navigationTitle(route.title)
    }

    @ViewBuilder
    private var detailBody: some View {
        switch route {
        case .designSystem:
            VStack(alignment: .leading, spacing: 12) {
                Text("Token Snapshot").font(.headline)
                ForEach(DesignToken.swatches, id: \.self) { swatch in
                    swatchRow(swatch)
                }
                Text("Corner radius token: \(Int(DesignToken.cornerRadius))")
                    .font(.footnote.monospaced())
                    .foregroundStyle(.secondary)
            }
        case .navigation:
            VStack(alignment: .leading, spacing: 12) {
                let previewRoutes = Array(NavigationRoute.allCases.prefix(4))
                Text("Route Contracts").font(.headline)
                ForEach(previewRoutes.indices, id: \.self) { index in
                    pill(previewRoutes[index].path, dark: false)
                }
                Text("The foundation can define shell routes. Bokmoo should plug real feature flows into those contracts rather than hard-code business routes here.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        case .permissions:
            VStack(alignment: .leading, spacing: 12) {
                Text("Permission Wrappers").font(.headline)
                ForEach(PermissionKind.allCases, id: \.self) { permission in
                    permissionRow(permission.rawValue, detail: permission.detail)
                }
            }
        case .storage:
            VStack(alignment: .leading, spacing: 12) {
                Text("Storage Layers").font(.headline)
                ForEach(StoragePreview.namespaces, id: \.self) { namespace in
                    pill(namespace, dark: false)
                }
                Text("The public repo owns generic storage primitives. Private apps own the real keys, models, and retention policy.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        case .networking:
            VStack(alignment: .leading, spacing: 12) {
                Text("Request Contracts").font(.headline)
                ForEach(NetworkingPreview.descriptors, id: \.self) { descriptor in
                    requestCard(descriptor)
                }
            }
        case .observability:
            VStack(alignment: .leading, spacing: 12) {
                Text("Signal Contracts").font(.headline)
                ForEach(ObservabilityPreview.signals, id: \.self) { signal in
                    signalCard(signal)
                }
            }
        case .debug:
            VStack(alignment: .leading, spacing: 12) {
                Text("Debug Surface").font(.headline)
                ForEach(DebugPanel.tools, id: \.self) { tool in
                    debugCard(tool)
                }
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

    private func swatchRow(_ swatch: TokenSwatch) -> some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8)
                .fill(swatch.color)
                .frame(width: 28, height: 28)
            Text(swatch.name)
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

    private func requestCard(_ descriptor: RequestDescriptor) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(descriptor.method) \(descriptor.path)").font(.body.weight(.semibold))
            Text(descriptor.requiresAuth ? "requires downstream auth adapter" : "safe for public demo flows")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func signalCard(_ signal: LogSignal) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(signal.name).font(.body.weight(.semibold))
            Text(signal.detail).font(.footnote).foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func debugCard(_ tool: DebugTool) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(tool.title).font(.body.weight(.semibold))
            Text(tool.detail).font(.footnote).foregroundStyle(.secondary)
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
        case .designSystem: return DesignToken.primary
        case .navigation: return DesignToken.accent
        case .permissions: return DesignToken.tertiary
        case .storage: return Color(red: 0.43, green: 0.31, blue: 0.61)
        case .networking: return Color(red: 0.14, green: 0.38, blue: 0.55)
        case .observability: return Color(red: 0.42, green: 0.23, blue: 0.10)
        case .debug: return Color(red: 0.54, green: 0.18, blue: 0.23)
        }
    }

    private func ownedItems(for route: NavigationRoute) -> [String] {
        switch route {
        case .designSystem: return ["shared colors", "radius scale", "typography tokens", "base components"]
        case .navigation: return ["route names", "shell entrypoints", "demo flow scaffolding"]
        case .permissions: return ["request wrappers", "educational copy patterns", "result normalization"]
        case .storage: return ["key-value adapters", "cache boundaries", "generic persistence APIs"]
        case .networking: return ["request descriptors", "auth hooks", "mock transport boundaries"]
        case .observability: return ["logger contract", "signal naming", "breadcrumbs"]
        case .debug: return ["debug menu", "fake data hooks", "verbose diagnostics"]
        }
    }

    private func privateItems(for route: NavigationRoute) -> [String] {
        switch route {
        case .designSystem: return ["Bokmoo brand styling", "marketing art", "campaign visuals"]
        case .navigation: return ["checkout flow", "account flow", "private deep links"]
        case .permissions: return ["business prompts", "feature-specific timing", "conversion copy"]
        case .storage: return ["real models", "sensitive schemas", "retention policy"]
        case .networking: return ["real endpoints", "tenant auth", "domain error mapping"]
        case .observability: return ["vendor config", "private event schema", "ops dashboards"]
        case .debug: return ["tenant-only flags", "private APIs", "ops credentials"]
        }
    }
}
#endif
