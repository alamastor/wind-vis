import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import {ProjState} from '../../utils/Projection';
import mod from '../../utils/mod';
import {
  GLState,
  Particles,
  drawParticles,
  getGLStateForParticles,
  initColors,
  setCenterCoord,
  setViewport,
  setZoomLevel,
} from './gl';

const PARTICLE_FADE_START = 2000;
const PARTICLE_BASE_LIFETIME = 4000;
const PARTICLE_COUNT = 50000;

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  width: number;
  height: number;
  resetPariclesOnInit: boolean;
}
interface State {}
export default class ParticleRenderer extends React.Component<Props, State> {
  canvas!: HTMLCanvasElement;
  glState: GLState | null = null;
  x = 10;
  y = 10;
  width = 20;
  height = 20;
  particles: Particles = {
    length: PARTICLE_COUNT,
    lon: new Float32Array(PARTICLE_COUNT),
    lat: new Float32Array(PARTICLE_COUNT),
    age: new Float32Array(PARTICLE_COUNT),
  };
  colors = new Float32Array(PARTICLE_COUNT * 3);

  getGLState(): GLState {
    if (!this.glState) {
      const gl = this.canvas.getContext('webgl') as WebGLRenderingContext;
      this.glState = getGLStateForParticles(gl);
    }
    return this.glState;
  }

  componentDidMount() {
    this.initParticles();
    for (let i = 0; i < this.colors.length; i++) {
      this.colors[i] = Math.random();
    }
    setViewport(this.getGLState());
    initColors(this.getGLState(), this.colors);
    setZoomLevel(this.getGLState(), this.props.projState.zoomLevel);
    setCenterCoord(this.getGLState(), this.props.projState.centerCoord);
    window.requestAnimationFrame(this.updateAndRender.bind(this));
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    setViewport(this.getGLState());
    if (
      this.props.resetPariclesOnInit &&
      this.props.vectorField !== prevProps.vectorField
    ) {
      this.initParticles();
    }

    if (prevProps.projState.zoomLevel != this.props.projState.zoomLevel) {
      setZoomLevel(this.getGLState(), this.props.projState.zoomLevel);
    }

    if (prevProps.projState.centerCoord != this.props.projState.centerCoord) {
      setCenterCoord(this.getGLState(), this.props.projState.centerCoord);
    }
  }

  initParticles() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.lon[i] = 0;
      this.particles.lat[i] = 0;
      this.particles.age[i] = Math.random() * PARTICLE_BASE_LIFETIME;
    }
  }

  updateAndRender(prevTime: number, timestamp: number) {
    let deltaT: number;
    if (timestamp != null) {
      deltaT = timestamp - prevTime;
    } else {
      deltaT = 0;
      timestamp = prevTime;
    }

    drawParticles(this.getGLState(), this.particles);
    updateParticles(
      this.props.projState,
      this.particles,
      this.props.vectorField,
      deltaT,
    );

    window.requestAnimationFrame(this.updateAndRender.bind(this, timestamp));
  }

  render() {
    return (
      <canvas
        className={style({
          position: 'fixed',
          top: 0,
          left: 0,
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

function updateParticles(
  projState: ProjState,
  particles: Particles,
  vectorField: VectorField,
  deltaT: number,
) {
  for (let i = 0; i < particles.length; i++) {
    const lon = particles.lon[i];
    const lat = particles.lat[i];
    const age = particles.age[i] + deltaT;
    if (age < PARTICLE_BASE_LIFETIME) {
      if (lat >= -90 && lat <= 90) {
        const u = vectorField.uField.getValue(lon, lat);
        const v = vectorField.vField.getValue(lon, lat);
        particles.lon[i] = mod(lon + u * deltaT / 1000, 360);
        particles.lat[i] = lat + v * deltaT / 1000;
      } else if (lat < -90) {
        const u = vectorField.uField.getValue(lon, -90);
        const v = vectorField.vField.getValue(lon, -90);
        particles.lon[i] = mod(180 + lon + u * deltaT / 1000, 360);
        particles.lat[i] = -90 - lat - v * deltaT / 1000;
      } else if (lat > 90) {
        const u = vectorField.uField.getValue(lon, 90);
        const v = vectorField.vField.getValue(lon, 90);
        particles.lon[i] = mod(180 + lon + u * deltaT / 1000, 360);
        particles.lat[i] = 90 - lat - v * deltaT / 1000;
      }
    } else {
      particles.lon[i] = Math.random() * 360;
      particles.lat[i] = Math.random() * 180 - 90;
    }
    particles.age[i] = age % PARTICLE_BASE_LIFETIME;
  }
}
