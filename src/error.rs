use alpm::Error as AlpmError;
use napi::Error as NapiError;

fn to_napi_error(err: AlpmError) -> NapiError {
    NapiError::new(napi::Status::GenericFailure, format!("{err}"))
}

pub trait IntoNapi<T> {
    fn into_napi(self) -> napi::Result<T>;
}

impl<T> IntoNapi<T> for alpm::Result<T> {
    fn into_napi(self) -> napi::Result<T> {
        self.map_err(to_napi_error)
    }
}
