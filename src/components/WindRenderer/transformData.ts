/**
 * Transform data direction, make square of size that's power of two.
 */
export function transformDataForGPU(
  data: Int8Array,
  maxVal: number,
): Uint8Array {
  const transformedData = new Uint8Array(512 * 512);
  for (let x = 0; x < 512; x++) {
    for (let y = 0; y < 512; y++) {
      const val =
        data[181 * Math.floor(x * 360 / 512) + Math.floor(y * 181 / 512)];
      transformedData[512 * y + x] = 127.5 * (val / maxVal + 1);
    }
  }
  return transformedData;
}
