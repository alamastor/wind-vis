import {GlState} from '.';
import {Coord} from '../../../types';
import {
  createProgramWithShaders,
  getUniformLocationSafe,
} from '../../../utils/gl';
import drawParticleFragmentShaderSource from './shaders/draw_particle.frag';
import drawParticleVertexShaderSource from './shaders/draw_particle.vert';
import drawParticleTextureFragmentShaderSource from './shaders/draw_particle_texture.frag';
import drawParticleTextureVertexShaderSource from './shaders/draw_particle_texture.vert';
import updateParticleFragmentShaderSource from './shaders/update_particle.frag';
import updateParticleVertexShaderSource from './shaders/update_particle.vert';

const FRAMEBUFFER_COUNT = 50;
const PARTICLE_DENSITY = 0.01; // Particles per square pixel
// Number of particles to be stored in texture, displayed particles will
// be subset of this.
const PARTICLE_COUNT = 1000000;
/**
 * Initialize GL for particle rendering, and return programs, buffers,
 * textures, and locations.
 */
export function getParticleProgramState(gl: WebGL2RenderingContext) {
  // Unfortunately WebGL 1.0 does not allow updating of vertex buffers
  // in the shaders, so instead positions will be encoded in textures
  // which can be updated by drawing to a frame buffer.

  // Get child state
  const drawState = getParticleDrawProgramState(gl);
  const updateState = getParticleUpdateProgramState(gl);

  // Get dimensions of position texture
  const {textureWidth, textureHeight} =
    particleCountToTextureDimensions(PARTICLE_COUNT);

  // Create particles vertices buffer. These just contain the vertex's
  // own index for doing textures lookups.
  const positionTextureCoords = new Float32Array(PARTICLE_COUNT * 2);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (i % textureWidth) / (textureWidth - 1);
    const y = Math.floor(i / textureWidth) / (textureHeight - 1);
    positionTextureCoords[i * 2] = x;
    positionTextureCoords[i * 2 + 1] = y;
  }
  const positionTextureCoordBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positionTextureCoords, gl.STATIC_DRAW);

  // Create position texture
  const positionTexture = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, positionTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  const positions = new Uint8Array(textureWidth * textureHeight * 4);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const lon = Math.random() * 359.9;
    const lat = Math.random() * 180 - 90;
    const encoded = encodeCoordToRGBA({lon, lat});
    positions[i * 4] = encoded[0];
    positions[i * 4 + 1] = encoded[1];
    positions[i * 4 + 2] = encoded[2];
    positions[i * 4 + 3] = encoded[3];
  }
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    textureWidth,
    textureHeight,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    positions,
  );

  gl.bindTexture(gl.TEXTURE_2D, null);

  return {
    drawState,
    updateState,
    positionTextureCoordBuffer,
    positionTexture,
  };
}

/**
 * Initialize GL for particle drawing, and return programs, buffers,
 * textures, and locations.
 */
function getParticleDrawProgramState(gl: WebGL2RenderingContext) {
  return {
    frameBuffers: getFrameBuffers(gl),
    drawParticlesToFrameBufferState:
      getDrawParticlesToFrameBufferProgramState(gl),
    drawFrameBufferState: getDrawFrameBufferProgramState(gl),
  };
}

function getFrameBuffers(gl: WebGL2RenderingContext) {
  const frameBuffers: {
    frameBuffer: WebGLFramebuffer;
    texture: WebGLTexture;
    centerCoord: Coord;
    zoomLevel: number;
    screenWidth: number;
    screenHeight: number;
  }[] = [];

  for (let i = 0; i < FRAMEBUFFER_COUNT; i++) {
    frameBuffers.push(getParticleRenderFrameBufferObject(gl));
  }

  return frameBuffers;
}

function getDrawParticlesToFrameBufferProgramState(gl: WebGL2RenderingContext) {
  // Create program
  const shaderProgram = createProgramWithShaders(
    gl,
    drawParticleVertexShaderSource,
    drawParticleFragmentShaderSource,
  );

  // Get locations
  const positionTextureCoordLoc = gl.getAttribLocation(
    shaderProgram,
    'positionTextureCoord',
  );
  const positionTextureLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'positionTexture',
  );
  const zoomLevelLoc = getUniformLocationSafe(gl, shaderProgram, 'zoomLevel');
  const midCoordLoc = getUniformLocationSafe(gl, shaderProgram, 'centerCoord');
  const canvasDimensionsLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'canvasDimensions',
  );

  return {
    shaderProgram,
    positionTextureCoordLoc,
    positionTextureLoc,
    zoomLevelLoc,
    midCoordLoc,
    canvasDimensionsLoc,
  };
}

