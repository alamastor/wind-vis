import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {VectorField} from '../fields';

const SELECTED_WIND_FIELD = 'gfsField';
const SHOW_BACKGROUND = false;
const SHOW_PARTICLE_TAILS = true;
const CLEAR_PARTICLES_EACH_FRAME = true;
const PARTICLE_FADE_START = 5000;
const PARTICLE_LIFETIME = 7000;
const MAX_PARTICLES = 3000;

interface Props {
  vectorField: VectorField;
  height: number;
  width: number;
}
interface State {}

export default class extends React.Component<Props, State> {
  foregroundCanvas: HTMLCanvasElement;
  backgroundCanvas: HTMLCanvasElement;

  componentDidMount() {
    this.foregroundCanvas.width = this.props.width;
    this.foregroundCanvas.height = this.props.height;

    const ctx = this.foregroundCanvas.getContext(
      '2d',
    ) as CanvasRenderingContext2D;

    if (SHOW_BACKGROUND) {
      this.renderBgCanvas(this.props.vectorField);
    }

    const particles: Particle[] = [];

    window.requestAnimationFrame(
      this.updateAndRender.bind(this, ctx, particles, null),
    );
  }

  updateAndRender(
    ctx: CanvasRenderingContext2D,
    particles: Particle[],
    prevTime: number,
    timestamp: number,
  ) {
    const windField = this.props.vectorField;
    let deltaT: number;
    if (prevTime !== null) {
      deltaT = timestamp - prevTime;
    } else {
      deltaT = 0;
    }

    for (let i = 0; i < 5; i++) {
      if (particles.length < MAX_PARTICLES) {
        particles.push(
          new Particle(
            Math.random() * windField.getWidth(),
            Math.random() * windField.getHeight(),
          ),
        );
      }
    }

    particles.forEach((part: Particle) => {
      part.update(windField, deltaT);
    });

    if (CLEAR_PARTICLES_EACH_FRAME) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      if (
        p.lifeTime >= PARTICLE_LIFETIME ||
        p.x <= 0 ||
        p.x >= windField.getWidth() - 1 ||
        p.y <= 0 ||
        p.y >= windField.getHeight() - 1
      ) {
        particles[i] = new Particle(
          Math.random() * (windField.getWidth() - 1),
          Math.random() * (windField.getHeight() - 1),
        );
      }
      p = particles[i];
      if (p != null) {
        this.renderParticle(p, ctx);
      }
    }

    window.requestAnimationFrame(
      this.updateAndRender.bind(this, ctx, particles, timestamp),
    );
  }

  xUnitsToCanvasXUnits(xUnits: number) {
    return xUnits * (this.props.width / this.props.vectorField.getWidth());
  }

  xToCanvasX(ctx: CanvasRenderingContext2D, x: number) {
    return this.xUnitsToCanvasXUnits(x);
  }

  yUnitsToCanvasYUnits(yUnits: number) {
    return yUnits * (this.props.height / this.props.vectorField.getHeight());
  }

  yToCanvasY(ctx: CanvasRenderingContext2D, y: number) {
    return ctx.canvas.height - this.yUnitsToCanvasYUnits(y);
  }

  renderParticle(particle: Particle, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = particle.color;

    let alpha = particle.alpha;
    if (particle.lifeTime >= PARTICLE_FADE_START) {
      alpha =
        particle.alpha *
        ((PARTICLE_LIFETIME - PARTICLE_FADE_START - particle.lifeTime) /
          (PARTICLE_LIFETIME - PARTICLE_FADE_START));
    }

    ctx.globalAlpha = alpha;
    ctx.fillRect(
      this.xToCanvasX(ctx, particle.x - particle.width / 2),
      this.yToCanvasY(ctx, particle.y + particle.height / 2),
      this.xUnitsToCanvasXUnits(particle.width),
      this.yUnitsToCanvasYUnits(particle.height),
    );

    if (SHOW_PARTICLE_TAILS) {
      ctx.globalAlpha = Math.min(0.11, alpha);
      for (let i = 0; i < particle.xTail.length; i++) {
        ctx.fillRect(
          this.xToCanvasX(ctx, particle.xTail[i] - particle.width / 2),
          this.yToCanvasY(ctx, particle.yTail[i] + particle.height / 2),
          this.xUnitsToCanvasXUnits(particle.width),
          this.yUnitsToCanvasYUnits(particle.height),
        );
      }
    }
  }

  renderBgCanvas(vectorField: VectorField) {
    const canvas = document.getElementById(
      'background-canvas',
    ) as HTMLCanvasElement;
    canvas.width = this.props.width;
    canvas.height = this.props.height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    for (let x = 0; x < vectorField.getWidth(); x = x + 5) {
      for (let y = 0; y < vectorField.getHeight(); y = y + 5) {
        this.plotArrow(
          ctx,
          x,
          y,
          vectorField.uField[x][y],
          vectorField.vField[x][y],
        );
      }
    }

    for (let y = 0; y <= vectorField.getHeight(); y++) {
      ctx.moveTo(this.xToCanvasX(ctx, 0), this.yToCanvasY(ctx, y));
      ctx.lineTo(
        this.xToCanvasX(ctx, vectorField.getWidth() - 1),
        this.yToCanvasY(ctx, y),
      );
    }
    for (let x = 0; x <= vectorField.getWidth(); x++) {
      ctx.moveTo(this.xToCanvasX(ctx, x), this.yToCanvasY(ctx, 0));
      ctx.lineTo(
        this.xToCanvasX(ctx, x),
        this.yToCanvasY(ctx, vectorField.getHeight() - 1),
      );
    }
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  plotArrow(
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
    ctx.translate(this.xToCanvasX(ctx, x), this.yToCanvasY(ctx, y));
    ctx.rotate(-Math.atan2(v, u));
    drawArrow(ctx, Math.sqrt(u ** 2 + v ** 2) / 10);
    ctx.restore();
  }

  render() {
    return (
      <div>
        <canvas
          ref={(canvas: HTMLCanvasElement) => {
            this.backgroundCanvas = canvas;
          }}
          style={{position: 'fixed'}}
        />
        <canvas
          ref={(canvas: HTMLCanvasElement) => {
            this.foregroundCanvas = canvas;
          }}
          style={{position: 'fixed'}}
        />
      </div>
    );
  }
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

class Particle {
  x: number;
  y: number;
  xTail: number[];
  yTail: number[];
  height: number;
  width: number;
  color: string;
  alpha: number;
  lifeTime: number;
  dead: boolean;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.height = 1;
    this.width = 1;
    this.color =
      'rgb(' +
      Math.random() * 255 +
      ',' +
      Math.random() * 255 +
      ',' +
      Math.random() * 255 +
      ')';
    this.alpha = 0.3;
    this.lifeTime = 0;
    this.xTail = [];
    this.yTail = [];
  }

  update(vectorField: VectorField, deltaT: number) {
    // TODO: Calculate movement from frame time

    if (this.xTail.length > 5) {
      this.xTail.shift(); // O(n) - use proper queue data structure if slow
      this.yTail.shift(); // O(n) - use proper queue data structure if slow
    }
    if (
      this.x >= 0 &&
      this.x <= vectorField.getWidth() - 1 &&
      this.y >= 0 &&
      this.y <= vectorField.getHeight() - 1
    ) {
      this.lifeTime += deltaT;
      this.xTail.push(this.x);
      this.yTail.push(this.y);
      const u = interpolatePoint(vectorField.uField, this.x, this.y);
      const v = interpolatePoint(vectorField.vField, this.x, this.y);
      this.x = this.x + u / 50;
      this.y = this.y + v / 50;
    }
  }
}
