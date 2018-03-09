import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import Projection from '../../Projection';

const PARTICLE_FADE_START = 2000;
const PARTICLE_BASE_LIFETIME = 4000;
const MAX_PARTICLES = 3000;

interface Props {
  vectorField: VectorField;
  projection: Projection;
  width: number;
  height: number;
  showParticleTails: boolean;
  clearParticlesEachFrame: boolean;
  resetPariclesOnInit: boolean;
}
interface State {}
export default class ParticleRenderer extends React.Component<Props, State> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  particles: Particle[] = [];

  getCtx(): CanvasRenderingContext2D {
    if (!this.ctx) {
      this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    return this.ctx;
  }

  componentDidMount() {
    window.requestAnimationFrame(this.updateAndRender.bind(this));
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.props.resetPariclesOnInit &&
      this.props.vectorField !== prevProps.vectorField
    ) {
      this.particles = [];
    }
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
            Math.random() * this.props.vectorField.getMaxLon(),
            Math.random() *
              (this.props.vectorField.getMaxLat() -
                this.props.vectorField.getMinLat()) +
              this.props.vectorField.getMinLat(),
            PARTICLE_BASE_LIFETIME + Math.random() * PARTICLE_BASE_LIFETIME,
          ),
        );
      }
    }

    this.particles.forEach((particle: Particle) => {
      particle.update(this.props.vectorField, deltaT);
    });

    if (this.props.clearParticlesEachFrame) {
      this.getCtx().clearRect(0, 0, this.props.width, this.props.height);
    }

    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      if (
        this.particles[i].age >= this.particles[i].lifeTime ||
        this.particles[i].lat <= this.props.vectorField.getMinLat() ||
        this.particles[i].lat >= this.props.vectorField.getMaxLat() ||
        this.particles[i].lon <= this.props.vectorField.getMinLon() ||
        this.particles[i].lon >= this.props.vectorField.getMaxLon()
      ) {
        this.particles[i] = new Particle(
          Math.random() * (this.props.vectorField.getMaxLon() - 1),
          Math.random() *
            (this.props.vectorField.getMaxLat() -
              this.props.vectorField.getMinLat()) +
            this.props.vectorField.getMinLat(),
          PARTICLE_BASE_LIFETIME + Math.random() * PARTICLE_BASE_LIFETIME,
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

    this.getCtx().globalAlpha = alpha;
    this.getCtx().fillRect(
      this.props.projection.transformLon(particle.lon - particle.width / 2),
      this.props.projection.transformLat(particle.lat + particle.height / 2),
      this.props.projection.scaleLon(particle.width),
      this.props.projection.scaleLat(particle.height),
    );

    if (this.props.showParticleTails) {
      this.getCtx().globalAlpha = Math.min(0.11, alpha);
      for (let i = 0; i < particle.xTail.length; i++) {
        this.getCtx().fillRect(
          this.props.projection.transformLon(
            particle.xTail[i] - particle.width / 2,
          ),
          this.props.projection.transformLat(
            particle.yTail[i] + particle.height / 2,
          ),
          this.props.projection.scaleLon(particle.width),
          this.props.projection.scaleLat(particle.height),
        );
      }
    }
  }

  render() {
    return (
      <canvas
        className={style({
          position: 'fixed',
        })}
        width={this.props.width}
        height={this.props.height}
        ref={(canvas: HTMLCanvasElement) => {
          this.canvas = canvas;
        }}
      />
    );
  }
}

class Particle {
  lon: number;
  lat: number;
  xTail: number[] = [];
  yTail: number[] = [];
  height = 1;
  width = 1;
  color = 'rgb(' +
    Math.random() * 255 +
    ',' +
    Math.random() * 255 +
    ',' +
    Math.random() * 255 +
    ')';
  alpha = 0.3;
  lifeTime: number;
  age = 0;
  constructor(lon: number, lat: number, lifeTime: number) {
    this.lon = lon;
    this.lat = lat;
    this.lifeTime = lifeTime;
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
      this.age += deltaT;
      this.yTail.push(this.lat);
      this.xTail.push(this.lon);
      const u = vectorField.uField.getValue(this.lon, this.lat);
      const v = vectorField.vField.getValue(this.lon, this.lat);
      this.lat = this.lat + v / 50;
      this.lon = this.lon + u / 50;
    }
    if (this.age >= PARTICLE_FADE_START) {
      this.alpha =
        0.3 *
        ((this.age - this.lifeTime) / (PARTICLE_FADE_START - this.lifeTime));
    }
  }
}
