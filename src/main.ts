'use strict';
import {WindField, WIND_FIELDS} from './fields';

const SELECTED_WIND_FIELD = 'test_field_2';
const SHOW_BACKGROUND = false;

const UNIT_SIZE = 20;

function main() {
  const windField = WIND_FIELDS[SELECTED_WIND_FIELD];

  const canvas = <HTMLCanvasElement>document.getElementById(
    'foreground-canvas',
  );
  canvas.width = windField.width() * UNIT_SIZE;
  canvas.height = windField.height() * UNIT_SIZE;
  const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

  if (SHOW_BACKGROUND) {
    renderBgCanvas(windField);
  }

  const particles = [];
  for (let x = 0; x <= windField.width() - 1; x++) {
    for (let y = 0; y <= windField.height() - 1; y++) {
      particles.push(new Particle(x, y));
    }
  }
  window.requestAnimationFrame(
    updateAndRender.bind(null, ctx, windField, particles, null),
  );
}

function xToCanvasX(ctx: CanvasRenderingContext2D, x: number) {
  return x * UNIT_SIZE;
}

function yToCanvasY(ctx: CanvasRenderingContext2D, y: number) {
  return ctx.canvas.height - y * UNIT_SIZE;
}

function drawArrow(ctx: CanvasRenderingContext2D, len: number) {
  const tail = -5 * len;
  const head = 5 * len;
  const headStart = 5 * len - 5;
  ctx.moveTo(tail, 0);
  ctx.lineTo(headStart, 0);
  ctx.stroke();
  ctx.moveTo(head, 0);
  ctx.lineTo(headStart, 1.5);
  ctx.lineTo(headStart, -1.5);
  ctx.lineTo(head, 0);
  ctx.fill();
}

function interpolatePoint(field: number[][], x: number, y: number) {
  const ulPoint = field[Math.floor(x)][Math.ceil(y)];
  const urPoint = field[Math.ceil(x)][Math.ceil(y)];
  const lrPoint = field[Math.ceil(x)][Math.floor(y)];
  const llPoint = field[Math.floor(x)][Math.floor(y)];

  const uPoint = linearInterp(x - Math.floor(x), ulPoint, urPoint);
  const lPoint = linearInterp(x - Math.floor(x), llPoint, lrPoint);

  return linearInterp(y - Math.floor(y), lPoint, uPoint);
}

function linearInterp(x: number, y1: number, y2: number) {
  return x * (y2 - y1) + y1;
}

function plotArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  u: number,
  v: number,
) {
  const color = 'rgb(140, 200, 300)';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.save();
  ctx.translate(xToCanvasX(ctx, x), yToCanvasY(ctx, y));
  ctx.rotate(-Math.atan2(v, u));
  drawArrow(ctx, Math.sqrt(u ** 2 + v ** 2));
  ctx.restore();
}

function renderBgCanvas(windField: WindField) {
  const canvas = <HTMLCanvasElement>document.getElementById(
    'background-canvas',
  );
  canvas.width = windField.width() * UNIT_SIZE;
  canvas.height = windField.height() * UNIT_SIZE;
  const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

  for (let x = 0; x < windField.width(); x++) {
    for (let y = 0; y < windField.height(); y++) {
      plotArrow(ctx, x, y, windField.uField[x][y], windField.vField[x][y]);
    }
  }

  for (let y = 0; y <= windField.width(); y++) {
    ctx.moveTo(xToCanvasX(ctx, 0), yToCanvasY(ctx, y));
    ctx.lineTo(xToCanvasX(ctx, windField.width() - 1), yToCanvasY(ctx, y));
  }
  for (let x = 0; x <= windField.height(); x++) {
    ctx.moveTo(xToCanvasX(ctx, x), yToCanvasY(ctx, 0));
    ctx.lineTo(xToCanvasX(ctx, x), yToCanvasY(ctx, windField.height() - 1));
  }
  ctx.strokeStyle = 'black';
  ctx.stroke();
}

function updateAndRender(
  ctx: CanvasRenderingContext2D,
  windField: WindField,
  particles: Particle[],
  prevTime: number,
  timestamp: number,
) {
  let dt;
  if (prevTime !== null) {
    dt = timestamp - prevTime;
  } else {
    dt = 0;
  }

  particles.forEach((part: Particle) => {
    part.update(windField);
  });

  ctx.clearRect(0, 0, ctx.canvas.height, ctx.canvas.width);
  particles.forEach((part: Particle) => {
    part.render(ctx);
  });

  window.requestAnimationFrame(
    updateAndRender.bind(null, ctx, windField, particles, timestamp),
  );
}

class Particle {
  x: number;
  y: number;
  xTail: number[];
  yTail: number[];
  height: number;
  width: number;
  color: string;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.height = 0.25;
    this.width = 0.25;
    this.color =
      'rgb(' +
      Math.random() * 255 +
      ',' +
      Math.random() * 255 +
      ',' +
      Math.random() * 255 +
      ')';
    this.xTail = [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x];
    this.yTail = [y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y];
  }

  update(windField: WindField) {
    // TODO: Calculate movement from frame time

    this.xTail.shift(); // O(n) - use proper queue data structure if slow
    this.yTail.shift(); // O(n) - use proper queue data structure if slow
    if (
      this.x >= 0 &&
      this.x <= windField.width() - 1 &&
      this.y >= 0 &&
      this.y <= windField.height() - 1
    ) {
      this.xTail.push(this.x);
      this.yTail.push(this.y);
      const u = interpolatePoint(windField.uField, this.x, this.y);
      const v = interpolatePoint(windField.vField, this.x, this.y);
      this.x = this.x + u / 50;
      this.y = this.y + v / 50;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const particleWidth = this.width;
    const particleHeight = this.height;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(
      xToCanvasX(ctx, this.x - particleWidth / 2),
      yToCanvasY(ctx, this.y + particleHeight / 2),
      this.width * UNIT_SIZE,
      this.height * UNIT_SIZE,
    );

    for (let i = 0; i < this.xTail.length; i++) {
      let x = this.xTail[i];
      let y = this.yTail[i];
      ctx.globalAlpha = 0.11;
      ctx.fillRect(
        xToCanvasX(ctx, x - particleWidth / 2),
        yToCanvasY(ctx, y + particleHeight / 2),
        this.width * UNIT_SIZE,
        this.height * UNIT_SIZE,
      );
    }
  }
}

window.onload = main;