function getDrawFrameBufferProgramState(gl: WebGL2RenderingContext) {
  // Create program
  const shaderProgram = createProgramWithShaders(
    gl,
    drawParticleTextureVertexShaderSource,
    drawParticleTextureFragmentShaderSource,
  );

  // Set up vertices
  const vertexBuffer = gl.createBuffer() as WebGLBuffer;
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

  // Get locations
  const vertexLoc = gl.getAttribLocation(shaderProgram, 'vertex');
  const textureLoc = getUniformLocationSafe(gl, shaderProgram, 'texture');
  const alphaLoc = getUniformLocationSafe(gl, shaderProgram, 'alpha');
  const currentDimensionsLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'currentDimensions',
  );
  const textureDimensionsLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'textureDimensions',
  );
  const textureZoomLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'textureZoom',
  );
  const currentZoomLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'currentZoom',
  );
  const textureCenterCoordLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'textureCenterCoord',
  );
  const currentCenterCoordLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'currentCenterCoord',
  );

  return {
    shaderProgram,
    vertexBuffer,
    vertexLoc,
    textureLoc,
    alphaLoc,
    currentDimensionsLoc,
    textureDimensionsLoc,
    textureZoomLoc,
    currentZoomLoc,
    textureCenterCoordLoc,
    currentCenterCoordLoc,
  };
}

/**
 * Initialize GL for particle updating, and return programs, buffers,
 * textures, and locations.
 */
function getParticleUpdateProgramState(gl: WebGL2RenderingContext) {
  // Create program
  const shaderProgram = createProgramWithShaders(
    gl,
    updateParticleVertexShaderSource,
    updateParticleFragmentShaderSource,
  );

  // Create texture for frame buffer
  const frameBufferTexture = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, frameBufferTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.bindTexture(gl.TEXTURE_2D, frameBufferTexture);
  const {textureWidth, textureHeight} =
    particleCountToTextureDimensions(PARTICLE_COUNT);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    textureWidth,
    textureHeight,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array(textureWidth * textureHeight * 4),
  );
  // Create frame buffer
  const frameBuffer = gl.createFramebuffer();
  if (frameBuffer == null) {
    throw new Error('failed to create frameBuffer');
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    frameBufferTexture,
    0,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // Set up vertices
  const frameBufferVertexBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, frameBufferVertexBuffer);
  // prettier-ignore
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    -1,  1,
     1,  1,
     1,  1,
     1, -1,
    -1, -1,
  ]), gl.STATIC_DRAW);

  // Get locations
  const frameBufferVertexLoc = gl.getAttribLocation(shaderProgram, 'vertex');
  const positionTextureLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'positionTexture',
  );
  const deltaTLoc = getUniformLocationSafe(gl, shaderProgram, 'deltaT');
  const uTextureLoc = getUniformLocationSafe(gl, shaderProgram, 'uTexture');
  const vTextureLoc = getUniformLocationSafe(gl, shaderProgram, 'vTexture');
  const positionTextureDimensionsLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'positionTextureDimensions',
  );
  const resetPositionsLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'resetPositions',
  );

  return {
    shaderProgram,
    frameBuffer,
    frameBufferVertexBuffer,
    frameBufferVertexLoc,
    positionTextureLoc,
    deltaTLoc,
    uTextureLoc,
    vTextureLoc,
    positionTextureDimensionsLoc,
    resetPositionsLoc,
  };
}

export function drawParticles(
  glState: GlState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  drawParticlesToFrameBuffer(glState, centerCoord, zoomLevel);
  drawFrameBuffers(glState, centerCoord, zoomLevel);
}

