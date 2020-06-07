use crate::data_field::DataField;
use wasm_bindgen::prelude::*;

use js_sys::{Int8Array, Uint8Array};
#[wasm_bindgen]
pub struct VectorField {
    u: DataField,
    v: DataField,
}

#[wasm_bindgen]
impl VectorField {
    pub fn new(u: DataField, v: DataField) -> VectorField {
        VectorField { u, v }
    }

    pub fn u_data(&self) -> Int8Array {
        self.u.view()
    }

    pub fn v_data(&self) -> Int8Array {
        self.v.view()
    }

    pub fn u_data_for_gpu(&mut self, max_speed: f32) -> Uint8Array {
        self.u.view_for_gpu(max_speed)
    }

    pub fn v_data_for_gpu(&mut self, max_speed: f32) -> Uint8Array {
        self.v.view_for_gpu(max_speed)
    }
}
