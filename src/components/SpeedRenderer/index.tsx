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
  tex: WebGLTexture;
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
  maxSpeed = 0;

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
    const speedData = this.props.vectorField.speedData();
    const maxSpeed = Math.max(...speedData);
    if (maxSpeed > this.maxSpeed) {
      this.maxSpeed = maxSpeed;
    }
    const transformedSpeedData = new Uint8Array(512 * 512);
    // Transform speed data direction, make square power of two, and normalize
    for (let x = 0; x < 512; x++) {
      for (let y = 0; y < 512; y++) {
        transformedSpeedData[512 * y + x] =
          speedData[
            181 * Math.floor(x * 360 / 512) + Math.floor(y * 181 / 512)
          ] /
          (this.maxSpeed / 255);
      }
    }
    draw(this.getGLState(), transformedSpeedData);
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
    attribute vec2 point;

    uniform float aspectRatio;
    uniform float zoomLevel;
    uniform vec2 midCoord;

    varying vec2 texCoord;

    void main() {
      gl_Position = vec4(point, 0, 1);

      texCoord = 0.5 + (midCoord - vec2(180, 0)) / vec2(360, 180) +
                point * vec2(min(0.5, aspectRatio / 4.0),
                             min(0.5, 1.0 / aspectRatio)) / zoomLevel;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;

    varying vec2 texCoord;
    uniform sampler2D tex;

    void main() {
      gl_FragColor = vec4(texture2D(tex, texCoord).r, 0, 0, 1);
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

  // prettier-ignore
  const points = new Float32Array([
    -1, -1,
    -1,  1,
     1,  1,
     1,  1,
     1, -1,
    -1, -1,
  ]);

  const pointLoc = gl.getAttribLocation(shaderProgram, 'point');
  const pointBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
  gl.enableVertexAttribArray(pointLoc);
  gl.vertexAttribPointer(pointLoc, 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

  const aspectRatioLoc = gl.getUniformLocation(shaderProgram, 'aspectRatio');
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  const tex = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  return {gl, shaderProgram, tex};
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

function draw(glState: GLState, texData: Uint8Array) {
  const {gl, tex} = glState;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    512,
    512,
    0,
    gl.LUMINANCE,
    gl.UNSIGNED_BYTE,
    texData,
  );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
