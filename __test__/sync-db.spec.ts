import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AlpmHandle } from "../index.js";

describe("Sync DB operations", () => {
  describe("registerSyncDb", () => {
    it("registers a sync database", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      assert.ok(handle.getSyncDbNames().includes("core"));
    });

    it("registers multiple databases", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      handle.registerSyncDb("extra", 0);
      const names = handle.getSyncDbNames();
      assert.ok(names.includes("core"));
      assert.ok(names.includes("extra"));
    });
  });

  describe("registerSyncDbWithServers", () => {
    it("registers a database with servers", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDbWithServers("core", 0, [
        "https://geo.mirror.pkgbuild.com/$repo/os/$arch",
      ]);
      assert.ok(handle.getSyncDbNames().includes("core"));
    });
  });

  describe("unregisterAllSyncDbs", () => {
    it("removes all sync databases", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      handle.registerSyncDb("extra", 0);
      handle.unregisterAllSyncDbs();
      assert.deepEqual(handle.getSyncDbNames(), []);
    });
  });

  describe("getSyncPkg", () => {
    it("returns a package from a sync db", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      const pkg = handle.getSyncPkg("core", "glibc");
      assert.equal(pkg.name, "glibc");
      assert.ok(pkg.version.length > 0);
      assert.equal(pkg.dbName, "core");
    });

    it("throws for nonexistent package in sync db", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      assert.throws(() => handle.getSyncPkg("core", "no-such-pkg-12345"));
    });

    it("throws for nonexistent sync db", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      assert.throws(() => handle.getSyncPkg("nonexistent", "glibc"));
    });
  });

  describe("searchSync", () => {
    it("searches within a specific sync db", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      const results = handle.searchSync("core", ["glibc"]);
      assert.ok(results.length >= 1);
      assert.ok(results.some((p) => p.name === "glibc"));
    });

    it("returns empty array for no matches", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      const results = handle.searchSync("core", ["zzzznonexistentzzzz"]);
      assert.equal(results.length, 0);
    });

    it("throws for nonexistent sync db", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      assert.throws(() => handle.searchSync("nonexistent", ["glibc"]));
    });
  });

  describe("searchAllSync", () => {
    it("searches across all sync databases", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      handle.registerSyncDb("extra", 0);
      const results = handle.searchAllSync(["pacman"]);
      assert.ok(results.length >= 1);
    });

    it("returns empty when no dbs registered", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      const results = handle.searchAllSync(["pacman"]);
      assert.equal(results.length, 0);
    });
  });

  describe("findSatisfierSync", () => {
    it("finds a package that satisfies a dependency", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      const pkg = handle.findSatisfierSync("glibc");
      assert.ok(pkg != null);
      assert.equal(pkg!.name, "glibc");
    });

    it("finds a versioned dependency", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      const pkg = handle.findSatisfierSync("glibc>=2.0");
      assert.ok(pkg != null);
    });

    it("returns null when no dbs registered", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      assert.equal(handle.findSatisfierSync("glibc"), null);
    });

    it("returns null for nonexistent dep", () => {
      const handle = new AlpmHandle("/", "/var/lib/pacman/");
      handle.registerSyncDb("core", 0);
      assert.equal(handle.findSatisfierSync("no-such-pkg-12345"), null);
    });
  });
});
