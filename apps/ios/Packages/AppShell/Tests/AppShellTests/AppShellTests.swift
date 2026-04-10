import XCTest
@testable import AppShell

final class AppShellTests: XCTestCase {
    func testDescriptionIsStable() {
        XCTAssertFalse(AppShell.description.isEmpty)
    }
}
