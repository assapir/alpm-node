# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Node.js bindings for libalpm (Arch Linux Package Manager) via napi-rs + the `alpm` Rust crate. The npm package name is `alpm`. The end goal is to build an AUR helper.

## Build & Test Commands

```bash
pnpm run build          # Compile Rust -> native .node binary (release, ESM)
pnpm run build:debug    # Debug build
pnpm test               # Run all tests: node --test __test__/*.spec.ts
pnpm run typecheck      # Type check with tsgo
cargo fmt --check       # Check Rust formatting
cargo clippy -- -D warnings  # Rust linting
```

Run a single test file: `node --test __test__/version.spec.ts`

Node 25.9.0 runs `.ts` files natively (type stripping). No transpilation step needed.

## Architecture

```
TypeScript/JS  →  napi-rs (#[napi] macros)  →  alpm crate (Rust)  →  libalpm.so (C)
```

The binding layer is entirely in Rust (`src/`). napi-rs auto-generates `index.js` (ESM loader) and `index.d.ts` (TypeScript types) from `#[napi]` attributes on Rust code. These generated files are in `.gitignore`.

### Key Design Decisions

**Copy data at the FFI boundary**: alpm.rs uses Rust lifetimes — `Db`, `Package`, `Dep` are borrowed references tied to the `Alpm` handle. JS has no lifetime guarantees. So `pkg_to_info()` copies package data into owned `#[napi(object)]` structs. No alpm references escape to JS.

**`unsafe impl Send` for the handle**: `Alpm` is `!Send` (callback fields use `UnsafeCell`). napi-rs classes require `Send`. The `SendAlpm` wrapper is safe because Node.js is single-threaded and we never send the handle to worker threads.

**Derive flag values from the alpm crate**: `sig_level()` and `trans_flag()` use `alpm::SigLevel::*.bits()` / `alpm::TransFlag::*.bits()` — never hardcode bitflag values.

### Rust Modules

- `handle.rs` — `JsAlpmHandle` class (the main JS entry point). All DB operations are methods here. `find_syncdb()` is an internal helper for sync DB lookup.
- `package.rs` — `PackageInfo` struct + `pkg_to_info()` converter (copies all fields from `&alpm::Pkg` to owned struct)
- `dependency.rs` — `Dependency` struct + `dep_to_info()` converter
- `enums.rs` — `PackageReason`, `DepMod`, `PackageFrom` enums + `sig_level()`/`trans_flag()` flag accessors
- `error.rs` — `IntoNapi` trait for `alpm::Result<T>` → `napi::Result<T>` conversion
- `version.rs` — `alpm_version()`, `vercmp()` standalone functions

### The `Pkg` vs `Package` Issue

alpm.rs has two types: `Package` (owned, derefs to `Pkg`) and `Pkg` (inner). `pkgs()` iter yields `&Package`, `search()` iter yields `&Pkg`. `pkg_to_info` takes `&Pkg` and closures (`|p| pkg_to_info(p)`) handle auto-deref. This is why `#[allow(clippy::redundant_closure)]` exists on the impl block.

## System Requirements

libalpm must be installed (comes with pacman on Arch Linux). `pkg-config` is used to find it at build time. Tests read from `/var/lib/pacman/` (no root needed for read-only operations).

## License

GPL-3.0-or-later (required by the `alpm` Rust crate dependency).
