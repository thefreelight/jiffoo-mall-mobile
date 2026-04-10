#if os(macOS)
import SwiftUI

@main
struct FoundationPreviewApp: App {
    var body: some Scene {
        WindowGroup("Mobile Foundation") {
            RootView()
                .frame(minWidth: 900, minHeight: 700)
        }
        .windowResizability(.contentSize)
    }
}
#endif
