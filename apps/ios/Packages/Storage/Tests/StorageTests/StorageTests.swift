import XCTest
@testable import Storage

final class StorageTests: XCTestCase {
    func testProtocolCanBeAdopted() {
        struct FakeStore: KeyValueStore {
            func string(forKey key: String) -> String? { key }
        }

        XCTAssertEqual(FakeStore().string(forKey: "token"), "token")
    }
}
