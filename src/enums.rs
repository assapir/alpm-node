use napi_derive::napi;

#[napi]
pub enum PackageReason {
    Explicit = 0,
    Depend = 1,
}

#[napi]
pub enum DepMod {
    Any = 1,
    Eq = 2,
    Ge = 3,
    Le = 4,
    Gt = 5,
    Lt = 6,
}

#[napi]
pub enum PackageFrom {
    File = 1,
    LocalDb = 2,
    SyncDb = 3,
}

#[napi(object)]
pub struct SigLevelFlags {
    pub none: u32,
    pub package: u32,
    pub package_optional: u32,
    pub package_marginal_ok: u32,
    pub package_unknown_ok: u32,
    pub database: u32,
    pub database_optional: u32,
    pub database_marginal_ok: u32,
    pub database_unknown_ok: u32,
    pub use_default: u32,
}

#[napi]
pub fn sig_level() -> SigLevelFlags {
    use alpm::SigLevel;
    SigLevelFlags {
        none: SigLevel::NONE.bits(),
        package: SigLevel::PACKAGE.bits(),
        package_optional: SigLevel::PACKAGE_OPTIONAL.bits(),
        package_marginal_ok: SigLevel::PACKAGE_MARGINAL_OK.bits(),
        package_unknown_ok: SigLevel::PACKAGE_UNKNOWN_OK.bits(),
        database: SigLevel::DATABASE.bits(),
        database_optional: SigLevel::DATABASE_OPTIONAL.bits(),
        database_marginal_ok: SigLevel::DATABASE_MARGINAL_OK.bits(),
        database_unknown_ok: SigLevel::DATABASE_UNKNOWN_OK.bits(),
        use_default: SigLevel::USE_DEFAULT.bits(),
    }
}

#[napi(object)]
pub struct TransFlagValues {
    pub none: u32,
    pub no_deps: u32,
    pub no_save: u32,
    pub no_dep_version: u32,
    pub cascade: u32,
    pub recurse: u32,
    pub db_only: u32,
    pub no_hooks: u32,
    pub all_deps: u32,
    pub download_only: u32,
    pub no_scriptlet: u32,
    pub no_conflicts: u32,
    pub needed: u32,
    pub all_explicit: u32,
    pub unneeded: u32,
    pub recurse_all: u32,
    pub no_lock: u32,
}

#[napi]
pub fn trans_flag() -> TransFlagValues {
    use alpm::TransFlag;
    TransFlagValues {
        none: TransFlag::NONE.bits(),
        no_deps: TransFlag::NO_DEPS.bits(),
        no_save: TransFlag::NO_SAVE.bits(),
        no_dep_version: TransFlag::NO_DEP_VERSION.bits(),
        cascade: TransFlag::CASCADE.bits(),
        recurse: TransFlag::RECURSE.bits(),
        db_only: TransFlag::DB_ONLY.bits(),
        no_hooks: TransFlag::NO_HOOKS.bits(),
        all_deps: TransFlag::ALL_DEPS.bits(),
        download_only: TransFlag::DOWNLOAD_ONLY.bits(),
        no_scriptlet: TransFlag::NO_SCRIPTLET.bits(),
        no_conflicts: TransFlag::NO_CONFLICTS.bits(),
        needed: TransFlag::NEEDED.bits(),
        all_explicit: TransFlag::ALL_EXPLICIT.bits(),
        unneeded: TransFlag::UNNEEDED.bits(),
        recurse_all: TransFlag::RECURSE_ALL.bits(),
        no_lock: TransFlag::NO_LOCK.bits(),
    }
}
