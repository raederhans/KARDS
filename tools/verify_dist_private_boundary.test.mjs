import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertExactFileNames, findMarker } from "./verify_dist_private_boundary.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRAND_MARK_PATH = path.join(REPO_ROOT, "public", "brand", "card-forge-mark.png");

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

  it("keeps the header brand mark sized for its rendered slot", () => {
    const brandMark = fs.readFileSync(BRAND_MARK_PATH);

    expect(brandMark.byteLength).toBeLessThanOrEqual(64 * 1024);
    expect(brandMark.toString("ascii", 1, 4)).toBe("PNG");
    expect(brandMark.readUInt32BE(16)).toBeLessThanOrEqual(176);
    expect(brandMark.readUInt32BE(20)).toBeLessThanOrEqual(176);
  });
});
