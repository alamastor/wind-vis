import {Coord} from '../../../../../types';
import {
  createBufferSafe,
  createProgramWithShaders,
  createVertexArraySafe,
  getUniformLocationSafe,
} from '../../../../../utils/gl';
import {getNumberOfParticlesToDraw} from '../util';
import drawParticleFragmentShaderSource from './draw.frag';
import drawParticleVertexShaderSource from './draw.vert';
import drawParticleTextureFragmentShaderSource from './draw_texture.frag';
import drawParticleTextureVertexShaderSource from './draw_texture.vert';

const FRAMEBUFFER_COUNT = 50;

export interface DrawState {
  gl: WebGL2RenderingContext;
  frameBuffers: ParticleDrawFrameBuffer[];
  drawParticlesToFrameBufferState: DrawParticlesToFrameBufferState;
  drawFrameBufferState: DrawFrameBufferState;
}
export function getParticleDrawProgramState(
  gl: WebGL2RenderingContext,
  readBuffer: WebGLBuffer,
): DrawState {
  return {
    gl,
    frameBuffers: getFrameBuffers(gl),
    drawParticlesToFrameBufferState: getDrawParticlesToFrameBufferProgramState(
      gl,
      readBuffer,
    ),
    drawFrameBufferState: getDrawFrameBufferProgramState(gl),
  };
}

interface DrawParticlesToFrameBufferState {
  shaderProgram: WebGLProgram;
  vertexArray: WebGLVertexArrayObject;
  zoomLevelLoc: WebGLUniformLocation;
  midCoordLoc: WebGLUniformLocation;
  canvasDimensionsLoc: WebGLUniformLocation;
}
function getDrawParticlesToFrameBufferProgramState(
  gl: WebGL2RenderingContext,
  particleBuffer: WebGLBuffer,
): DrawParticlesToFrameBufferState {
  const shaderProgram = createProgramWithShaders(
    gl,
    drawParticleVertexShaderSource,
    drawParticleFragmentShaderSource,
  );

  return {
    shaderProgram,
    vertexArray: getDrawParticlesToFrameBufferVertexArray(
      gl,
      shaderProgram,
      particleBuffer,
    ),
    zoomLevelLoc: getUniformLocationSafe(gl, shaderProgram, 'zoomLevel'),
    midCoordLoc: getUniformLocationSafe(gl, shaderProgram, 'centerCoord'),
    canvasDimensionsLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'canvasDimensions',
    ),
  };
}

interface DrawFrameBufferState {
  shaderProgram: WebGLProgram;
  vertexArray: WebGLVertexArrayObject;
  textureLoc: WebGLUniformLocation;
  alphaLoc: WebGLUniformLocation;
  currentDimensionsLoc: WebGLUniformLocation;
  textureDimensionsLoc: WebGLUniformLocation;
  textureZoomLoc: WebGLUniformLocation;
  currentZoomLoc: WebGLUniformLocation;
  textureCenterCoordLoc: WebGLUniformLocation;
  currentCenterCoordLoc: WebGLUniformLocation;
}
function getDrawFrameBufferProgramState(
  gl: WebGL2RenderingContext,
): DrawFrameBufferState {
  // Create program
  const shaderProgram = createProgramWithShaders(
    gl,
    drawParticleTextureVertexShaderSource,
    drawParticleTextureFragmentShaderSource,
  );

  // Set up vertices
  return {
    shaderProgram,
    vertexArray: getDrawFrameBufferVertexArray(gl, shaderProgram),
    textureLoc: getUniformLocationSafe(gl, shaderProgram, 'textureData'),
    alphaLoc: getUniformLocationSafe(gl, shaderProgram, 'alpha'),
    currentDimensionsLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'currentDimensions',
    ),
    textureDimensionsLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'textureDimensions',
    ),
    textureZoomLoc: getUniformLocationSafe(gl, shaderProgram, 'textureZoom'),
    currentZoomLoc: getUniformLocationSafe(gl, shaderProgram, 'currentZoom'),
    textureCenterCoordLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'textureCenterCoord',
    ),
    currentCenterCoordLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'currentCenterCoord',
    ),
  };
}

function getDrawFrameBufferVertexArray(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram,
): WebGLVertexArrayObject {
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
  return vertexArray;
}

export function getDrawParticlesToFrameBufferVertexArray(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram,
  particleBuffer: WebGLBuffer,
) {
  const coordLoc = gl.getAttribLocation(shaderProgram, 'coord');

  gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);

  const vertexArray = createVertexArraySafe(gl);
  gl.bindVertexArray(vertexArray);
  gl.enableVertexAttribArray(coordLoc);
  gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return vertexArray;
}

