import { AlpmHandle, alpmVersion, vercmp, sigLevel, transFlag } from "../index.js";

console.log("=== alpm-node ===\n");
console.log(`libalpm version: ${alpmVersion()}`);
console.log(`vercmp("1.0", "2.0") = ${vercmp("1.0", "2.0")}`);
console.log(`vercmp("1:1.0", "2.0") = ${vercmp("1:1.0", "2.0")}`);

const handle = new AlpmHandle("/", "/var/lib/pacman/");
console.log(`\nroot: ${handle.root}`);
console.log(`dbpath: ${handle.dbpath}`);

// Local DB
const pacman = handle.getLocalPkg("pacman");
console.log(`\n--- pacman ---`);
console.log(`${pacman.name} ${pacman.version}`);
console.log(`desc: ${pacman.desc}`);
console.log(`arch: ${pacman.arch}`);
console.log(`size: ${(pacman.isize / 1024 / 1024).toFixed(1)} MiB`);
console.log(`license: ${pacman.licenses.join(", ")}`);
console.log(`depends: ${pacman.depends.map((d) => d.depString).join(", ")}`);
console.log(`required by: ${pacman.requiredBy.join(", ")}`);

// All installed
const all = handle.getLocalPkgs();
console.log(`\n${all.length} packages installed`);

const explicit = all.filter((p) => p.reason === 0);
const deps = all.filter((p) => p.reason === 1);
console.log(`  ${explicit.length} explicit, ${deps.length} as dependencies`);

const totalSize = all.reduce((sum, p) => sum + p.isize, 0);
console.log(`  total installed size: ${(totalSize / 1024 / 1024 / 1024).toFixed(1)} GiB`);

// Search
const search = handle.searchLocal(["linux"]);
console.log(`\nsearchLocal("linux"): ${search.length} results`);
for (const pkg of search.slice(0, 5)) {
  console.log(`  ${pkg.name} ${pkg.version}`);
}
if (search.length > 5) console.log(`  ... and ${search.length - 5} more`);

// Sync DBs
handle.registerSyncDb("core", sigLevel().none);
handle.registerSyncDb("extra", sigLevel().none);
console.log(`\nsync dbs: ${handle.getSyncDbNames().join(", ")}`);

const glibc = handle.getSyncPkg("core", "glibc");
console.log(`\nglibc (core): ${glibc.version}`);
console.log(`  provides: ${glibc.provides.map((d) => d.depString).join(", ")}`);

const syncSearch = handle.searchAllSync(["nodejs"]);
console.log(`\nsearchAllSync("nodejs"): ${syncSearch.length} results`);
for (const pkg of syncSearch.slice(0, 5)) {
  console.log(`  ${pkg.name} ${pkg.version} [${pkg.dbName}]`);
}

// Satisfier
const satisfier = handle.findSatisfierSync("python>=3.12");
if (satisfier) {
  console.log(`\nfindSatisfierSync("python>=3.12"): ${satisfier.name} ${satisfier.version}`);
}

// Flags
const tf = transFlag();
console.log(`\ntransFlag.needed = ${tf.needed}`);
console.log(`transFlag.noDeps | transFlag.dbOnly = ${tf.noDeps | tf.dbOnly}`);
