import {
  createProgramWithShaders,
  createTransformFeedbackSafe,
  createVertexArraySafe,
  getUniformLocationSafe,
} from '../../../../../utils/gl';
import {getNumberOfParticlesToDraw} from '../util';
import updateParticleFragmentShaderSource from './update.frag';
import updateParticleVertexShaderSource from './update.vert';

export interface UpdateState {
  gl: WebGL2RenderingContext;
  shaderProgram: WebGLProgram;
  vertexArray: WebGLVertexArrayObject;
  coordTransformFeedback: WebGLTransformFeedback;
  uTexture: WebGLTexture;
  vTexture: WebGLTexture;
  uTextureLoc: WebGLUniformLocation;
  vTextureLoc: WebGLUniformLocation;
  deltaTLoc: WebGLUniformLocation;
  resetPositionsLoc: WebGLUniformLocation;
}

export function getParticleUpdateProgramState(
  gl: WebGL2RenderingContext,
  uTexture: WebGLTexture,
  vTexture: WebGLTexture,
  readBuffer: WebGLBuffer,
  writeBuffer: WebGLBuffer,
): UpdateState {
  // Create program
  const shaderProgram = createProgramWithShaders(
    gl,
    updateParticleVertexShaderSource,
    updateParticleFragmentShaderSource,
    {varyings: ['coord'], bufferMode: gl.SEPARATE_ATTRIBS},
  );

  return {
    gl,
    shaderProgram,
    vertexArray: getParticleUpdateVertexArray(gl, shaderProgram, readBuffer),
    coordTransformFeedback: getParticleUpdateTransformFeedback(gl, writeBuffer),
    uTexture,
    vTexture,
    uTextureLoc: getUniformLocationSafe(gl, shaderProgram, 'uTexture'),
    vTextureLoc: getUniformLocationSafe(gl, shaderProgram, 'vTexture'),
    deltaTLoc: getUniformLocationSafe(gl, shaderProgram, 'deltaT'),
    resetPositionsLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'resetPositions',
    ),
  };
}

export function getParticleUpdateVertexArray(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram,
  coordBuffer: WebGLBuffer,
): WebGLVertexArrayObject {
  const coordInLoc = gl.getAttribLocation(shaderProgram, 'coordIn');

  const vertexArray = createVertexArraySafe(gl);
  gl.bindVertexArray(vertexArray);

  gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);

  gl.enableVertexAttribArray(coordInLoc);
  gl.vertexAttribPointer(coordInLoc, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindVertexArray(null);

  return vertexArray;
}

export function getParticleUpdateTransformFeedback(
  gl: WebGL2RenderingContext,
  coordBuffer: WebGLBuffer,
): WebGLTransformFeedback {
  const coordTransformFeedback = createTransformFeedbackSafe(gl);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, coordTransformFeedback);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, coordBuffer);
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  return coordTransformFeedback;
}

export function updateParticleBuffers(
  {
    gl,
    shaderProgram,
    vertexArray,
    coordTransformFeedback,
    deltaTLoc,
    uTexture,
    vTexture,
    uTextureLoc,
    vTextureLoc,
    resetPositionsLoc,
  }: UpdateState,
  deltaT: number,
  resetPositions: boolean,
) {
  gl.useProgram(shaderProgram);

  gl.bindVertexArray(vertexArray);

  // Set uniforms
  gl.uniform1f(deltaTLoc, deltaT);
  gl.uniform1i(resetPositionsLoc, resetPositions ? 1 : 0);

  // Bind wind uv textures
  gl.uniform1i(uTextureLoc, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, uTexture);
  gl.uniform1i(vTextureLoc, 2);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, vTexture);

  // Draw
  gl.enable(gl.RASTERIZER_DISCARD);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, coordTransformFeedback);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, getNumberOfParticlesToDraw(gl));
  gl.endTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  gl.disable(gl.RASTERIZER_DISCARD);
}
