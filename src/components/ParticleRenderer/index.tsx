import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {VectorField} from '../../fields';
import Projection from '../../Projection';

const PARTICLE_FADE_START = 5000;
const PARTICLE_LIFETIME = 7000;
const MAX_PARTICLES = 3000;

interface ParticleRendererProps {
  vectorField: VectorField;
  width: number;
  height: number;
  showParticleTails: boolean;
  clearParticlesEachFrame: boolean;
}
interface ParticleRendererState {}
export default class extends React.Component<
  ParticleRendererProps,
  ParticleRendererState
> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  particles: Particle[] = [];
  proj: Projection;

  constructor(props: ParticleRendererProps) {
    super(props);
    this.proj = new Projection(props.vectorField, props.width, props.height);
  }

  getCtx(): CanvasRenderingContext2D {
    if (!this.ctx) {
      this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    return this.ctx;
  }

  componentDidMount() {
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

    if (this.props.clearParticlesEachFrame) {
      this.getCtx().clearRect(0, 0, this.props.width, this.props.height);
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
      this.proj.transformX(particle.x - particle.width / 2),
      this.proj.transformY(particle.y + particle.height / 2),
      this.proj.scaleX(particle.width),
      this.proj.scaleY(particle.height),
    );

    if (this.props.showParticleTails) {
      this.getCtx().globalAlpha = Math.min(0.11, alpha);
      for (let i = 0; i < particle.xTail.length; i++) {
        this.getCtx().fillRect(
          this.proj.transformX(particle.xTail[i] - particle.width / 2),
          this.proj.transformY(particle.yTail[i] + particle.height / 2),
          this.proj.scaleX(particle.width),
          this.proj.scaleY(particle.height),
        );
      }
    }
  }

  render() {
    return (
      <div>
        <canvas
          width={this.props.width}
          height={this.props.height}
          ref={(canvas: HTMLCanvasElement) => {
            this.canvas = canvas;
          }}
          style={{position: 'fixed'}}
        />
      </div>
    );
  }
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
