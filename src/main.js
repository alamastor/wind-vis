'use strict';

const UNIT_SIZE = 20;

function main() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const width = ctx.canvas.width / UNIT_SIZE;
  const height = ctx.canvas.height / UNIT_SIZE;
  const uField = [];
  for (let y = 0; y <= height; y++) {
    uField.push([]);
    for (let x = 0; x <= width; x++) {
      uField[y].push(y ** 1.5 / 4 - y);
    }
  }

  const vField = [];
  for (let y = 0; y <= height; y++) {
    vField.push([]);
    for (let x = 0; x <= width; x++) {
      vField[y].push(y / 4 + 0.5);
    }
  }

  renderBgCanvas(uField, vField);

  const particles = [];
  for (let x = 1; x <= width - 1; x++) {
    particles.push(new Particle(x, 0));
    particles.push(new Particle(x + 0.5, 0));
  }
  window.requestAnimationFrame(
    updateAndRender.bind(null, ctx, uField, vField, particles, null),
  );
}

function xToCanvasX(ctx, x) {
  return x * UNIT_SIZE;
}

function yToCanvasY(ctx, y) {
  return ctx.canvas.height - y * UNIT_SIZE;
}

function drawArrow(ctx, len) {
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

function interpolatePoint(field, x, y) {
  const ulPoint = field[Math.floor(y)][Math.floor(x)];
  const urPoint = field[Math.floor(y)][Math.ceil(x)];
  const lrPoint = field[Math.ceil(y)][Math.ceil(x)];
  const llPoint = field[Math.ceil(y)][Math.floor(x)];
  return llPoint;
}

function plotArrow(ctx, x, y, u, v) {
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

function renderBgCanvas(uField, vField) {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < uField.length; y++) {
    for (let x = 0; x < uField[0].length; x++) {
      plotArrow(ctx, x, y, uField[y][x], vField[y][x]);
    }
  }

  for (let y = 0; y <= uField.length; y++) {
    ctx.moveTo(xToCanvasX(ctx, 0), yToCanvasY(ctx, y));
    ctx.lineTo(xToCanvasX(ctx, uField.length - 1), yToCanvasY(ctx, y));
  }
  for (let x = 0; x <= uField[0].length; x++) {
    ctx.moveTo(xToCanvasX(ctx, x), yToCanvasY(ctx, 0));
    ctx.lineTo(xToCanvasX(ctx, x), yToCanvasY(ctx, uField[0].length - 1));
  }
  ctx.strokeStyle = 'black';
  ctx.stroke();
}

function updateAndRender(ctx, uField, vField, particles, prevTime, timestamp) {
  let dt;
  if (prevTime !== null) {
    dt = timestamp - prevTime;
  } else {
    dt = 0;
  }

  particles.forEach(part => {
    if (
      part.x >= 0 &&
      part.x <= uField[0].length - 1 &&
      part.y >= 0 &&
      part.y <= uField.length
    ) {
      const u = interpolatePoint(uField, part.y, part.x);
      const v = interpolatePoint(vField, part.y, part.x);
      part.x = part.x + u / 50;
      part.y = part.y + v / 50;
    }
  });

  // ctx.clearRect(0, 0, ctx.canvas.height, ctx.canvas.width);
  particles.forEach(part => {
    part.render(ctx);
  });

  window.requestAnimationFrame(
    updateAndRender.bind(null, ctx, uField, vField, particles, timestamp),
  );
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.height = 0.25;
    this.width = 0.25;
    this.r = Math.random() * 255;
    this.g = Math.random() * 255;
    this.b = Math.random() * 255;
    this.a = 1;
  }

  render(ctx) {
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
