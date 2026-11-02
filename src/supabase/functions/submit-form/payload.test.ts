import { describe, expect, it } from "vitest";
import { buildSubmitPayload } from "./payload";

describe("submit-form payload", () => {
  it("removes client-controlled guest fields and keeps a valid tenant", () => {
    expect(
      buildSubmitPayload(
        "guest",
        { name: "Ada", attendance: "attending", approved: true, role: "admin" },
        "tenant-1",
      ),
    ).toEqual({ name: "Ada", attendance: "attending", tenant_id: "tenant-1" });
  });

  it("never accepts approved from a public wish payload", () => {
    expect(
      buildSubmitPayload("wish", { name: "Ada", message: "Hello", approved: true }, "bad tenant!"),
    ).toEqual({ name: "Ada", message: "Hello" });
  });
});
