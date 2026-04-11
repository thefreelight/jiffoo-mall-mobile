import XCTest
@testable import DesignSystem

final class DesignSystemTests: XCTestCase {
    @MainActor
    func testCornerRadiusIsPositive() {
        XCTAssertGreaterThan(DesignToken.cornerRadius, 0)
    }
}
