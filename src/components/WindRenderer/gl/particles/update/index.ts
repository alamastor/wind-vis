import {
  createProgramWithShaders,
  createTransformFeedbackSafe,
  createVertexArraySafe,
  getUniformLocationSafe,
} from '../../../../../utils/gl';
import {getNumberOfParticlesToDraw, PARTICLE_FRAME_LIFETIME} from '../util';
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
  particleFrameLifetimeLoc: WebGLUniformLocation;
}

export function getUpdateProgramState(
  gl: WebGL2RenderingContext,
  uTexture: WebGLTexture,
  vTexture: WebGLTexture,
  coordReadBuffer: WebGLBuffer,
  coordWriteBuffer: WebGLBuffer,
  ageReadBuffer: WebGLBuffer,
  ageWriteBuffer: WebGLBuffer,
): UpdateState {
  const shaderProgram = createProgramWithShaders(
    gl,
    updateParticleVertexShaderSource,
    updateParticleFragmentShaderSource,
    {
      varyings: ['coord', 'age'],
      bufferMode: gl.SEPARATE_ATTRIBS,
    },
  );

  return {
    gl,
    shaderProgram,
    vertexArray: getUpdateVertexArray(
      gl,
      shaderProgram,
      coordReadBuffer,
      ageReadBuffer,
    ),
    coordTransformFeedback: getUpdateTransformFeedback(
      gl,
      coordWriteBuffer,
      ageWriteBuffer,
    ),
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
    particleFrameLifetimeLoc: getUniformLocationSafe(
      gl,
      shaderProgram,
      'particleFrameLifetime',
    ),
  };
}

export function getUpdateVertexArray(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram,
  coordBuffer: WebGLBuffer,
  ageBuffer: WebGLBuffer,
): WebGLVertexArrayObject {
  const vertexArray = createVertexArraySafe(gl);
  gl.bindVertexArray(vertexArray);

  const coordInLoc = gl.getAttribLocation(shaderProgram, 'coordIn');
  gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
  gl.enableVertexAttribArray(coordInLoc);
  gl.vertexAttribPointer(coordInLoc, 2, gl.FLOAT, false, 0, 0);

  const ageInLoc = gl.getAttribLocation(shaderProgram, 'ageIn');
  gl.bindBuffer(gl.ARRAY_BUFFER, ageBuffer);
  gl.enableVertexAttribArray(ageInLoc);
  gl.vertexAttribIPointer(ageInLoc, 1, gl.UNSIGNED_INT, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindVertexArray(null);

  return vertexArray;
}

export function getUpdateTransformFeedback(
  gl: WebGL2RenderingContext,
  coordBuffer: WebGLBuffer,
  ageBuffer: WebGLBuffer,
): WebGLTransformFeedback {
  const transformFeedback = createTransformFeedbackSafe(gl);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, coordBuffer);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, ageBuffer);

  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  return transformFeedback;
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
    particleFrameLifetimeLoc,
  }: UpdateState,
  deltaT: number,
  resetPositions: boolean,
) {
  gl.useProgram(shaderProgram);

  gl.bindVertexArray(vertexArray);

  // Set uniforms
  gl.uniform1f(deltaTLoc, deltaT);
  gl.uniform1i(resetPositionsLoc, resetPositions ? 1 : 0);
  gl.uniform1ui(particleFrameLifetimeLoc, PARTICLE_FRAME_LIFETIME);

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
  gl.drawArrays(
    gl.POINTS,
    0,
    getNumberOfParticlesToDraw(gl) * PARTICLE_FRAME_LIFETIME,
  );
  gl.endTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  gl.disable(gl.RASTERIZER_DISCARD);
}
