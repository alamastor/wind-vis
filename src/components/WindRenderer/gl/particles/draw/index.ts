import {Coord} from '../../../../../types';
import {
  createProgramWithShaders,
  createVertexArraySafe,
  getUniformLocationSafe,
} from '../../../../../utils/gl';
import {getNumberOfParticlesToDraw, PARTICLE_FRAME_LIFETIME} from '../util';
import drawParticleFragmentShaderSource from './draw.frag';
import drawParticleVertexShaderSource from './draw.vert';

export interface DrawState {
  gl: WebGL2RenderingContext;
  shaderProgram: WebGLProgram;
  vertexArray: WebGLVertexArrayObject;
  zoomLevelLoc: WebGLUniformLocation;
  midCoordLoc: WebGLUniformLocation;
  canvasDimensionsLoc: WebGLUniformLocation;
  particleCountLoc: WebGLUniformLocation;
  particleFrameLifetimeLoc: WebGLUniformLocation;
  particleHeadIndexLoc: WebGLUniformLocation;
}
export function getDrawProgramState(
  gl: WebGL2RenderingContext,
  coordBuffer: WebGLBuffer,
): DrawState {
  const shaderProgram = createProgramWithShaders(
    gl,
    drawParticleVertexShaderSource,
    drawParticleFragmentShaderSource,
  );

  return {
    gl,
    shaderProgram,
    vertexArray: getDrawVertexArray(gl, shaderProgram, coordBuffer),
    zoomLevelLoc: getUniformLocationSafe(gl, shaderProgram, 'zoomLevel'),
    midCoordLoc: getUniformLocationSafe(gl, shaderProgram, 'centerCoord'),
    canvasDimensionsLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'canvasDimensions',
    ),
    particleCountLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'particleCount',
    ),
    particleFrameLifetimeLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'particleFrameLifetime',
    ),
    particleHeadIndexLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'particleHeadIndex',
    ),
  };
}

function getDrawVertexArray(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram,
  coordBuffer: WebGLBuffer,
) {
  const vertexArray = createVertexArraySafe(gl);
  gl.bindVertexArray(vertexArray);

  const coordLoc = gl.getAttribLocation(shaderProgram, 'coord');
  gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
  gl.enableVertexAttribArray(coordLoc);
  gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return vertexArray;
}

export function drawParticles(
  {
    gl,
    shaderProgram,
    vertexArray,
    zoomLevelLoc,
    midCoordLoc,
    canvasDimensionsLoc,
    particleCountLoc,
    particleFrameLifetimeLoc,
    particleHeadIndexLoc,
  }: DrawState,
  centerCoord: Coord,
  zoomLevel: number,
  particleHeadIndex: number,
) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Set GL behavior
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  // Use program
  gl.useProgram(shaderProgram);

  // Set uniforms
  gl.uniform1f(zoomLevelLoc, zoomLevel);
  gl.uniform2f(midCoordLoc, centerCoord.lon, centerCoord.lat);
  gl.uniform2f(canvasDimensionsLoc, gl.canvas.width, gl.canvas.height);
  gl.uniform1ui(particleCountLoc, getNumberOfParticlesToDraw(gl));
  gl.uniform1ui(particleFrameLifetimeLoc, PARTICLE_FRAME_LIFETIME);
  gl.uniform1ui(particleHeadIndexLoc, particleHeadIndex);

  // Draw
  gl.bindVertexArray(vertexArray);
  // Only draw enough particles to meet particle density requirements
  gl.drawArrays(
    gl.POINTS,
    0,
    getNumberOfParticlesToDraw(gl) * PARTICLE_FRAME_LIFETIME,
  );
  gl.bindVertexArray(null);

  // Reset state
  gl.disable(gl.BLEND);
  gl.depthMask(true);
}
