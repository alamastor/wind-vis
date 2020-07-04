import {Coord} from '../../types';
import {
  createProgramWithShaders,
  createBufferSafe,
  createVertexArraySafe,
  createTextureSafe,
  getUniformLocationSafe,
} from '../../utils/gl';
import vertexShader from './shaders/background_map.vert';
import fragmentShader from './shaders/background_map.frag';

export interface BackgroundMapGlState {
  gl: WebGL2RenderingContext;
  shaderProgram: WebGLProgram;
  vertexArray: WebGLVertexArrayObject;
  texture: WebGLTexture;
  aspectRatioLoc: WebGLUniformLocation;
  centerCoordLoc: WebGLUniformLocation;
  zoomLevelLoc: WebGLUniformLocation;
}

export function getGlState(gl: WebGL2RenderingContext): BackgroundMapGlState {
  const shaderProgram = createProgramWithShaders(
    gl,
    vertexShader,
    fragmentShader,
  );

  const vertexLoc = gl.getAttribLocation(shaderProgram, 'vertex');

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
  gl.enableVertexAttribArray(vertexLoc);
  gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);

  const texture = createTextureSafe(gl);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  const aspectRatioLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'aspectRatio',
  );
  const zoomLevelLoc = getUniformLocationSafe(gl, shaderProgram, 'zoomLevel');
  const centerCoordLoc = getUniformLocationSafe(gl, shaderProgram, 'midCoord');

  return {
    gl,
    shaderProgram,
    vertexArray,
    texture,
    aspectRatioLoc,
    zoomLevelLoc,
    centerCoordLoc,
  };
}

export function updateTexture(
  {gl, texture}: BackgroundMapGlState,
  image: HTMLImageElement,
) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  // Important to set mipmaps to prevent aliasing when images are down-scaled.
  gl.generateMipmap(gl.TEXTURE_2D);
}

export function render(
  {
    gl,
    shaderProgram,
    vertexArray,
    aspectRatioLoc,
    zoomLevelLoc,
    centerCoordLoc,
    texture,
  }: BackgroundMapGlState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(shaderProgram);
  gl.bindVertexArray(vertexArray);
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);
  gl.uniform1f(zoomLevelLoc, zoomLevel);
  gl.uniform2f(centerCoordLoc, centerCoord.lon, centerCoord.lat);

  gl.enable(gl.BLEND);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR,
  );

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
