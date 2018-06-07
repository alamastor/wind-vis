import {Coord} from '../../Types';
import {createProgramWithShaders, getUniformLocationSafe} from '../../utils/gl';
import speedVertexShaderSource from './shaders/speedVertexshader.glsl';
import speedFragmentShaderSource from './shaders/speedFragmentshader.glsl';
import drawParticleVertexShaderSource from './shaders/drawParticleVertexshader.glsl';
import drawParticleFragmentShaderSource from './shaders/drawParticleFragmentshader.glsl';
import updateParticleVertexShaderSource from './shaders/updateParticleVertexshader.glsl';
import updateParticleFragmentShaderSource from './shaders/updateParticleFragmentshader.glsl';

export interface glState {
  gl: WebGLRenderingContext;
  speedState: {
    shaderProgram: WebGLProgram;
    vertexBuffer: WebGLBuffer;
    vertexLoc: number;
    aspectRatioLoc: WebGLUniformLocation;
    midCoordLoc: WebGLUniformLocation;
    zoomLevelLoc: WebGLUniformLocation;
    uTextureLoc: WebGLUniformLocation;
    vTextureLoc: WebGLUniformLocation;
  };
  particleState: {
    drawState: {
      shaderProgram: WebGLProgram;
      positionTextureLoc: WebGLUniformLocation;
      positionTextureCoordLoc: number;
      aspectRatioLoc: WebGLUniformLocation;
      midCoordLoc: WebGLUniformLocation;
      zoomLevelLoc: WebGLUniformLocation;
    };
    updateState: {
      shaderProgram: WebGLProgram;
      frameBuffer: WebGLFramebuffer;
      positionTextureBackbufferTexture: WebGLTexture;
      frameBufferVertexBuffer: WebGLBuffer;
      frameBufferVertexLoc: number;
      positionTextureLoc: WebGLUniformLocation;
      deltaTLoc: WebGLUniformLocation;
      uTextureLoc: WebGLUniformLocation;
      vTextureLoc: WebGLUniformLocation;
      positionTextureDimensionsLoc: WebGLUniformLocation;
      resetPositionsLoc: WebGLUniformLocation;
    };
    positionTextureCoordBuffer: WebGLBuffer;
    particleCount: number;
    positionTexture: WebGLTexture;
  };
  uTexture: WebGLTexture;
  vTexture: WebGLTexture;
}

/**
 * Initialize GL and return programs, buffers, textures, and locations.
 */
export function getGLState(
  gl: WebGLRenderingContext,
  particleCount: number,
): glState {
  const speedState = getSpeedProgramState(gl);
  const particleState = getParticleProgramState(gl, particleCount);

  // Create and bind wind vector textures
  const uTexture = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, uTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  const vTexture = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, vTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  return {
    gl,
    speedState,
    particleState,
    uTexture,
    vTexture,
  };
}

/**
 * Initialize GL for wind speed rendering, and return programs, buffers,
 * textures, and locations.
 */
function getSpeedProgramState(gl: WebGLRenderingContext) {
  // Create program
  const shaderProgram = createProgramWithShaders(
    gl,
    speedVertexShaderSource,
    speedFragmentShaderSource,
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
    vertexBuffer,
    vertexLoc,
    uTextureLoc,
    vTextureLoc,
    aspectRatioLoc,
    zoomLevelLoc,
    midCoordLoc,
  };
}

/**
 * Initialize GL for particle rendering, and return programs, buffers,
 * textures, and locations.
 */
function getParticleProgramState(
  gl: WebGLRenderingContext,
  particleCount: number,
) {
  // Unfortunately WebGL 1.0 does not allow updating of vertex buffers
  // in the shaders, so instead positions will be encoded in textures
  // which can be updated by drawing to a frame buffer.

  // Get child state
  const drawState = getParticleDrawProgramState(gl);
  const updateState = getParticleUpdateProgramState(gl, particleCount);

  // Create particles vertices buffer. These just contain the vertex's
  // own index for doing textures lookups.
  const {textureWidth, textureHeight} = particleCountToTextureDimensions(
    particleCount,
  );
  const positionTextureCoords = new Float32Array(particleCount * 2);
  for (let i = 0; i < particleCount; i++) {
    const x = (i % textureWidth) / (textureWidth - 1);
    const y = Math.floor(i / textureWidth) / (textureHeight - 1);
    positionTextureCoords[i * 2] = x;
    positionTextureCoords[i * 2 + 1] = y;
  }
  const positionTextureCoordBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positionTextureCoords, gl.STATIC_DRAW);

  // Create position textures
  const positionTexture = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, positionTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.bindTexture(gl.TEXTURE_2D, positionTexture);

  const positions = new Uint8Array(textureWidth * textureHeight * 4);
  for (let i = 0; i < particleCount; i++) {
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
  return {
    drawState,
    updateState,
    particleCount,
    positionTextureCoordBuffer,
    positionTexture,
  };
}

