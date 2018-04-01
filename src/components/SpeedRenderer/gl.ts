import {Coord} from '../../Types';
import {loadShader} from '../../utils/gl';
import vertexShaderSource from './vertexshader.glsl';
import fragmentShaderSource from './fragmentshader.glsl';

export interface GLState {
  gl: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  tex: WebGLTexture;
}

export function getGLStateForSpeeds(gl: WebGLRenderingContext): GLState {
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

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  const tex = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  return {gl, shaderProgram, tex};
}

export function setViewport(glState: GLState) {
  const {gl, shaderProgram} = glState;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  const aspectRatioLoc = gl.getUniformLocation(shaderProgram, 'aspectRatio');
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);
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

export function draw(glState: GLState, texData: Uint8Array) {
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
