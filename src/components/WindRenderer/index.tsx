import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import {ProjState, transformCoord, scaleCoord} from '../../utils/Projection';
import {
  SpeedGLState,
  draw,
  updateWindTex,
  getGLStateForSpeeds,
  setCenterCoord,
  setViewport,
  setZoomLevel,
} from './speedGL';
import {
  ParticleGLState,
  drawParticles,
  getGLStateForParticles,
  initColors as initParticleColors,
  setCenterCoord as setParticleCenterCoord,
  setViewport as setParticleViewport,
  setZoomLevel as setParticleZoomLevel,
} from './particleGL';
import {
  PARTICLE_LIFETIME,
  Particles,
  initParticles,
  refreshParticles,
  updateParticleCount,
  updateParticles,
} from './Particles';
import {RootAction as Action} from '../../reducers';
import debugPrint from '../../utils/debugPrint';
import {transformData} from './transformData';
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
  gl: WebGLRenderingContext | null = null;
  speedGLState: SpeedGLState | null = null;
  particleGLState: ParticleGLState | null = null;
  dataTransformer = new DataTransformer();
  particles: Particles = initParticles(INIT_PARTICLE_COUNT);
  colors = new Float32Array(MAX_PARTICLE_COUNT * 3);
  prevParticleUpdateDt = 0;

  constructor(props: Props) {
    super(props);
    this.dataTransformer.onmessage = (message: {
      data: {transformedSpeedData: Uint8Array};
    }) => {
      if (this.gl != null && this.speedGLState != null) {
        updateWindTex(
          this.gl,
          this.speedGLState,
          message.data.transformedSpeedData,
        );
      }
    };
  }

  componentDidMount() {
    const gl =
      this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl');
    if (gl != null) {
      this.gl = gl;
      this.speedGLState = getGLStateForSpeeds(gl);
      this.particleGLState = getGLStateForParticles(gl);
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i] = Math.random();
      }
      setViewport(gl, this.speedGLState);
      setZoomLevel(gl, this.speedGLState, this.props.projState.zoomLevel);
      setCenterCoord(gl, this.speedGLState, this.props.projState.centerCoord);
      initParticleColors(gl, this.particleGLState, this.colors);
      updateWindTex(
        this.gl,
        this.speedGLState,
        transformData(this.props.vectorField.speedData(), this.props.maxSpeed),
      );
      window.requestAnimationFrame(this.updateAndRender.bind(this));
    } else {
      this.props.setGlUnavailable();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.gl != null && this.speedGLState != null) {
      setViewport(this.gl, this.speedGLState);
      setZoomLevel(this.gl, this.speedGLState, this.props.projState.zoomLevel);
      setCenterCoord(
        this.gl,
        this.speedGLState,
        this.props.projState.centerCoord,
      );
      if (prevProps.vectorField !== this.props.vectorField) {
        this.dataTransformer.postMessage({
          speedData: this.props.vectorField.speedData(),
          maxSpeed: this.props.maxSpeed,
        });
      }

      if (
        prevProps.width !== this.props.width ||
        prevProps.height !== this.props.width
      ) {
        setViewport(this.gl, this.speedGLState);
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

    if (this.gl != null && this.speedGLState && this.particleGLState != null) {
      draw(
        this.gl,
        this.speedGLState,
        this.props.projState.centerCoord,
        this.props.projState.zoomLevel,
      );
      //setCenterCoord(this.glState, this.props.projState.centerCoord);
      //setZoomLevel(this.glState, this.props.projState.zoomLevel);
      drawParticles(
        this.gl,
        this.particleGLState,
        this.particles,
        this.props.projState.centerCoord,
        this.props.projState.zoomLevel,
      );
    }
    updateParticles(this.particles, this.props.vectorField, deltaT);

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
