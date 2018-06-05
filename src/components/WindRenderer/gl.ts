import {Coord} from '../../Types';
import {createProgramWithShaders, getUniformLocationSafe} from '../../utils/gl';
import speedVertexShaderSource from './speedVertexshader.glsl';
import speedFragmentShaderSource from './speedFragmentshader.glsl';
import drawParticleVertexShaderSource from './drawParticleVertexshader.glsl';
import drawParticleFragmentShaderSource from './drawParticleFragmentshader.glsl';
import updateParticleVertexShaderSource from './updateParticleVertexshader.glsl';
import updateParticleFragmentShaderSource from './updateParticleFragmentshader.glsl';

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
      vertexLoc: number;
      aspectRatioLoc: WebGLUniformLocation;
      midCoordLoc: WebGLUniformLocation;
      zoomLevelLoc: WebGLUniformLocation;
      positionTextureWidthLoc: WebGLUniformLocation;
      positionTextureHeightLoc: WebGLUniformLocation;
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
      positionTextureWidthLoc: WebGLUniformLocation;
      positionTextureHeightLoc: WebGLUniformLocation;
    };
    vertexBuffer: WebGLBuffer;
    particleCount: number;
    positionTexture: WebGLTexture;
  };
  uTexture: WebGLTexture;
  vTexture: WebGLTexture;
}

export function getGLState(
  gl: WebGLRenderingContext,
  particleCount: number,
): glState {
  const speedState = getSpeedProgramState(gl);
  const particleState = getParticleProgramState(gl, particleCount);

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

function getParticleProgramState(
  gl: WebGLRenderingContext,
  particleCount: number,
) {
  const drawState = getParticleDrawProgramState(gl);
  const updateState = getParticleUpdateProgramState(gl, particleCount);

  // Create particles vertices buffer
  const vertexBuffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(Array(particleCount).keys()),
    gl.STATIC_DRAW,
  );

  // Create position textures
  const positionTexture = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, positionTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.bindTexture(gl.TEXTURE_2D, positionTexture);

  const {width, height} = particleCountToTextureDimensions(particleCount);
  const positions = new Uint8Array(width * height * 4);
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
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    positions,
  );
  return {
    drawState,
    updateState,
    particleCount,
    vertexBuffer,
    positionTexture,
  };
}

function getParticleDrawProgramState(gl: WebGLRenderingContext) {
  // Create program
  const shaderProgram = createProgramWithShaders(
    gl,
    drawParticleVertexShaderSource,
    drawParticleFragmentShaderSource,
  );

  // Get locations
  const vertexLoc = gl.getAttribLocation(shaderProgram, 'vertex');
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
  const positionTextureWidthLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'positionTextureWidth',
  );
  const positionTextureHeightLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'positionTextureHeight',
  );

  return {
    shaderProgram,
    vertexLoc,
    positionTextureLoc,
    aspectRatioLoc,
    midCoordLoc,
    zoomLevelLoc,
    positionTextureWidthLoc,
    positionTextureHeightLoc,
  };
}

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
  const {width, height} = particleCountToTextureDimensions(particleCount);
  // prettier-ignore
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array(width * height * 4),
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
  const positionTextureWidthLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'positionTextureWidth',
  );
  const positionTextureHeightLoc = getUniformLocationSafe(
    gl,
    shaderProgram,
    'positionTextureHeight',
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
    positionTextureWidthLoc,
    positionTextureHeightLoc,
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
        vertexLoc,
        aspectRatioLoc,
        midCoordLoc,
        zoomLevelLoc,
        positionTextureWidthLoc,
        positionTextureHeightLoc,
      },
      particleCount,
      positionTexture,
      vertexBuffer,
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
  const {width, height} = particleCountToTextureDimensions(particleCount);
  gl.uniform1f(positionTextureWidthLoc, width);
  gl.uniform1f(positionTextureHeightLoc, height);

  // Bind vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(vertexLoc, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexLoc);

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

export function updateParticles(glState: glState, deltaT: number) {
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
        positionTextureWidthLoc,
        positionTextureHeightLoc,
        deltaTLoc,
        uTextureLoc,
        vTextureLoc,
      },
      positionTexture,
      particleCount,
      vertexBuffer,
    },
    uTexture,
    vTexture,
  } = glState;
  // Use framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

  // Set viewport
  const {width, height} = particleCountToTextureDimensions(particleCount);
  gl.viewport(0, 0, width, height);

  // Use program
  gl.useProgram(shaderProgram);

  // Set uniforms
  gl.uniform1f(deltaTLoc, deltaT);
  gl.uniform1f(positionTextureWidthLoc, width);
  gl.uniform1f(positionTextureHeightLoc, height);

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
  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, width, height, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function encodeCoordToRGBA(coord: Coord): number[] {
  // Encode lons to from range 0-360 to 0x0-0x10000
  const encodedLon = coord.lon * 0x10000 / 360;
  // Encode lats to from range -90-90 to 0x0-0x10000
  const encodedLat = (coord.lat + 90.0) * 0xffff / 180;

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
    width: size,
    height: size,
  };
}
