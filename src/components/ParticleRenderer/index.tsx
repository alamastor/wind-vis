import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import {ProjState} from '../../utils/Projection';
import VectorField from '../../utils/fielddata/VectorField';
import {
  GLState,
  drawParticles,
  getGLStateForParticles,
  initColors,
  setCenterCoord,
  setViewport,
  setZoomLevel,
} from './gl';
import {
  PARTICLE_LIFETIME,
  MAX_PARTICLE_COUNT,
  MIN_PARTICLE_COUNT,
  Particles,
  initParticles,
  updateParticles,
} from './Particles';

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  width: number;
  height: number;
  resetPariclesOnInit: boolean;
  frameRate: number;
}
interface State {}
export default class ParticleRenderer extends React.Component<Props, State> {
  canvas!: HTMLCanvasElement;
  glState: GLState | null = null;
  x = 10;
  y = 10;
  width = 20;
  height = 20;
  particles: Particles = initParticles(MAX_PARTICLE_COUNT, PARTICLE_LIFETIME);
  colors = new Float32Array(MAX_PARTICLE_COUNT * 3);
  prevParticleUpdateDt = 0;

  getGLState(): GLState {
    if (!this.glState) {
      const gl = this.canvas.getContext('webgl') as WebGLRenderingContext;
      this.glState = getGLStateForParticles(gl);
    }
    return this.glState;
  }

  componentDidMount() {
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
      this.particles = initParticles(MAX_PARTICLE_COUNT, PARTICLE_LIFETIME);
    }

    if (prevProps.projState.zoomLevel != this.props.projState.zoomLevel) {
      setZoomLevel(this.getGLState(), this.props.projState.zoomLevel);
    }

    if (prevProps.projState.centerCoord != this.props.projState.centerCoord) {
      setCenterCoord(this.getGLState(), this.props.projState.centerCoord);
    }

    this.updateParticleCount();
  }

  updateParticleCount() {
    const now = Date.now();
    // Only update framerate every 5 seconds
    if (now - this.prevParticleUpdateDt > 5000) {
      if (
        this.props.frameRate < 30 &&
        this.particles.length > MIN_PARTICLE_COUNT
      ) {
        const newParticleCount = Math.max(
          MIN_PARTICLE_COUNT,
          this.particles.length / 2,
        );
        this.particles = initParticles(newParticleCount, PARTICLE_LIFETIME);
      } else if (
        this.props.frameRate > 50 &&
        this.particles.length < MAX_PARTICLE_COUNT
      ) {
        const newParticleCount = Math.min(
          MAX_PARTICLE_COUNT,
          this.particles.length * 2,
        );
        this.particles = initParticles(newParticleCount, PARTICLE_LIFETIME);
      }
      this.prevParticleUpdateDt = now;
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
    updateParticles(this.particles, this.props.vectorField, deltaT);

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
