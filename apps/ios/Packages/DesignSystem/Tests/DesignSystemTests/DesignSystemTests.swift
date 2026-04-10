import XCTest
@testable import DesignSystem

final class DesignSystemTests: XCTestCase {
    func testCornerRadiusIsPositive() {
        XCTAssertGreaterThan(DesignToken.cornerRadius, 0)
    }
}