/**
 * Initialize GL for particle drawing, and return programs, buffers,
 * textures, and locations.
 */
function getParticleDrawProgramState(gl: WebGLRenderingContext) {
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
  const aspectRatioLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'aspectRatio',
  );
  const midCoordLoc = getUniformLocationSafe(gl, shaderProgram, 'midCoord');
  const zoomLevelLoc = getUniformLocationSafe(gl, shaderProgram, 'zoomLevel');

  return {
    shaderProgram,
    positionTextureCoordLoc,
    positionTextureLoc,
    aspectRatioLoc,
    midCoordLoc,
    zoomLevelLoc,
  };
}

/**
 * Initialize GL for particle updating, and return programs, buffers,
 * textures, and locations.
 */
function getParticleUpdateProgramState(
  gl: WebGLRenderingContext,
  particleCount: number,
) {
  // Create program
  const shaderProgram = createProgramWithShaders(
    gl,
    updateParticleVertexShaderSource,
    updateParticleFragmentShaderSource,
  );

  // Create texture for framebuffer
  const positionTextureBackbufferTexture = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, positionTextureBackbufferTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.bindTexture(gl.TEXTURE_2D, positionTextureBackbufferTexture);
  const {textureWidth, textureHeight} = particleCountToTextureDimensions(
    particleCount,
  );
  // prettier-ignore
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
    positionTextureBackbufferTexture,
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
    positionTextureBackbufferTexture,
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

export function updateWindTex(
  glState: glState,
  uData: Uint8Array,
  vData: Uint8Array,
) {
  const {gl, uTexture, vTexture} = glState;
  gl.bindTexture(gl.TEXTURE_2D, uTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    512,
    512,
    0,
    gl.LUMINANCE,
    gl.UNSIGNED_BYTE,
    uData,
  );

  gl.bindTexture(gl.TEXTURE_2D, vTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    512,
    512,
    0,
    gl.LUMINANCE,
    gl.UNSIGNED_BYTE,
    vData,
  );
}

export function drawSpeeds(
  glState: glState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  const {
    gl,
    speedState: {
      shaderProgram,
      vertexBuffer,
      vertexLoc,
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
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);
  gl.uniform2f(midCoordLoc, centerCoord.lon, centerCoord.lat);
  gl.uniform1f(zoomLevelLoc, zoomLevel);

  // Bind speed vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexLoc);

  // Bind speed textures
  gl.uniform1i(uTextureLoc, 0);
  gl.uniform1i(vTextureLoc, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, uTexture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, vTexture);

  // Draw
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Reset set state
  gl.disable(gl.BLEND);
  gl.depthMask(true);
}

export function drawParticles(
  glState: glState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  const {
    gl,
    particleState: {
      drawState: {
        shaderProgram,
        positionTextureLoc,
        positionTextureCoordLoc,
        aspectRatioLoc,
        midCoordLoc,
        zoomLevelLoc,
      },
      particleCount,
      positionTexture,
      positionTextureCoordBuffer,
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
  gl.uniform1f(aspectRatioLoc, gl.canvas.width / gl.canvas.height);
  gl.uniform2f(midCoordLoc, centerCoord.lon, centerCoord.lat);
  gl.uniform1f(zoomLevelLoc, zoomLevel);

  // Bind vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, positionTextureCoordBuffer);
  gl.vertexAttribPointer(positionTextureCoordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionTextureCoordLoc);

  // Bind position texture
  gl.uniform1i(positionTextureLoc, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, positionTexture);

  // Draw
  gl.drawArrays(gl.POINTS, 0, particleCount);

  // Reset set state
  gl.disable(gl.BLEND);
  gl.depthMask(true);
}

export function updateParticles(
  glState: glState,
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
        positionTextureBackbufferTexture,
        positionTextureLoc,
        positionTextureDimensionsLoc,
        deltaTLoc,
        uTextureLoc,
        vTextureLoc,
        resetPositionsLoc,
      },
      positionTexture,
      particleCount,
      positionTextureCoordBuffer,
    },
    uTexture,
    vTexture,
  } = glState;
  // Use framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

  // Set viewport
  const {textureWidth, textureHeight} = particleCountToTextureDimensions(
    particleCount,
  );
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
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function encodeCoordToRGBA(coord: Coord): number[] {
  // Encode lons to from range 0-360 to 0x0-0x10000
  const encodedLon = (coord.lon * 0x10000) / 360;
  // Encode lats to from range -90-90 to 0x0-0x10000
  const encodedLat = ((coord.lat + 90.0) * 0xffff) / 180;

  // Get upper and lower bytes from encoded values and conver to 0-1 range in vec4
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
