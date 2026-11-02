import { describe, expect, it } from "vitest";
import { retainFailedItems } from "./offlineQueue";

describe("offline queue", () => {
  it("retains only items whose sync failed", () => {
    const items = [{ id: "guest-1" }, { id: "guest-2" }, { id: "guest-3" }];

    expect(retainFailedItems(items, [false, true, false])).toEqual([{ id: "guest-2" }]);
  });

  it("returns an empty queue when every item syncs", () => {
    expect(retainFailedItems(["a", "b"], [false, false])).toEqual([]);
  });

  it("preserves item order when multiple syncs fail", () => {
    const items = ["first", "second", "third", "fourth"];

    expect(retainFailedItems(items, [true, false, true, false])).toEqual([
      "first",
      "third",
    ]);
  });

  it("does not mutate the original queue", () => {
    const items = [{ id: "guest-1" }, { id: "guest-2" }];

    retainFailedItems(items, [false, true]);

    expect(items).toEqual([{ id: "guest-1" }, { id: "guest-2" }]);
  });
});
