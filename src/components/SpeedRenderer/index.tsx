import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import {Coord} from '../../Types';
import VectorField from '../../utils/fielddata/VectorField';
import {ProjState, transformCoord, scaleCoord} from '../../utils/Projection';
import {loadShader} from '../../utils/gl';

interface GLState {
  gl: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  spdBuffer: WebGLBuffer;
}

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  width: number;
  height: number;
}
interface State {}
export default class SpeedRenderer extends React.Component<Props, State> {
  canvas!: HTMLCanvasElement;
  glState: GLState | null = null;

  getGLState(): GLState {
    if (!this.glState) {
      const gl = this.canvas.getContext('webgl') as WebGLRenderingContext;
      this.glState = getGLStateForSpeeds(gl);
    }
    return this.glState;
  }

  componentDidMount() {
    setZoomLevel(this.getGLState(), this.props.projState.zoomLevel);
    setCenterCoord(this.getGLState(), this.props.projState.centerCoord);
    window.requestAnimationFrame(this.updateAndRender.bind(this));
  }

  componentDidUpdate() {
    setZoomLevel(this.getGLState(), this.props.projState.zoomLevel);
    setCenterCoord(this.getGLState(), this.props.projState.centerCoord);
    window.requestAnimationFrame(this.updateAndRender.bind(this));
  }

  updateAndRender() {
    drawPoints(this.getGLState(), this.props.vectorField.speedData());
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

function getGLStateForSpeeds(gl: WebGLRenderingContext): GLState {
  const vertexShaderSource = `
    attribute float spd;
    attribute float lon;
    attribute float lat;
    uniform float aspectRatio;
    uniform float zoomLevel;
    uniform vec2 midCoord;

    varying float speed;
    void main() {
      speed = spd;
      vec2 offset = vec2(180, 0) - midCoord;
      float newLon = mod(lon + offset.x, 360.0) - 180.0;
      float newLat = lat + offset.y;
      vec2 clipSpace = vec2(max(0.5, 1.0 / aspectRatio), max(2.0, aspectRatio)) *
                      vec2(newLon, newLat) / vec2(90, 180);
      vec2 zoomed = zoomLevel * clipSpace;
      gl_PointSize = 4.719 * zoomLevel;
      gl_Position = vec4(zoomed, 0, 1);
    }
  `;

  const fragmentShaderSource = `
    varying lowp float speed;
    void main() {
      gl_FragColor = vec4((speed - 10.0)/50.0, 0.2, (10.0-speed)/10.0, 1) * 0.8;
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

  const spdLoc = gl.getAttribLocation(shaderProgram, 'spd');
  const spdBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, spdBuffer);
  gl.enableVertexAttribArray(spdLoc);
  gl.vertexAttribPointer(spdLoc, 1, gl.FLOAT, false, 0, 0);

  const lons = new Float32Array(360 * 181);
  const lats = new Float32Array(360 * 181);
  for (let x = 0; x < 360; x++) {
    for (let y = 0; y < 181; y++) {
      lons[x * 181 + y] = x;
      lats[x * 181 + y] = y - 90;
    }
  }

  const lonLoc = gl.getAttribLocation(shaderProgram, 'lon');
  const lonBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, lonBuffer);
  gl.enableVertexAttribArray(lonLoc);
  gl.vertexAttribPointer(lonLoc, 1, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, lons, gl.STATIC_DRAW);

  const latLoc = gl.getAttribLocation(shaderProgram, 'lat');
  const latBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, latBuffer);
  gl.enableVertexAttribArray(latLoc);
  gl.vertexAttribPointer(latLoc, 1, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, lats, gl.STATIC_DRAW);

  const aspectRatioLoc = gl.getUniformLocation(shaderProgram, 'aspectRatio');
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.depthMask(false);
  return {gl, shaderProgram, spdBuffer};
}

function drawPoints(glState: GLState, spds: Float32Array) {
  const {gl, spdBuffer} = glState;
  gl.bindBuffer(gl.ARRAY_BUFFER, spdBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, spds, gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, spds.length);
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
