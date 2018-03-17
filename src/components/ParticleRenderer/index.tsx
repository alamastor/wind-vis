import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import {Coord} from '../../Types';
import VectorField from '../../utils/fielddata/VectorField';
import {
  State as ProjState,
  transformCoord,
  scaleCoord,
  transformPoint,
} from '../../Projection/Translate';
import {loadShader} from '../../utils/gl';
import mod from '../../utils/mod';

const PARTICLE_FADE_START = 2000;
const PARTICLE_BASE_LIFETIME = 4000;
const PARTICLE_COUNT = 200000;

export interface Particles {
  readonly length: number;
  readonly lon: Float32Array;
  readonly lat: Float32Array;
  readonly age: Float32Array;
}

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  width: number;
  height: number;
  showParticleTails: boolean;
  clearParticlesEachFrame: boolean;
  resetPariclesOnInit: boolean;
}
interface State {}
export default class ParticleRenderer extends React.Component<Props, State> {
  canvas: HTMLCanvasElement;
  glState: GLState | null;
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
    initColors(this.getGLState(), this.colors);
    setZoomLevel(this.getGLState(), this.props.projState.zoomLevel);
    setCenterCoord(this.getGLState(), this.props.projState.centerCoord);
    window.requestAnimationFrame(this.updateAndRender.bind(this));
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
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
interface GLState {
  gl: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  lonBuffer: WebGLBuffer;
  latBuffer: WebGLBuffer;
  colorBuffer: WebGLBuffer;
}

function getGLStateForParticles(gl: WebGLRenderingContext): GLState {
  const vertexShaderSource = `
    attribute float lon;
    attribute float lat;
    attribute vec3 color;
    uniform float aspectRatio;
    uniform float zoomLevel;
    uniform vec2 midCoord;

    varying lowp vec3 shColor;

    void main() {
      shColor = color;
      vec2 offset = vec2(180, 0) - midCoord;
      vec2 clipSpace = vec2(max(0.5, 1.0 / aspectRatio), max(2.0, aspectRatio)) *
                      (vec2(lon, lat) + offset - vec2(180, 0)) / vec2(90, 180);
      vec2 zoomed = zoomLevel * clipSpace;
      gl_PointSize = 3.0;
      gl_Position = vec4(zoomed, 0, 1);
    }
  `;

  const fragmentShaderSource = `
    varying lowp vec3 shColor;
    void main() {
      gl_FragColor = vec4(shColor, 1) * 1.0;
    }
  `;

  const shaderProgram = gl.createProgram();
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(
      'Error initializing shader program: ' +
        gl.getProgramInfoLog(shaderProgram),
    );
  }
  if (shaderProgram == null) {
    throw new Error('shaderProgram is null');
  }

  const lonLoc = gl.getAttribLocation(shaderProgram, 'lon');
  const lonBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, lonBuffer);
  gl.enableVertexAttribArray(lonLoc);
  gl.vertexAttribPointer(lonLoc, 1, gl.FLOAT, false, 0, 0);

  const latLoc = gl.getAttribLocation(shaderProgram, 'lat');
  const latBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, latBuffer);
  gl.enableVertexAttribArray(latLoc);
  gl.vertexAttribPointer(latLoc, 1, gl.FLOAT, false, 0, 0);

  const colorLoc = gl.getAttribLocation(shaderProgram, 'color');
  const colorBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.enableVertexAttribArray(colorLoc);
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

  const aspectRatioLoc = gl.getUniformLocation(shaderProgram, 'aspectRatio');
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);

  return {gl, shaderProgram, lonBuffer, latBuffer, colorBuffer};
}

function initColors(glState: GLState, colors: Float32Array) {
  const {gl, colorBuffer} = glState;
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
}

function drawParticles(glState: GLState, positions: Particles) {
  const {gl, lonBuffer, latBuffer} = glState;
  gl.bindBuffer(gl.ARRAY_BUFFER, lonBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions.lon, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, latBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions.lat, gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, positions.length);
}

function setZoomLevel(glState: GLState, zoomLevel: number) {
  const {gl, shaderProgram} = glState;
  const zoomLevelLoc = gl.getUniformLocation(shaderProgram, 'zoomLevel');
  gl.uniform1f(zoomLevelLoc, zoomLevel);
}

function setCenterCoord(glState: GLState, centerCoord: Coord) {
  const {gl, shaderProgram} = glState;
  const midCoordLoc = gl.getUniformLocation(shaderProgram, 'midCoord');
  gl.uniform2f(midCoordLoc, centerCoord.lon, centerCoord.lat);
}
