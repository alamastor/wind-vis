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

abstract class VectorFieldRenderer extends React.Component<Props, State> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;

  componentDidMount() {
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
  }

  getCtx(): CanvasRenderingContext2D {
    if (!this.ctx) {
      this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    return this.ctx;
  }

  xUnitsToCanvasXUnits(xUnits: number) {
    return xUnits * (this.props.width / this.props.vectorField.getWidth());
  }

  xToCanvasX(x: number) {
    return this.xUnitsToCanvasXUnits(x);
  }

  yUnitsToCanvasYUnits(yUnits: number) {
    return yUnits * (this.props.height / this.props.vectorField.getHeight());
  }

  yToCanvasY(y: number) {
    return this.getCtx().canvas.height - this.yUnitsToCanvasYUnits(y);
  }

  render() {
    return (
      <div>
        <canvas
          ref={(canvas: HTMLCanvasElement) => {
            this.canvas = canvas;
          }}
          style={{position: 'fixed'}}
        />
      </div>
    );
  }
}

export class ParticleRenderer extends VectorFieldRenderer {
  particles: Particle[] = [];

  componentDidMount() {
    super.componentDidMount();
    window.requestAnimationFrame(this.updateAndRender.bind(this));
  }

  updateAndRender(prevTime: number, timestamp: number) {
    let deltaT: number;
    if (prevTime !== null) {
      deltaT = timestamp - prevTime;
    } else {
      deltaT = 0;
    }

    for (let i = 0; i < 5; i++) {
      if (this.particles.length < MAX_PARTICLES) {
        this.particles.push(
          new Particle(
            Math.random() * this.props.vectorField.getWidth(),
            Math.random() * this.props.vectorField.getHeight(),
          ),
        );
      }
    }

    this.particles.forEach((part: Particle) => {
      part.update(this.props.vectorField, deltaT);
    });

    if (CLEAR_PARTICLES_EACH_FRAME) {
      this.getCtx().clearRect(
        0,
        0,
        this.getCtx().canvas.width,
        this.getCtx().canvas.height,
      );
    }

    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      if (
        this.particles[i].lifeTime >= PARTICLE_LIFETIME ||
        this.particles[i].x <= 0 ||
        this.particles[i].x >= this.props.vectorField.getWidth() - 1 ||
        this.particles[i].y <= 0 ||
        this.particles[i].y >= this.props.vectorField.getHeight() - 1
      ) {
        this.particles[i] = new Particle(
          Math.random() * (this.props.vectorField.getWidth() - 1),
          Math.random() * (this.props.vectorField.getHeight() - 1),
        );
      }
      if (this.particles[i] != null) {
        this.renderParticle(this.particles[i]);
      }
    }

    window.requestAnimationFrame(this.updateAndRender.bind(this, timestamp));
  }

  renderParticle(particle: Particle) {
    this.getCtx().fillStyle = particle.color;

    let alpha = particle.alpha;
    if (particle.lifeTime >= PARTICLE_FADE_START) {
      alpha =
        particle.alpha *
        ((PARTICLE_LIFETIME - PARTICLE_FADE_START - particle.lifeTime) /
          (PARTICLE_LIFETIME - PARTICLE_FADE_START));
    }

    this.getCtx().globalAlpha = alpha;
    this.getCtx().fillRect(
      this.xToCanvasX(particle.x - particle.width / 2),
      this.yToCanvasY(particle.y + particle.height / 2),
      this.xUnitsToCanvasXUnits(particle.width),
      this.yUnitsToCanvasYUnits(particle.height),
    );

    if (SHOW_PARTICLE_TAILS) {
      this.getCtx().globalAlpha = Math.min(0.11, alpha);
      for (let i = 0; i < particle.xTail.length; i++) {
        this.getCtx().fillRect(
          this.xToCanvasX(particle.xTail[i] - particle.width / 2),
          this.yToCanvasY(particle.yTail[i] + particle.height / 2),
          this.xUnitsToCanvasXUnits(particle.width),
          this.yUnitsToCanvasYUnits(particle.height),
        );
      }
    }
  }
}

export class VectorRenderer extends VectorFieldRenderer {
  componentDidMount() {
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
    this.renderOnCanvas();
  }

  componentDidUpdate() {
    this.renderOnCanvas();
  }

  renderOnCanvas() {
    const ctx = this.getCtx();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.beginPath();
    const color = 'rgb(140, 200, 300)';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    for (let x = 0; x < this.props.vectorField.getWidth(); x = x + 5) {
      for (let y = 0; y < this.props.vectorField.getHeight(); y = y + 5) {
        this.plotArrow(
          x,
          y,
          this.props.vectorField.uField[x][y],
          this.props.vectorField.vField[x][y],
        );
      }
    }
    ctx.stroke();

    for (let x = 0; x <= this.props.vectorField.getWidth(); x = x + 5) {
      ctx.moveTo(this.xToCanvasX(x), this.yToCanvasY(0));
      ctx.lineTo(
        this.xToCanvasX(x),
        this.yToCanvasY(this.props.vectorField.getHeight() - 1),
      );
    }
    for (let y = 0; y <= this.props.vectorField.getHeight(); y = y + 5) {
      ctx.moveTo(this.xToCanvasX(0), this.yToCanvasY(y));
      ctx.lineTo(
        this.xToCanvasX(this.props.vectorField.getWidth() - 1),
        this.yToCanvasY(y),
      );
    }
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  plotArrow(x: number, y: number, u: number, v: number) {
    const ctx = this.getCtx();
    ctx.save();
    ctx.translate(this.xToCanvasX(x), this.yToCanvasY(y));
    ctx.rotate(-Math.atan2(v, u));
    drawArrow(ctx, Math.sqrt(u ** 2 + v ** 2) / 10);
    ctx.restore();
  }
}

function drawArrow(ctx: CanvasRenderingContext2D, len: number) {
  const tail = -5 * len;
  const head = 5 * len;
  const headStart = 5 * len - 5;
  ctx.moveTo(tail, 0);
  ctx.lineTo(headStart, 0);
  ctx.moveTo(head, 0);
  ctx.lineTo(headStart, 1.5);
  ctx.lineTo(headStart, -1.5);
  ctx.lineTo(head, 0);
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
