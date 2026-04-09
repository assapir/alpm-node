# libalpm

Node.js bindings for [libalpm](https://gitlab.archlinux.org/pacman/pacman) (Arch Linux Package Manager).

Built with [napi-rs](https://napi.rs/) wrapping the Rust [alpm](https://crates.io/crates/alpm) crate.

## Install

```bash
npm install libalpm
```

Requires libalpm to be installed on the system (comes with pacman on Arch Linux). Prebuilt binaries are available for Linux x86_64 and aarch64 (glibc).

## Usage

```typescript
import { AlpmHandle, alpmVersion, vercmp } from "libalpm";

// Initialize with root and database path
const handle = new AlpmHandle("/", "/var/lib/pacman/");

// Query installed packages
const pkg = handle.getLocalPkg("pacman");
console.log(`${pkg.name} ${pkg.version}`); // pacman 7.1.0
console.log(pkg.depends.map((d) => d.depString)); // ['bash', 'glibc', ...]

// Search installed packages
const results = handle.searchLocal(["linux"]);

// Find what satisfies a dependency
const glibc = handle.findSatisfierLocal("glibc>=2.0");

// Register and query sync databases
handle.registerSyncDb("core", 0);
handle.registerSyncDb("extra", 0);

const syncPkg = handle.getSyncPkg("core", "glibc");
const found = handle.searchAllSync(["nodejs"]);
const satisfier = handle.findSatisfierSync("python>=3.12");

// Version comparison
vercmp("1.0", "2.0"); // -1
vercmp("1:1.0", "2.0"); // 1 (epoch wins)

// libalpm version
alpmVersion(); // "16.0.1"
```

## API

### `AlpmHandle`

| Method | Description |
|---|---|
| `new AlpmHandle(root, dbPath)` | Create a handle |
| `.root` / `.dbpath` / `.lockfile` | Handle properties |
| `.getLocalPkg(name)` | Get installed package by name |
| `.getLocalPkgs()` | Get all installed packages |
| `.searchLocal(queries)` | Search installed packages |
| `.findSatisfierLocal(dep)` | Find installed package satisfying a dependency |
| `.registerSyncDb(name, sigLevel)` | Register a sync database |
| `.registerSyncDbWithServers(name, sigLevel, servers)` | Register with mirror URLs |
| `.unregisterAllSyncDbs()` | Unregister all sync databases |
| `.getSyncDbNames()` | List registered sync database names |
| `.getSyncPkg(dbName, pkgName)` | Get package from a sync database |
| `.searchSync(dbName, queries)` | Search a specific sync database |
| `.searchAllSync(queries)` | Search all sync databases |
| `.findSatisfierSync(dep)` | Find package satisfying a dependency across sync DBs |

### Standalone Functions

| Function | Description |
|---|---|
| `alpmVersion()` | Returns the libalpm version string |
| `vercmp(a, b)` | Compare version strings (-1, 0, 1) |
| `sigLevel()` | Returns signature level flag constants |
| `transFlag()` | Returns transaction flag constants |

### Types

```typescript
interface PackageInfo {
  name: string;
  version: string;
  desc?: string;
  url?: string;
  arch?: string;
  size: number;
  isize: number;
  depends: Dependency[];
  optdepends: Dependency[];
  conflicts: Dependency[];
  provides: Dependency[];
  replaces: Dependency[];
  requiredBy: string[];
  licenses: string[];
  // ... and more
}

interface Dependency {
  name: string;
  version?: string;
  depmod: number;
  depmodStr: string; // ">=", "=", "<", etc.
  depString: string; // "glibc>=2.12"
}
```

See [`examples/basic.ts`](examples/basic.ts) for a full working demo.

## Building from Source

Requires Rust toolchain and libalpm development headers.

```bash
pnpm install
pnpm run build
pnpm test
```

## License

GPL-3.0-or-later
