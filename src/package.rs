use napi_derive::napi;

use crate::dependency::{Dependency, dep_to_info};

#[napi(object)]
pub struct PackageInfo {
    pub name: String,
    pub version: String,
    pub base: Option<String>,
    pub desc: Option<String>,
    pub url: Option<String>,
    pub arch: Option<String>,
    pub size: i64,
    pub isize: i64,
    pub reason: u32,
    pub build_date: i64,
    pub install_date: Option<i64>,
    pub packager: Option<String>,
    pub licenses: Vec<String>,
    pub groups: Vec<String>,
    pub depends: Vec<Dependency>,
    pub optdepends: Vec<Dependency>,
    pub makedepends: Vec<Dependency>,
    pub checkdepends: Vec<Dependency>,
    pub conflicts: Vec<Dependency>,
    pub provides: Vec<Dependency>,
    pub replaces: Vec<Dependency>,
    pub required_by: Vec<String>,
    pub optional_for: Vec<String>,
    pub has_scriptlet: bool,
    pub sha256sum: Option<String>,
    pub db_name: Option<String>,
}

pub fn pkg_to_info(pkg: &alpm::Pkg) -> PackageInfo {
    PackageInfo {
        name: pkg.name().to_string(),
        version: pkg.version().as_str().to_string(),
        base: pkg.base().map(|s| s.to_string()),
        desc: pkg.desc().map(|s| s.to_string()),
        url: pkg.url().map(|s| s.to_string()),
        arch: pkg.arch().map(|s| s.to_string()),
        size: pkg.size(),
        isize: pkg.isize(),
        reason: pkg.reason() as u32,
        build_date: pkg.build_date(),
        install_date: pkg.install_date(),
        packager: pkg.packager().map(|s| s.to_string()),
        licenses: pkg.licenses().iter().map(|s| s.to_string()).collect(),
        groups: pkg.groups().iter().map(|s| s.to_string()).collect(),
        depends: pkg.depends().iter().map(dep_to_info).collect(),
        optdepends: pkg.optdepends().iter().map(dep_to_info).collect(),
        makedepends: pkg.makedepends().iter().map(dep_to_info).collect(),
        checkdepends: pkg.checkdepends().iter().map(dep_to_info).collect(),
        conflicts: pkg.conflicts().iter().map(dep_to_info).collect(),
        provides: pkg.provides().iter().map(dep_to_info).collect(),
        replaces: pkg.replaces().iter().map(dep_to_info).collect(),
        required_by: pkg.required_by().iter().map(|s| s.to_string()).collect(),
        optional_for: pkg.optional_for().iter().map(|s| s.to_string()).collect(),
        has_scriptlet: pkg.has_scriptlet(),
        sha256sum: pkg.sha256sum().map(|s| s.to_string()),
        db_name: pkg.db().map(|db| db.name().to_string()),
    }
}
