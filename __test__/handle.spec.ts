import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AlpmHandle } from "../index.js";

describe("AlpmHandle", () => {
  it("can be constructed with root and dbpath", () => {
    const handle = new AlpmHandle("/", "/var/lib/pacman/");
    assert.ok(handle);
  });

  it("throws on invalid dbpath", () => {
    assert.throws(() => new AlpmHandle("/", "/nonexistent/path/"));
  });

  it("error message is descriptive", () => {
    assert.throws(
      () => new AlpmHandle("/", "/nonexistent/path/"),
      (err: Error) => {
        assert.ok(err.message.length > 0, "error should have a message");
        return true;
      },
    );
  });

  it("exposes root getter", () => {
    const handle = new AlpmHandle("/", "/var/lib/pacman/");
    assert.equal(handle.root, "/");
  });

  it("exposes dbpath getter", () => {
    const handle = new AlpmHandle("/", "/var/lib/pacman/");
    assert.equal(handle.dbpath, "/var/lib/pacman/");
  });

  it("exposes lockfile path", () => {
    const handle = new AlpmHandle("/", "/var/lib/pacman/");
    assert.ok(handle.lockfile.length > 0);
    assert.ok(handle.lockfile.endsWith(".lck"));
  });

  it("multiple handles can coexist", () => {
    const h1 = new AlpmHandle("/", "/var/lib/pacman/");
    const h2 = new AlpmHandle("/", "/var/lib/pacman/");
    assert.equal(h1.root, h2.root);
    assert.ok(h1.getLocalPkgs().length > 0);
    assert.ok(h2.getLocalPkgs().length > 0);
  });
});
