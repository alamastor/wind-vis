import {Coord} from '../../Types';
import {loadShader} from '../../utils/gl';
import vertexShaderSource from './vertexshader.glsl';
import fragmentShaderSource from './fragmentshader.glsl';
import {Particles} from './Particles';

export interface GLState {
  gl: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  lonBuffer: WebGLBuffer;
  latBuffer: WebGLBuffer;
  colorBuffer: WebGLBuffer;
}

export function getGLStateForParticles(gl: WebGLRenderingContext): GLState {
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

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  return {gl, shaderProgram, lonBuffer, latBuffer, colorBuffer};
}

export function setViewport(glState: GLState) {
  const {gl, shaderProgram} = glState;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  const aspectRatioLoc = gl.getUniformLocation(shaderProgram, 'aspectRatio');
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);
}

export function initColors(glState: GLState, colors: Float32Array) {
  const {gl, colorBuffer} = glState;
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
}

export function drawParticles(glState: GLState, positions: Particles) {
  const {gl, lonBuffer, latBuffer} = glState;
  gl.bindBuffer(gl.ARRAY_BUFFER, lonBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions.lon, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, latBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions.lat, gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, positions.length);
}

export function setZoomLevel(glState: GLState, zoomLevel: number) {
  const {gl, shaderProgram} = glState;
  const zoomLevelLoc = gl.getUniformLocation(shaderProgram, 'zoomLevel');
  gl.uniform1f(zoomLevelLoc, zoomLevel);
}

export function setCenterCoord(glState: GLState, centerCoord: Coord) {
  const {gl, shaderProgram} = glState;
  const midCoordLoc = gl.getUniformLocation(shaderProgram, 'midCoord');
  gl.uniform2f(midCoordLoc, centerCoord.lon, centerCoord.lat);
}
