use wasm_bindgen::prelude::*;

use js_sys::{Int8Array, Uint8Array};
const GPU_TEX_SIZE: u32 = 512;

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}
#[wasm_bindgen]
pub struct DataField {
    data: Vec<i8>,
    min_lon: f32,
    max_lon: f32,
    min_lat: f32,
    max_lat: f32,
    resolution: f32,
    data_for_gpu: Option<DataForGpu>,
}

#[wasm_bindgen]
impl DataField {
    pub fn new(
        data: Vec<i8>,
        min_lon: f32,
        max_lon: f32,
        min_lat: f32,
        max_lat: f32,
        resolution: f32,
    ) -> DataField {
        DataField {
            data,
            min_lon,
            max_lon,
            min_lat,
            max_lat,
            resolution,
            data_for_gpu: None,
        }
    }

    pub fn view(&self) -> Int8Array {
        unsafe { Int8Array::view(&self.data) }
    }

    pub fn view_for_gpu(&mut self, max_val: f32) -> Uint8Array {
        // Data transformed to a square of UInt8 for use by GPU.
        if !self
            .data_for_gpu
            .as_ref()
            .map_or(false, |x| x.max_val == max_val)
        {
            self.data_for_gpu = Some(DataForGpu::new(
                &self.data,
                max_val,
                self.data_width(),
                self.data_height(),
            ));
        }
        unsafe { Uint8Array::view(&self.data_for_gpu.as_ref().unwrap().data) }
    }

    fn data_width(&self) -> u32 {
        ((self.max_lon - self.min_lon) / self.resolution) as u32 + 1
    }

    fn data_height(&self) -> u32 {
        ((self.max_lat - self.min_lat) / self.resolution) as u32 + 1
    }
}

struct DataForGpu {
    pub data: Vec<u8>,
    pub max_val: f32,
}

impl DataForGpu {
    pub fn new(data_to_transform: &Vec<i8>, max_val: f32, width: u32, height: u32) -> DataForGpu {
        let mut data: Vec<u8> = vec![];
        for y in 0..GPU_TEX_SIZE {
            for x in 0..GPU_TEX_SIZE {
                let val: f32 = data_to_transform[height as usize
                    * ((x * width) as f32 / GPU_TEX_SIZE as f32).floor() as usize
                    + ((y * height) as f32 / GPU_TEX_SIZE as f32).floor() as usize]
                    as f32;
                data.push((127.5 * (val / max_val + 1.0)) as u8);
            }
        }
        DataForGpu { data, max_val }
    }
}
