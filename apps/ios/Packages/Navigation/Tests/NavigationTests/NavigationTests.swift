import XCTest
@testable import Navigation

final class NavigationTests: XCTestCase {
    func testRoutesExist() {
        XCTAssertEqual(NavigationRoute.demo.rawValue, "demo")
    }
}