interface ParticleDrawFrameBuffer {
  frameBuffer: WebGLFramebuffer;
  texture: WebGLTexture;
  centerCoord: Coord;
  zoomLevel: number;
  screenWidth: number;
  screenHeight: number;
}
function getFrameBuffers(
  gl: WebGL2RenderingContext,
): ParticleDrawFrameBuffer[] {
  const frameBuffers = [];

  for (let i = 0; i < FRAMEBUFFER_COUNT; i++) {
    frameBuffers.push(getParticleRenderFrameBufferObject(gl));
  }

  return frameBuffers;
}

function getParticleRenderFrameBufferObject(
  gl: WebGL2RenderingContext,
): ParticleDrawFrameBuffer {
  const texture = getParticleRenderTexture(gl);

  const frameBuffer = gl.createFramebuffer();
  if (frameBuffer == null) {
    throw new Error('failed to create frameBuffer');
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return {
    frameBuffer,
    texture,
    centerCoord: {lon: 180, lat: 0},
    zoomLevel: 1,
    screenWidth: gl.canvas.width,
    screenHeight: gl.canvas.height,
  };
}

export function drawParticles(
  particleState: DrawState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  drawParticlesToFrameBuffer(particleState, centerCoord, zoomLevel);
  drawFrameBuffers(particleState, centerCoord, zoomLevel);
}

function drawParticlesToFrameBuffer(
  {
    gl,
    frameBuffers,
    drawParticlesToFrameBufferState: {
      shaderProgram,
      vertexArray,
      zoomLevelLoc,
      midCoordLoc,
      canvasDimensionsLoc,
    },
  }: DrawState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  // Get next frame buffer
  const frameBufferGroup = frameBuffers.shift();
  if (frameBufferGroup != null) {
    frameBufferGroup.centerCoord = centerCoord;
    frameBufferGroup.zoomLevel = zoomLevel;

    // Render to frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferGroup.frameBuffer);

    // If window is resized a new texture will need to be created and used.
    if (
      frameBufferGroup.screenWidth !== gl.canvas.width ||
      frameBufferGroup.screenHeight !== gl.canvas.height
    ) {
      const texture = getParticleRenderTexture(gl);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      frameBufferGroup.screenWidth = gl.canvas.width;
      frameBufferGroup.screenHeight = gl.canvas.height;
      gl.deleteTexture(frameBufferGroup.texture);
      frameBufferGroup.texture = texture;
    }
    frameBuffers.push(frameBufferGroup);
  }

  // Set viewport
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Set GL behavior
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Use program
  gl.useProgram(shaderProgram);

  // Set uniforms
  gl.uniform1f(zoomLevelLoc, zoomLevel);
  gl.uniform2f(midCoordLoc, centerCoord.lon, centerCoord.lat);
  gl.uniform2f(canvasDimensionsLoc, gl.canvas.width, gl.canvas.height);

  // Draw
  gl.bindVertexArray(vertexArray);
  // Only draw enough particles to meet particle density requirements
  gl.drawArrays(gl.POINTS, 0, getNumberOfParticlesToDraw(gl));
  gl.bindVertexArray(null);

  // Unbind frame buffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // Reset set state
  gl.disable(gl.BLEND);
  gl.depthMask(true);
}

function getParticleRenderTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const texture = gl.createTexture();
  if (texture == null) {
    throw Error('Failed to create texture for particle rendering.');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.canvas.width,
    gl.canvas.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array(gl.canvas.width * gl.canvas.height * 4),
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

function drawFrameBuffers(
  {
    gl,
    frameBuffers,
    drawFrameBufferState: {
      shaderProgram,
      vertexArray,
      textureLoc,
      alphaLoc,
      textureDimensionsLoc,
      currentDimensionsLoc,
      textureZoomLoc,
      currentZoomLoc,
      textureCenterCoordLoc,
      currentCenterCoordLoc,
    },
  }: DrawState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  // Set viewport
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Set GL behavior
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  // Use program
  gl.useProgram(shaderProgram);

  // Set uniforms
  gl.uniform2f(currentDimensionsLoc, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(currentZoomLoc, zoomLevel);
  gl.uniform2f(currentCenterCoordLoc, centerCoord.lon, centerCoord.lat);

  // Render all textures
  frameBuffers.forEach((frameBufferGroup, idx, frameBuffers) => {
    // Set uniforms
    gl.uniform1f(alphaLoc, idx / frameBuffers.length);
    gl.uniform2f(
      textureDimensionsLoc,
      frameBufferGroup.screenWidth,
      frameBufferGroup.screenHeight,
    );
    gl.uniform1f(textureZoomLoc, frameBufferGroup.zoomLevel);
    gl.uniform2f(
      textureCenterCoordLoc,
      frameBufferGroup.centerCoord.lon,
      frameBufferGroup.centerCoord.lat,
    );

    // Bind textures
    gl.uniform1i(textureLoc, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frameBufferGroup.texture);

    // Draw
    gl.bindVertexArray(vertexArray);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  });
  // Reset state
  gl.disable(gl.BLEND);
  gl.depthMask(true);
}
