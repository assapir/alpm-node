use napi_derive::napi;

#[napi(object)]
pub struct Dependency {
    pub name: String,
    pub version: Option<String>,
    pub desc: Option<String>,
    pub depmod: u32,
    pub depmod_str: String,
    pub dep_string: String,
}

pub fn dep_to_info(dep: &alpm::Dep) -> Dependency {
    let depmod = dep.depmod();
    Dependency {
        name: dep.name().to_string(),
        version: dep.version().map(|v| v.as_str().to_string()),
        desc: dep.desc().map(|s| s.to_string()),
        depmod: depmod as u32,
        depmod_str: depmod_to_str(depmod).to_string(),
        dep_string: dep.to_string(),
    }
}

fn depmod_to_str(m: alpm::DepMod) -> &'static str {
    match m {
        alpm::DepMod::Any => "",
        alpm::DepMod::Eq => "=",
        alpm::DepMod::Ge => ">=",
        alpm::DepMod::Le => "<=",
        alpm::DepMod::Gt => ">",
        alpm::DepMod::Lt => "<",
    }
}
