import {transformDataForGPU} from './transformData';
/* eslint-disable-next-line */
const ctx: Worker = self as any;

ctx.addEventListener('message', (message) => {
  ctx.postMessage({
    uData: transformDataForGPU(message.data.uData, message.data.maxValue),
    vData: transformDataForGPU(message.data.vData, message.data.maxValue),
  });
});
