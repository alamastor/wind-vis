const ctx: Worker = self as any;

ctx.addEventListener('message', message => {
  // Transform speed data direction, make square power of two, and normalize
  const speedData = message.data.speedData;
  const maxSpeed = message.data.maxSpeed;
  const transformedSpeedData = new Uint8Array(512 * 512);
  for (let x = 0; x < 512; x++) {
    for (let y = 0; y < 512; y++) {
      transformedSpeedData[512 * y + x] =
        speedData[181 * Math.floor(x * 360 / 512) + Math.floor(y * 181 / 512)] /
        (maxSpeed / 255);
    }
  }
  ctx.postMessage({transformedSpeedData});
});
