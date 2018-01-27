'use strict';

const SELECTED_WIND_FIELD = 'test_field_2';
const WIND_FIELDS = {
  test_field_1: test_field_1(),
  test_field_2: test_field_2(),
};

const UNIT_SIZE = 20;

function test_field_1(): [number[][], number[][]] {
  const width = 50;
  const height = 50;
  const uField: number[][] = [];
  for (let x = 0; x <= width; x++) {
    uField.push([]);
    for (let y = 0; y <= height; y++) {
      if (x > y) {
        uField[x].push(0);
      } else {
        uField[x].push(1);
      }
    }
  }

  const vField: number[][] = [];
  for (let x = 0; x <= width; x++) {
    vField.push([]);
    for (let y = 0; y <= height; y++) {
      if (x < y) {
        vField[x].push(0);
      } else {
        vField[x].push(1);
      }
    }
  }

  return [uField, vField];
}

function test_field_2(): [number[][], number[][]] {
  const width = 50;
  const height = 50;
  const uField: number[][] = [];
  for (let x = 0; x <= width; x++) {
    uField.push([]);
    for (let y = 0; y <= height; y++) {
      uField[x].push(Math.cos(y * 5) + Math.sin(x * 5) + 1);
    }
  }

  const vField: number[][] = [];
  for (let x = 0; x <= width; x++) {
    vField.push([]);
    for (let y = 0; y <= height; y++) {
      vField[x].push(Math.sin(x + 10));
    }
  }

  return [uField, vField];
}

function main() {
  const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(
    'canvas',
  );
  const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext(
    '2d',
  );

  const width = ctx.canvas.width / UNIT_SIZE;
  const height = ctx.canvas.height / UNIT_SIZE;

  const [uField, vField] = WIND_FIELDS[SELECTED_WIND_FIELD];

  renderBgCanvas(uField, vField);

  const particles = [];
  for (let x = 0; x <= width - 1; x++) {
    for (let y = 0; y <= height - 1; y++) {
      particles.push(new Particle(x, y));
    }
  }
  window.requestAnimationFrame(
    updateAndRender.bind(null, ctx, uField, vField, particles, null),
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

function renderBgCanvas(uField: number[][], vField: number[][]) {
  const canvas = <HTMLCanvasElement>document.getElementById('bg-canvas');
  const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

  for (let y = 0; y < uField.length; y++) {
    for (let x = 0; x < uField[0].length; x++) {
      plotArrow(ctx, x, y, uField[x][y], vField[x][y]);
    }
  }

  for (let y = 0; y <= uField[0].length; y++) {
    ctx.moveTo(xToCanvasX(ctx, 0), yToCanvasY(ctx, y));
    ctx.lineTo(xToCanvasX(ctx, uField.length - 1), yToCanvasY(ctx, y));
  }
  for (let x = 0; x <= uField.length; x++) {
    ctx.moveTo(xToCanvasX(ctx, x), yToCanvasY(ctx, 0));
    ctx.lineTo(xToCanvasX(ctx, x), yToCanvasY(ctx, uField[0].length - 1));
  }
  ctx.strokeStyle = 'black';
  ctx.stroke();
}

function updateAndRender(
  ctx: CanvasRenderingContext2D,
  uField: number[][],
  vField: number[][],
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
    if (
      part.x >= 0 &&
      part.x <= uField[0].length - 1 &&
      part.y >= 0 &&
      part.y <= uField.length - 1
    ) {
      const u = interpolatePoint(uField, part.x, part.y);
      const v = interpolatePoint(vField, part.x, part.y);
      part.x = part.x + u / 50;
      part.y = part.y + v / 50;
    }
  });

  // ctx.clearRect(0, 0, ctx.canvas.height, ctx.canvas.width);
  particles.forEach((part: Particle) => {
    part.render(ctx);
  });

  window.requestAnimationFrame(
    updateAndRender.bind(null, ctx, uField, vField, particles, timestamp),
  );
}

class Particle {
  x: number;
  y: number;
  height: number;
  width: number;
  r: number;
  g: number;
  b: number;
  a: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.height = 0.25;
    this.width = 0.25;
    this.r = Math.random() * 255;
    this.g = Math.random() * 255;
    this.b = Math.random() * 255;
    this.a = 1;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle =
      'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
    ctx.fillRect(
      xToCanvasX(ctx, this.x - this.width / 2),
      yToCanvasY(ctx, this.y + this.height / 2),
      this.width * UNIT_SIZE,
      this.height * UNIT_SIZE,
    );
  }
}

window.onload = main;
