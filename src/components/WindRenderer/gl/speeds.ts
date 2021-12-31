import {GlState} from '.';
import {Coord} from '../../../types';
import {
  createBufferSafe,
  createProgramWithShaders,
  createVertexArraySafe,
  getUniformLocationSafe,
} from '../../../utils/gl';
import speedFragmentShaderSource from './shaders/speed.frag';
import speedVertexShaderSource from './shaders/speed.vert';

export interface SpeedState {
  shaderProgram: WebGLProgram;
  vertexArray: WebGLVertexArrayObject;
  aspectRatioLoc: WebGLUniformLocation;
  midCoordLoc: WebGLUniformLocation;
  zoomLevelLoc: WebGLUniformLocation;
  uTextureLoc: WebGLUniformLocation;
  vTextureLoc: WebGLUniformLocation;
}

/**
 * Initialize GL for wind speed rendering, and return programs, buffers,
 * textures, and locations.
 */
export function getSpeedProgramState(gl: WebGL2RenderingContext): SpeedState {
  // Create program
  const shaderProgram = createProgramWithShaders(
    gl,
    speedVertexShaderSource,
    speedFragmentShaderSource,
  );

  // Set up vertices
  const vertexBuffer = createBufferSafe(gl);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // prettier-ignore
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    -1,  1,
     1,  1,
     1,  1,
     1, -1,
    -1, -1,
  ]), gl.STATIC_DRAW);
  const vertexArray = createVertexArraySafe(gl);
  gl.bindVertexArray(vertexArray);
  const vertexLoc = gl.getAttribLocation(shaderProgram, 'vertex');
  gl.enableVertexAttribArray(vertexLoc);
  gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  const uTextureLoc = getUniformLocationSafe(gl, shaderProgram, 'uTexture');
  const vTextureLoc = getUniformLocationSafe(gl, shaderProgram, 'vTexture');
  const aspectRatioLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'aspectRatio',
  );
  const zoomLevelLoc = getUniformLocationSafe(gl, shaderProgram, 'zoomLevel');
  const midCoordLoc = getUniformLocationSafe(gl, shaderProgram, 'midCoord');

  return {
    shaderProgram,
    vertexArray,
    uTextureLoc,
    vTextureLoc,
    aspectRatioLoc,
    zoomLevelLoc,
    midCoordLoc,
  };
}

export function drawSpeeds(
  glState: GlState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  const {
    gl,
    speedState: {
      shaderProgram,
      vertexArray,
      aspectRatioLoc,
      midCoordLoc,
      zoomLevelLoc,
      uTextureLoc,
      vTextureLoc,
    },
    uTexture,
    vTexture,
  } = glState;

  // Set viewport
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Set GL behavior
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  // Use program
  gl.useProgram(shaderProgram);

  // Set uniforms
  gl.uniform2f(midCoordLoc, centerCoord.lon, centerCoord.lat);
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);
  gl.uniform1f(zoomLevelLoc, zoomLevel);

  // Bind speed textures
  gl.uniform1i(uTextureLoc, 0);
  gl.uniform1i(vTextureLoc, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, uTexture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, vTexture);

  // Draw
  gl.bindVertexArray(vertexArray);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindVertexArray(null);

  // Reset set state
  gl.disable(gl.BLEND);
  gl.depthMask(true);
}
