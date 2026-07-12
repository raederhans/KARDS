import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertExactFileNames, findMarker } from "./verify_dist_private_boundary.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRAND_MARK_PATH = path.join(REPO_ROOT, "public", "brand", "card-forge-mark.png");
const THIRD_PARTY_NOTICES_PATH = path.join(REPO_ROOT, "public", "THIRD-PARTY-NOTICES.txt");
const RESOURCE_RIGHTS_PATH = path.join(REPO_ROOT, "RESOURCE-RIGHTS.md");
const SPEED_INSIGHTS_LICENSE_PATH = path.join(REPO_ROOT, "node_modules", "@vercel", "speed-insights", "LICENSE");

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

  it("ships the Speed Insights Apache 2.0 license with the deployed notices", () => {
    const notices = fs.readFileSync(THIRD_PARTY_NOTICES_PATH, "utf8");
    const upstreamLicense = fs.readFileSync(SPEED_INSIGHTS_LICENSE_PATH, "utf8").trim();

    expect(notices).toContain("@vercel/speed-insights 2.0.0");
    expect(notices).toContain("Copyright 2023 Vercel, Inc.");
    expect(notices).toContain("Apache License");
    expect(notices).toContain("Version 2.0, January 2004");
    expect(notices).toContain("9. Accepting Warranty or Additional Liability.");
    expect(notices).toContain(upstreamLicense);
    expect(notices).not.toMatch(/^\+\s*Apache License$/m);
  });

  it("keeps bundled placeholder artwork outside the software-license boundary", () => {
    const resourceRights = fs.readFileSync(RESOURCE_RIGHTS_PATH, "utf8");

    expect(resourceRights).toContain("`public/artwork/**`");
  });
});
