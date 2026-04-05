use napi_derive::napi;

#[napi]
pub fn alpm_version() -> String {
    alpm::version().to_string()
}

#[napi]
pub fn vercmp(a: String, b: String) -> i32 {
    match alpm::vercmp(a.as_str(), b.as_str()) {
        std::cmp::Ordering::Less => -1,
        std::cmp::Ordering::Equal => 0,
        std::cmp::Ordering::Greater => 1,
    }
}
