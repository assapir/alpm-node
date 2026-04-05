import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AlpmHandle } from "../index.js";

describe("Local DB queries", () => {
  const handle = new AlpmHandle("/", "/var/lib/pacman/");

  describe("getLocalPkg", () => {
    it("returns package info for installed package", () => {
      const pkg = handle.getLocalPkg("pacman");
      assert.equal(pkg.name, "pacman");
      assert.ok(pkg.version.length > 0);
      assert.equal(pkg.dbName, "local");
    });

    it("throws for nonexistent package", () => {
      assert.throws(() => handle.getLocalPkg("this-package-does-not-exist"));
    });

    it("error is descriptive for missing package", () => {
      assert.throws(
        () => handle.getLocalPkg("no-such-pkg-12345"),
        (err: Error) => {
          assert.ok(err.message.length > 0);
          return true;
        },
      );
    });
  });

  describe("getLocalPkgs", () => {
    it("returns all installed packages", () => {
      const pkgs = handle.getLocalPkgs();
      assert.ok(pkgs.length > 100, "should have many installed packages");
    });

    it("includes known packages", () => {
      const names = handle.getLocalPkgs().map((p) => p.name);
      assert.ok(names.includes("pacman"));
      assert.ok(names.includes("glibc"));
    });
  });

  describe("searchLocal", () => {
    it("finds packages by name", () => {
      const results = handle.searchLocal(["pacman"]);
      assert.ok(results.length >= 1);
      assert.ok(results.some((p) => p.name === "pacman"));
    });

    it("returns empty array for no matches", () => {
      const results = handle.searchLocal(["zzzznonexistentzzzz"]);
      assert.equal(results.length, 0);
    });

    it("supports multiple query terms", () => {
      const results = handle.searchLocal(["pacman", "mirror"]);
      assert.ok(results.length >= 1);
    });
  });

  describe("findSatisfierLocal", () => {
    it("resolves a simple dependency", () => {
      const pkg = handle.findSatisfierLocal("glibc");
      assert.ok(pkg != null);
      assert.equal(pkg!.name, "glibc");
    });

    it("resolves a versioned dependency", () => {
      const pkg = handle.findSatisfierLocal("glibc>=2.0");
      assert.ok(pkg != null);
      assert.equal(pkg!.name, "glibc");
    });

    it("returns null for uninstalled dependency", () => {
      assert.equal(handle.findSatisfierLocal("this-does-not-exist"), null);
    });
  });

  describe("package fields", () => {
    const pkg = handle.getLocalPkg("pacman");

    it("has metadata fields", () => {
      assert.ok(pkg.desc != null && pkg.desc.length > 0);
      assert.ok(pkg.url != null && pkg.url.length > 0);
      assert.ok(pkg.arch != null);
      assert.ok(pkg.packager != null);
    });

    it("has size fields", () => {
      assert.ok(pkg.size >= 0);
      assert.ok(pkg.isize > 0, "installed size should be positive");
    });

    it("has date fields", () => {
      assert.ok(pkg.buildDate > 0, "build date should be set");
      assert.ok(pkg.installDate != null && pkg.installDate > 0);
    });

    it("has dependency arrays", () => {
      assert.ok(Array.isArray(pkg.depends));
      assert.ok(pkg.depends.length > 0, "pacman should have dependencies");
      assert.ok(Array.isArray(pkg.optdepends));
      assert.ok(Array.isArray(pkg.makedepends));
      assert.ok(Array.isArray(pkg.checkdepends));
    });

    it("has relationship arrays", () => {
      assert.ok(Array.isArray(pkg.conflicts));
      assert.ok(Array.isArray(pkg.provides));
      assert.ok(Array.isArray(pkg.replaces));
    });

    it("has reverse dependency info", () => {
      assert.ok(Array.isArray(pkg.requiredBy));
      assert.ok(pkg.requiredBy.length > 0, "pacman should be required by something");
      assert.ok(Array.isArray(pkg.optionalFor));
    });

    it("has license info", () => {
      assert.ok(Array.isArray(pkg.licenses));
      assert.ok(pkg.licenses.length > 0);
    });

    it("has reason field", () => {
      assert.ok(typeof pkg.reason === "number");
      assert.ok(pkg.reason === 0 || pkg.reason === 1);
    });

    it("has scriptlet flag", () => {
      assert.ok(typeof pkg.hasScriptlet === "boolean");
    });

    it("dependencies have correct structure", () => {
      for (const dep of pkg.depends) {
        assert.ok(dep.name.length > 0);
        assert.ok(dep.depString.length > 0);
        assert.ok(typeof dep.depmod === "number");
        assert.ok(typeof dep.depmodStr === "string");
      }
    });

    it("provides have correct structure", () => {
      const glibc = handle.getLocalPkg("glibc");
      // glibc typically provides something
      if (glibc.provides.length > 0) {
        for (const prov of glibc.provides) {
          assert.ok(prov.name.length > 0);
          assert.ok(prov.depString.length > 0);
        }
      }
    });
  });
});
