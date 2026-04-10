import XCTest
@testable import Observability

final class ObservabilityTests: XCTestCase {
    func testLoggerProtocolCanBeAdopted() {
        final class Spy: Logger {
            var value = ""

            func log(_ message: String) {
                value = message
            }
        }

        let spy = Spy()
        spy.log("ok")
        XCTAssertEqual(spy.value, "ok")
    }
}
