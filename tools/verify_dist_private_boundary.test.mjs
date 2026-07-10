import { describe, expect, it } from "vitest";
import { assertExactFileNames, findMarker } from "./verify_dist_private_boundary.mjs";

describe("dist private boundary contracts", () => {
  it("recognizes forbidden private markers", () => {
    expect(findMarker("assets/.runtime/private.json")).toBe(".runtime");
    expect(findMarker("assets/public.json")).toBeNull();
  });

  it("rejects undeclared files in an exact reference-pack closure", () => {
    expect(() => assertExactFileNames(
      ["declared.png", "undeclared.png"],
      ["declared.png"],
      "manifest images",
    )).toThrow(/reference catalog/i);
  });
});
