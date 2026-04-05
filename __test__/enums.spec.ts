import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sigLevel, transFlag } from "../index.js";

describe("sigLevel", () => {
  const sl = sigLevel();

  it("returns an object with flag values", () => {
    assert.equal(sl.none, 0);
    assert.equal(typeof sl.package, "number");
    assert.equal(typeof sl.database, "number");
    assert.equal(typeof sl.useDefault, "number");
  });

  it("flags are distinct powers of 2", () => {
    const values = [
      sl.package,
      sl.packageOptional,
      sl.packageMarginalOk,
      sl.packageUnknownOk,
      sl.database,
      sl.databaseOptional,
      sl.databaseMarginalOk,
      sl.databaseUnknownOk,
    ];
    for (const v of values) {
      assert.ok(v > 0, "flag should be positive");
      assert.equal(v & (v - 1), 0, `${v} should be a power of 2`);
    }
  });

  it("flags can be combined with bitwise OR", () => {
    const combined = sl.package | sl.database;
    assert.ok(combined & sl.package);
    assert.ok(combined & sl.database);
    assert.ok(!(combined & sl.packageOptional));
  });
});

describe("transFlag", () => {
  const tf = transFlag();

  it("returns an object with flag values", () => {
    assert.equal(tf.none, 0);
    assert.equal(typeof tf.noDeps, "number");
    assert.equal(typeof tf.cascade, "number");
    assert.equal(typeof tf.needed, "number");
  });

  it("has all expected flags", () => {
    const fields = [
      tf.noDeps,
      tf.noSave,
      tf.noDepVersion,
      tf.cascade,
      tf.recurse,
      tf.dbOnly,
      tf.noHooks,
      tf.allDeps,
      tf.downloadOnly,
      tf.noScriptlet,
      tf.noConflicts,
      tf.needed,
      tf.allExplicit,
      tf.unneeded,
      tf.recurseAll,
      tf.noLock,
    ];
    for (const v of fields) {
      assert.ok(v > 0, "flag should be positive");
      assert.equal(v & (v - 1), 0, `${v} should be a power of 2`);
    }
    // All flags should be unique
    const unique = new Set(fields);
    assert.equal(unique.size, fields.length, "all flags should be distinct");
  });

  it("flags can be combined with bitwise OR", () => {
    const combined = tf.noDeps | tf.needed;
    assert.ok(combined & tf.noDeps);
    assert.ok(combined & tf.needed);
    assert.ok(!(combined & tf.cascade));
  });
});
