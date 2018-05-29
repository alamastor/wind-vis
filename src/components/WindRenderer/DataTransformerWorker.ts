import {transformData} from './transformData';
const ctx: Worker = self as any;

ctx.addEventListener('message', message => {
  ctx.postMessage({
    transformedSpeedData: transformData(
      message.data.speedData,
      message.data.maxSpeed,
    ),
  });
});
