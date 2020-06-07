#[macro_use]
extern crate serde_derive;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use web_sys::console;
mod data_field;
mod vector_field;
use data_field::DataField;
use vector_field::VectorField;

use js_sys::Uint8Array;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();

    // Your code goes here!
    console::log_1(&JsValue::from_str("Feeling RUSTY!"));

    Ok(())
}

#[wasm_bindgen]
pub struct WindData {
    cycle: String,
    data: HashMap<u32, VectorField>,
    size: Option<usize>,
    max_speed: f32,
}

#[wasm_bindgen]
impl WindData {
    pub fn new(cycle: String, max_speed: f32) -> WindData {
        WindData {
            cycle,
            data: HashMap::new(),
            size: None,
            max_speed,
        }
    }

    pub fn cycle(&self) -> String {
        self.cycle.clone()
    }

    pub fn u_data_for_gpu(&mut self, tau: u32) -> Uint8Array {
        self.data
            .get_mut(&tau)
            .unwrap()
            .u_data_for_gpu(self.max_speed)
    }

    pub fn v_data_for_gpu(&mut self, tau: u32) -> Uint8Array {
        self.data
            .get_mut(&tau)
            .unwrap()
            .v_data_for_gpu(self.max_speed)
    }

    pub fn has_tau(&self, tau: u32) -> bool {
        self.data.contains_key(&tau)
    }

    pub fn set_data(&mut self, tau: u32, data: &JsValue) {
        let data: TauData = data.into_serde().unwrap();
        match self.size {
            Some(size) => {
                if size != data.u.len() && size != data.v.len() {
                    panic!("Data for tau '{}' has unexpected size!", tau)
                }
            }
            None => self.size = Some(data.u.len()),
        }
        self.data.insert(
            tau,
            VectorField::new(
                DataField::new(data.u, 0.0, 359.0, -90.0, 90.0, 1.0),
                DataField::new(data.v, 0.0, 359.0, -90.0, 90.0, 1.0),
            ),
        );
    }
}

#[derive(Deserialize)]
struct TauData {
    pub u: Vec<i8>,
    pub v: Vec<i8>,
}
