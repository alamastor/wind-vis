import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import {ProjState, transformCoord, scaleCoord} from '../../utils/Projection';
import {
  glState,
  drawSpeeds,
  drawParticles,
  updateParticles,
  updateWindTex,
  getGLState,
} from './gl';
import {
  PARTICLE_LIFETIME,
  Particles,
  initParticles,
  refreshParticles,
  updateParticleCount,
} from './Particles';
import {RootAction as Action} from '../../reducers';
import debugPrint from '../../utils/debugPrint';
import {transformDataForGPU} from './transformData';
const DataTransformer = require('worker-loader!./DataTransformerWorker');

const INIT_PARTICLE_COUNT = 50000;
const MAX_PARTICLE_COUNT = 1000000;
const MIN_PARTICLE_COUNT = 1000;

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  maxSpeed: number;
  width: number;
  height: number;
  resetPariclesOnInit: boolean;
  frameRate: number;
  setGlUnavailable: () => Action;
}
interface State {}
export default class SpeedRenderer extends React.Component<Props, State> {
  canvas!: HTMLCanvasElement;
  glState: glState | null = null;
  dataTransformer = new DataTransformer();
  particles: Particles = initParticles(INIT_PARTICLE_COUNT);
  colors = new Float32Array(MAX_PARTICLE_COUNT * 3);
  prevParticleUpdateDt = 0;

  constructor(props: Props) {
    super(props);
    this.dataTransformer.onmessage = (message: {
      data: {uData: Uint8Array; vData: Uint8Array};
    }) => {
      if (this.glState != null) {
        updateWindTex(this.glState, message.data.uData, message.data.vData);
      }
    };
  }

  componentDidMount() {
    const gl =
      this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl');
    if (gl != null) {
      this.glState = getGLState(gl);
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i] = Math.random();
      }
      updateWindTex(
        this.glState,
        transformDataForGPU(
          this.props.vectorField.uField.data,
          this.props.maxSpeed,
        ),
        transformDataForGPU(
          this.props.vectorField.vField.data,
          this.props.maxSpeed,
        ),
      );
      window.requestAnimationFrame(this.updateAndRender.bind(this));
    } else {
      this.props.setGlUnavailable();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.glState != null) {
      if (prevProps.vectorField !== this.props.vectorField) {
        this.dataTransformer.postMessage({
          uData: this.props.vectorField.uField.data,
          vData: this.props.vectorField.vField.data,
          maxValue: this.props.maxSpeed,
        });
      }

      if (
        this.props.resetPariclesOnInit &&
        this.props.vectorField !== prevProps.vectorField
      ) {
        this.particles = refreshParticles(this.particles);
      }

      const now = Date.now();
      // Only check framerate every 5 seconds
      if (now - this.prevParticleUpdateDt > 5000) {
        this.updateParticleCount();
        this.prevParticleUpdateDt = now;
      }
    }
  }

  updateParticleCount() {
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
      /*
      drawSpeeds(
        this.glState,
        this.props.projState.centerCoord,
        this.props.projState.zoomLevel,
      );
      */
      drawParticles(
        this.glState,
        this.props.projState.centerCoord,
        this.props.projState.zoomLevel,
      );
      updateParticles(this.glState);
    }

    window.requestAnimationFrame(this.updateAndRender.bind(this, timestamp));
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
