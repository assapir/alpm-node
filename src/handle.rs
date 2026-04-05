use napi_derive::napi;

use crate::error::IntoNapi;
use crate::package::{PackageInfo, pkg_to_info};

struct SendAlpm(alpm::Alpm);

// SAFETY: Node.js is single-threaded. The Alpm handle is only ever accessed
// from the main JS thread. We never send it to a Rust worker thread.
unsafe impl Send for SendAlpm {}

#[napi(js_name = "AlpmHandle")]
pub struct JsAlpmHandle {
    inner: SendAlpm,
}

#[allow(clippy::redundant_closure)]
#[napi]
impl JsAlpmHandle {
    #[napi(constructor)]
    pub fn new(root: String, db_path: String) -> napi::Result<Self> {
        let handle = alpm::Alpm::new(root, db_path).into_napi()?;
        Ok(Self {
            inner: SendAlpm(handle),
        })
    }

    #[napi(getter)]
    pub fn root(&self) -> String {
        self.inner.0.root().to_string()
    }

    #[napi(getter)]
    pub fn dbpath(&self) -> String {
        self.inner.0.dbpath().to_string()
    }

    #[napi(getter)]
    pub fn lockfile(&self) -> String {
        self.inner.0.lockfile().to_string()
    }

    // --- Local DB ---

    #[napi]
    pub fn get_local_pkg(&self, name: String) -> napi::Result<PackageInfo> {
        let db = self.inner.0.localdb();
        let pkg = db.pkg(name.as_str()).into_napi()?;
        Ok(pkg_to_info(pkg))
    }

    #[napi]
    pub fn get_local_pkgs(&self) -> Vec<PackageInfo> {
        let db = self.inner.0.localdb();
        db.pkgs().iter().map(|p| pkg_to_info(p)).collect()
    }

    #[napi]
    pub fn search_local(&self, queries: Vec<String>) -> napi::Result<Vec<PackageInfo>> {
        let db = self.inner.0.localdb();
        let refs: Vec<&str> = queries.iter().map(|s| s.as_str()).collect();
        let results = db.search(refs.iter().copied()).into_napi()?;
        Ok(results.iter().map(|p| pkg_to_info(p)).collect())
    }

    #[napi]
    pub fn find_satisfier_local(&self, depstring: String) -> Option<PackageInfo> {
        let db = self.inner.0.localdb();
        db.pkgs()
            .find_satisfier(depstring.as_str())
            .map(|p| pkg_to_info(p))
    }

    // --- Sync DBs ---

    #[napi]
    pub fn register_sync_db(&mut self, name: String, sig_level: u32) -> napi::Result<()> {
        let sl = alpm::SigLevel::from_bits(sig_level).unwrap_or(alpm::SigLevel::USE_DEFAULT);
        self.inner
            .0
            .register_syncdb(name.as_str(), sl)
            .into_napi()?;
        Ok(())
    }

    #[napi]
    pub fn register_sync_db_with_servers(
        &mut self,
        name: String,
        sig_level: u32,
        servers: Vec<String>,
    ) -> napi::Result<()> {
        let sl = alpm::SigLevel::from_bits(sig_level).unwrap_or(alpm::SigLevel::USE_DEFAULT);
        let db = self
            .inner
            .0
            .register_syncdb_mut(name.as_str(), sl)
            .into_napi()?;
        for server in &servers {
            db.add_server(server.as_str()).into_napi()?;
        }
        Ok(())
    }

    #[napi]
    pub fn unregister_all_sync_dbs(&mut self) -> napi::Result<()> {
        self.inner.0.unregister_all_syncdbs().into_napi()
    }

    #[napi]
    pub fn get_sync_db_names(&self) -> Vec<String> {
        self.inner
            .0
            .syncdbs()
            .iter()
            .map(|db| db.name().to_string())
            .collect()
    }

    #[napi]
    pub fn get_sync_pkg(&self, db_name: String, pkg_name: String) -> napi::Result<PackageInfo> {
        let db = self.find_syncdb(&db_name)?;
        let pkg = db.pkg(pkg_name.as_str()).into_napi()?;
        Ok(pkg_to_info(pkg))
    }

    #[napi]
    pub fn search_sync(
        &self,
        db_name: String,
        queries: Vec<String>,
    ) -> napi::Result<Vec<PackageInfo>> {
        let db = self.find_syncdb(&db_name)?;
        let refs: Vec<&str> = queries.iter().map(|s| s.as_str()).collect();
        let results = db.search(refs.iter().copied()).into_napi()?;
        Ok(results.iter().map(|p| pkg_to_info(p)).collect())
    }

    #[napi]
    pub fn search_all_sync(&self, queries: Vec<String>) -> napi::Result<Vec<PackageInfo>> {
        let refs: Vec<&str> = queries.iter().map(|s| s.as_str()).collect();
        let mut all = Vec::new();
        for db in self.inner.0.syncdbs() {
            let results = db.search(refs.iter().copied()).into_napi()?;
            all.extend(results.iter().map(|p| pkg_to_info(p)));
        }
        Ok(all)
    }

    #[napi]
    pub fn find_satisfier_sync(&self, depstring: String) -> Option<PackageInfo> {
        self.inner
            .0
            .syncdbs()
            .find_satisfier(depstring.as_str())
            .map(|p| pkg_to_info(p))
    }
}

impl JsAlpmHandle {
    fn find_syncdb(&self, name: &str) -> napi::Result<&alpm::Db> {
        self.inner
            .0
            .syncdbs()
            .iter()
            .find(|db| db.name() == name)
            .ok_or_else(|| {
                napi::Error::new(
                    napi::Status::GenericFailure,
                    format!("sync database '{name}' not found"),
                )
            })
    }
}
