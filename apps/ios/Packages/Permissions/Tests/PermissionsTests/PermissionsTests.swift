import XCTest
@testable import Permissions

final class PermissionsTests: XCTestCase {
    func testPermissionRawValuesAreStable() {
        XCTAssertEqual(PermissionKind.camera.rawValue, "camera")
    }
}
