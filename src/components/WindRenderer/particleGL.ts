import {Coord} from '../../Types';
import {loadShader} from '../../utils/gl';
import vertexShaderSource from './particleVertexshader.glsl';
import fragmentShaderSource from './particleFragmentshader.glsl';
import {Particles} from './Particles';

export interface ParticleGLState {
  shaderProgram: WebGLProgram;
  lonBuffer: WebGLBuffer;
  latBuffer: WebGLBuffer;
  colorBuffer: WebGLBuffer;
}

export function getGLStateForParticles(
  gl: WebGLRenderingContext,
): ParticleGLState {
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

  return {shaderProgram, lonBuffer, latBuffer, colorBuffer};
}

export function setViewport(
  gl: WebGLRenderingContext,
  glState: ParticleGLState,
) {
  const {shaderProgram} = glState;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  const aspectRatioLoc = gl.getUniformLocation(shaderProgram, 'aspectRatio');
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);
}

export function initColors(
  gl: WebGLRenderingContext,
  glState: ParticleGLState,
  colors: Float32Array,
) {
  const {shaderProgram, colorBuffer} = glState;
  gl.useProgram(shaderProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
}

export function drawParticles(
  gl: WebGLRenderingContext,
  glState: ParticleGLState,
  positions: Particles,
  centerCoord: Coord,
  zoomLevel: number,
) {
  const {shaderProgram, lonBuffer, latBuffer, colorBuffer} = glState;
  gl.useProgram(shaderProgram);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  const aspectRatioLoc = gl.getUniformLocation(shaderProgram, 'aspectRatio');
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);

  const zoomLevelLoc = gl.getUniformLocation(shaderProgram, 'zoomLevel');
  gl.uniform1f(zoomLevelLoc, zoomLevel);

  const midCoordLoc = gl.getUniformLocation(shaderProgram, 'midCoord');
  gl.uniform2f(midCoordLoc, centerCoord.lon, centerCoord.lat);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  const colorLoc = gl.getAttribLocation(shaderProgram, 'color');
  gl.enableVertexAttribArray(colorLoc);
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, lonBuffer);
  const lonLoc = gl.getAttribLocation(shaderProgram, 'lon');
  gl.enableVertexAttribArray(lonLoc);
  gl.vertexAttribPointer(lonLoc, 1, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, positions.lon, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, latBuffer);
  const latLoc = gl.getAttribLocation(shaderProgram, 'lat');
  gl.enableVertexAttribArray(latLoc);
  gl.vertexAttribPointer(latLoc, 1, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, positions.lat, gl.DYNAMIC_DRAW);

  gl.drawArrays(gl.POINTS, 0, positions.length);
}

export function setZoomLevel(
  gl: WebGLRenderingContext,
  glState: ParticleGLState,
  zoomLevel: number,
) {
  const {shaderProgram} = glState;
  const zoomLevelLoc = gl.getUniformLocation(shaderProgram, 'zoomLevel');
  gl.uniform1f(zoomLevelLoc, zoomLevel);
}

export function setCenterCoord(
  gl: WebGLRenderingContext,
  glState: ParticleGLState,
  centerCoord: Coord,
) {
  const {shaderProgram} = glState;
  const midCoordLoc = gl.getUniformLocation(shaderProgram, 'midCoord');
  gl.uniform2f(midCoordLoc, centerCoord.lon, centerCoord.lat);
}
