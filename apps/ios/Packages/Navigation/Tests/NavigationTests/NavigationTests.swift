import XCTest
@testable import Navigation

final class NavigationTests: XCTestCase {
    func testRoutesExist() {
        XCTAssertEqual(NavigationRoute.designSystem.rawValue, "design-system")
        XCTAssertEqual(NavigationRoute.allCases.count, 5)
    }
}
