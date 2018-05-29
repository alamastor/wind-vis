/**
 * Transform speed data direction, make square power of two, and normalize
 */
export function transformData(
  speedData: Float32Array,
  maxSpeed: number,
): Uint8Array {
  const transformedSpeedData = new Uint8Array(512 * 512);
  for (let x = 0; x < 512; x++) {
    for (let y = 0; y < 512; y++) {
      transformedSpeedData[512 * y + x] =
        speedData[181 * Math.floor(x * 360 / 512) + Math.floor(y * 181 / 512)] /
        (maxSpeed / 255);
    }
  }
  return transformedSpeedData;
}