function drawParticlesToFrameBuffer(
  glState: GlState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  const {
    gl,
    particleState: {
      drawState: {
        frameBuffers,
        drawParticlesToFrameBufferState: {
          shaderProgram,
          positionTextureLoc,
          positionTextureCoordLoc,
          zoomLevelLoc,
          midCoordLoc,
          canvasDimensionsLoc,
        },
      },
      positionTexture,
      positionTextureCoordBuffer,
    },
  } = glState;

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

  // Bind vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, positionTextureCoordBuffer);
  gl.vertexAttribPointer(positionTextureCoordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionTextureCoordLoc);

  // Bind position texture
  gl.uniform1i(positionTextureLoc, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, positionTexture);

  // Draw
  // Only draw enough particles to meet particle density requirements
  const particlesToDraw = Math.min(
    PARTICLE_DENSITY * gl.canvas.width * gl.canvas.height,
    PARTICLE_COUNT,
  );
  gl.drawArrays(gl.POINTS, 0, particlesToDraw);

  // Unbind frame buffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // Reset set state
  gl.disable(gl.BLEND);
  gl.depthMask(true);
}

function drawFrameBuffers(
  glState: GlState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  const {
    gl,
    particleState: {
      drawState: {
        frameBuffers,
        drawFrameBufferState: {
          shaderProgram,
          vertexBuffer,
          vertexLoc,
          textureLoc,
          alphaLoc,
          textureDimensionsLoc,
          currentDimensionsLoc,
          textureZoomLoc,
          currentZoomLoc,
          textureCenterCoordLoc,
          currentCenterCoordLoc,
        },
      },
    },
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
  gl.uniform2f(currentDimensionsLoc, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(currentZoomLoc, zoomLevel);
  gl.uniform2f(currentCenterCoordLoc, centerCoord.lon, centerCoord.lat);

  // Bind vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexLoc);

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
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });
  // Reset state
  gl.disable(gl.BLEND);
  gl.depthMask(true);
}

export function updateParticles(
  glState: GlState,
  deltaT: number,
  resetPositions: boolean,
) {
  const {
    gl,
    particleState: {
      updateState: {
        shaderProgram,
        frameBuffer,
        frameBufferVertexBuffer,
        frameBufferVertexLoc,
        positionTextureLoc,
        positionTextureDimensionsLoc,
        deltaTLoc,
        uTextureLoc,
        vTextureLoc,
        resetPositionsLoc,
      },
      positionTexture,
    },
    uTexture,
    vTexture,
  } = glState;
  // Use framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

  // Set viewport
  const {textureWidth, textureHeight} =
    particleCountToTextureDimensions(PARTICLE_COUNT);
  gl.viewport(0, 0, textureWidth, textureHeight);

  // Use program
  gl.useProgram(shaderProgram);

  // Set uniforms
  gl.uniform1f(deltaTLoc, deltaT);
  gl.uniform2f(positionTextureDimensionsLoc, textureWidth, textureHeight);
  gl.uniform1i(resetPositionsLoc, resetPositions ? 1 : 0);

  // Bind position texture
  gl.uniform1i(positionTextureLoc, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, positionTexture);

  // Bind wind uv textures
  gl.uniform1i(uTextureLoc, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, uTexture);
  gl.uniform1i(vTextureLoc, 2);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, vTexture);

  // Bind vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, frameBufferVertexBuffer);
  gl.vertexAttribPointer(frameBufferVertexLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(frameBufferVertexLoc);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.bindTexture(gl.TEXTURE_2D, positionTexture);
  gl.copyTexImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    0,
    0,
    textureWidth,
    textureHeight,
    0,
  );
  // Unbind frame buffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function encodeCoordToRGBA(coord: Coord): number[] {
  // Encode lons to from range 0-360 to 0x0-0x10000
  const encodedLon = (coord.lon * 0x10000) / 360;
  // Encode lats to from range -90-90 to 0x0-0x10000
  const encodedLat = ((coord.lat + 90.0) * 0xffff) / 180;

  // Get upper and lower bytes from encoded values and convert to 0-1 range in vec4
  const lonUByte = Math.floor(encodedLon / 0x100);
  const lonLByte = ((encodedLon / 0x100) % 1) * 0x100;
  const latUByte = Math.floor(encodedLat / 0x100);
  const latLByte = ((encodedLat / 0x100) % 1) * 0x100;
  return [lonUByte, lonLByte, latUByte, latLByte];
}

function particleCountToTextureDimensions(particleCount: number) {
  const size = Math.ceil(Math.sqrt(particleCount));
  return {
    textureWidth: size,
    textureHeight: size,
  };
}

function getParticleRenderFrameBufferObject(gl: WebGL2RenderingContext) {
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
