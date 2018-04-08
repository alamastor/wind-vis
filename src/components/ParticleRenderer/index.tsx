import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

const INIT_PARTICLE_COUNT = 50000;
const MAX_PARTICLE_COUNT = 1000000;
const MIN_PARTICLE_COUNT = 1000;

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
  Particles,
  initParticles,
  refreshParticles,
  updateParticleCount,
  updateParticles,
} from './Particles';
import debugPrint from '../../utils/debugPrint';

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
  particles: Particles = initParticles(INIT_PARTICLE_COUNT);
  colors = new Float32Array(MAX_PARTICLE_COUNT * 3);
  prevParticleUpdateDt = 0;

  componentDidMount() {
    const gl = this.canvas.getContext('webgl');
    if (gl != null) {
      this.glState = getGLStateForParticles(gl);
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i] = Math.random();
      }
      setViewport(this.glState);
      initColors(this.glState, this.colors);
      setZoomLevel(this.glState, this.props.projState.zoomLevel);
      setCenterCoord(this.glState, this.props.projState.centerCoord);
      window.requestAnimationFrame(this.updateAndRender.bind(this));
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.glState != null) {
      setViewport(this.glState);
      if (
        this.props.resetPariclesOnInit &&
        this.props.vectorField !== prevProps.vectorField
      ) {
        this.particles = refreshParticles(this.particles);
      }

      if (prevProps.projState.zoomLevel != this.props.projState.zoomLevel) {
        setZoomLevel(this.glState, this.props.projState.zoomLevel);
      }

      if (prevProps.projState.centerCoord != this.props.projState.centerCoord) {
        setCenterCoord(this.glState, this.props.projState.centerCoord);
      }

      this.updateParticleCount();
    }
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
          this.particles.length * 0.25,
        );
        debugPrint(
          `frame rate is ${Math.round(
            this.props.frameRate,
          )} fps, decreasing particle count to ${newParticleCount}`,
        );
        this.particles = updateParticleCount(this.particles, newParticleCount);
      } else if (
        this.props.frameRate > 50 &&
        this.particles.length < MAX_PARTICLE_COUNT
      ) {
        const newParticleCount = Math.min(
          MAX_PARTICLE_COUNT,
          this.particles.length * 1.25,
        );
        debugPrint(
          `frame rate is ${Math.round(
            this.props.frameRate,
          )} fps, increasing particle count to ${newParticleCount}`,
        );
        this.particles = updateParticleCount(this.particles, newParticleCount);
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

    if (this.glState != null) {
      drawParticles(this.glState, this.particles);
    }
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
