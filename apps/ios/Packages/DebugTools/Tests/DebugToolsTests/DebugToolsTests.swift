import XCTest
@testable import DebugTools

final class DebugToolsTests: XCTestCase {
    func testDebugTitleIsStable() {
        XCTAssertEqual(DebugPanel.title, "Debug")
    }
}
