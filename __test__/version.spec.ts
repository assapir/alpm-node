import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { alpmVersion, vercmp } from "../index.js";

describe("alpmVersion", () => {
  it("returns a version string", () => {
    const ver = alpmVersion();
    assert.ok(ver.length > 0, "version should not be empty");
    assert.match(ver, /^\d+\.\d+/, "version should look like semver");
  });
});

describe("vercmp", () => {
  it("returns -1 when a < b", () => {
    assert.equal(vercmp("1.0", "2.0"), -1);
  });

  it("returns 0 when a == b", () => {
    assert.equal(vercmp("1.0", "1.0"), 0);
  });

  it("returns 1 when a > b", () => {
    assert.equal(vercmp("2.0", "1.0"), 1);
  });

  it("handles epoch versions", () => {
    assert.equal(vercmp("1:1.0", "2.0"), 1);
    assert.equal(vercmp("2.0", "1:1.0"), -1);
  });

  it("handles pkgrel", () => {
    assert.equal(vercmp("1.0-1", "1.0-2"), -1);
    assert.equal(vercmp("1.0-2", "1.0-1"), 1);
    assert.equal(vercmp("1.0-1", "1.0-1"), 0);
  });

  it("handles alpha/beta/rc ordering", () => {
    assert.equal(vercmp("1.0alpha", "1.0beta"), -1);
    assert.equal(vercmp("1.0beta", "1.0rc"), -1);
    assert.equal(vercmp("1.0rc", "1.0"), -1);
  });

  it("handles empty strings", () => {
    assert.equal(vercmp("", ""), 0);
    assert.equal(vercmp("1.0", ""), 1);
    assert.equal(vercmp("", "1.0"), -1);
  });
});
