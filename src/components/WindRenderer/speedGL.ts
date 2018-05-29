import {Coord} from '../../Types';
import {loadShader} from '../../utils/gl';
import vertexShaderSource from './speedVertexshader.glsl';
import fragmentShaderSource from './speedFragmentshader.glsl';

export interface SpeedGLState {
  shaderProgram: WebGLProgram;
  vertexBuffer: WebGLBuffer;
  tex: WebGLTexture;
}

export function getGLStateForSpeeds(gl: WebGLRenderingContext): SpeedGLState {
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
  const vertices = new Float32Array([
    -1, -1,
    -1,  1,
     1,  1,
     1,  1,
     1, -1,
    -1, -1,
  ]);

  const pointLoc = gl.getAttribLocation(shaderProgram, 'vertex');
  const vertexBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.enableVertexAttribArray(pointLoc);
  gl.vertexAttribPointer(pointLoc, 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  const tex = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  const aspectRatioLoc = gl.getUniformLocation(shaderProgram, 'aspectRatio');
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);

  return {shaderProgram, vertexBuffer, tex};
}

export function setViewport(gl: WebGLRenderingContext, glState: SpeedGLState) {
  const {shaderProgram} = glState;
  gl.useProgram(shaderProgram);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  const aspectRatioLoc = gl.getUniformLocation(shaderProgram, 'aspectRatio');
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);
}

export function setZoomLevel(
  gl: WebGLRenderingContext,
  glState: SpeedGLState,
  zoomLevel: number,
) {
  const {vertexBuffer, shaderProgram} = glState;
  gl.useProgram(shaderProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  const zoomLevelLoc = gl.getUniformLocation(shaderProgram, 'zoomLevel');
  gl.uniform1f(zoomLevelLoc, zoomLevel);
}

export function setCenterCoord(
  gl: WebGLRenderingContext,
  glState: SpeedGLState,
  centerCoord: Coord,
) {
  const {vertexBuffer, shaderProgram} = glState;
  gl.useProgram(shaderProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  const midCoordLoc = gl.getUniformLocation(shaderProgram, 'midCoord');
  gl.uniform2f(midCoordLoc, centerCoord.lon, centerCoord.lat);
}

export function updateWindTex(
  gl: WebGLRenderingContext,
  glState: SpeedGLState,
  texData: Uint8Array,
) {
  const {tex, vertexBuffer, shaderProgram} = glState;
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
}

export function draw(
  gl: WebGLRenderingContext,
  glState: SpeedGLState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  const {tex, vertexBuffer, shaderProgram} = glState;
  gl.useProgram(shaderProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  const vertexLoc = gl.getAttribLocation(shaderProgram, 'vertex');
  gl.enableVertexAttribArray(vertexLoc);
  gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
