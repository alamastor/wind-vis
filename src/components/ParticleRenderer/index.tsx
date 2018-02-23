import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {VectorField} from '../../fields';
import Projection from '../../Projection';

const PARTICLE_FADE_START = 5000;
const PARTICLE_LIFETIME = 7000;
const MAX_PARTICLES = 3000;

interface Props {
  vectorField: VectorField;
  width: number;
  height: number;
  showParticleTails: boolean;
  clearParticlesEachFrame: boolean;
}
interface State {}
export default class extends React.Component<Props, State> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  particles: Particle[] = [];
  proj: Projection;

  constructor(props: Props) {
    super(props);
    this.proj = new Projection(
      props.vectorField.getMinLat(),
      props.vectorField.getMaxLat(),
      props.vectorField.getMinLon(),
      props.vectorField.getMaxLon(),
      props.width,
      props.height,
    );
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
            Math.random() *
              (this.props.vectorField.getMaxLat() -
                this.props.vectorField.getMinLat()) +
              this.props.vectorField.getMinLat(),
            Math.random() * this.props.vectorField.getMaxLon(),
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
        this.particles[i].lat <= this.props.vectorField.getMinLat() ||
        this.particles[i].lat >= this.props.vectorField.getMaxLat() ||
        this.particles[i].lon <= this.props.vectorField.getMinLon() ||
        this.particles[i].lon >= this.props.vectorField.getMaxLon()
      ) {
        this.particles[i] = new Particle(
          Math.random() *
            (this.props.vectorField.getMaxLat() -
              this.props.vectorField.getMinLat()) +
            this.props.vectorField.getMinLat(),
          Math.random() * (this.props.vectorField.getMaxLon() - 1),
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
      this.proj.transformLon(particle.lon - particle.width / 2),
      this.proj.transformLat(particle.lat + particle.height / 2),
      this.proj.scaleLon(particle.width),
      this.proj.scaleLat(particle.height),
    );

    if (this.props.showParticleTails) {
      this.getCtx().globalAlpha = Math.min(0.11, alpha);
      for (let i = 0; i < particle.xTail.length; i++) {
        this.getCtx().fillRect(
          this.proj.transformLon(particle.xTail[i] - particle.width / 2),
          this.proj.transformLat(particle.yTail[i] + particle.height / 2),
          this.proj.scaleLon(particle.width),
          this.proj.scaleLat(particle.height),
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

class Particle {
  lat: number;
  lon: number;
  xTail: number[];
  yTail: number[];
  height: number;
  width: number;
  color: string;
  alpha: number;
  lifeTime: number;
  dead: boolean;
  constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon;
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
      this.lon >= vectorField.getMinLon() &&
      this.lon <= vectorField.getMaxLon() &&
      this.lat >= vectorField.getMinLat() &&
      this.lat <= vectorField.getMaxLat()
    ) {
      this.lifeTime += deltaT;
      this.yTail.push(this.lat);
      this.xTail.push(this.lon);
      const u = vectorField.uField.getValue(this.lat, this.lon);
      const v = vectorField.vField.getValue(this.lat, this.lon);
      this.lat = this.lat + v / 50;
      this.lon = this.lon + u / 50;
    }
  }
}
