import XCTest
@testable import Networking

final class NetworkingTests: XCTestCase {
    func testDescriptorKeepsPath() {
        XCTAssertEqual(RequestDescriptor(path: "/health").path, "/health")
    }
}
