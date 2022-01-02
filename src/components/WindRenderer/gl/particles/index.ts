import {Coord} from '../../../../types';
import {createBufferSafe} from '../../../../utils/gl';
import {
  drawParticles as drawParticlesDraw,
  DrawState,
  getDrawParticlesToFrameBufferVertexArray,
  getParticleDrawProgramState,
} from './draw';
import {
  getParticleUpdateProgramState,
  getParticleUpdateTransformFeedback,
  getParticleUpdateVertexArray,
  updateParticleBuffers,
  UpdateState,
} from './update';
import {MAX_PARTICLE_COUNT} from './util';

export interface ParticleState {
  gl: WebGL2RenderingContext;
  drawState: DrawState;
  updateState: UpdateState;
  nextState: {
    drawVertexArray: WebGLVertexArrayObject;
    updateVertexArray: WebGLVertexArrayObject;
    updateTransformFeedback: WebGLTransformFeedback;
  };
}

export function getParticleProgramState(
  gl: WebGL2RenderingContext,
  uTexture: WebGLTexture,
  vTexture: WebGLTexture,
): ParticleState {
  const points = [];
  for (let i = 0; i < MAX_PARTICLE_COUNT; i++) {
    points.push(Math.random() * 359.9);
    points.push(Math.random() * 180 - 90);
  }

  const readBuffer = getParticleBuffer(gl, points);
  const writeBuffer = getParticleBuffer(gl, points);

  const drawState = getParticleDrawProgramState(gl, readBuffer);
  const updateState = getParticleUpdateProgramState(
    gl,
    uTexture,
    vTexture,
    readBuffer,
    writeBuffer,
  );

  return {
    gl,
    drawState,
    updateState,
    nextState: {
      drawVertexArray: getDrawParticlesToFrameBufferVertexArray(
        gl,
        drawState.drawParticlesToFrameBufferState.shaderProgram,
        writeBuffer,
      ),
      updateVertexArray: getParticleUpdateVertexArray(
        gl,
        updateState.shaderProgram,
        writeBuffer,
      ),
      updateTransformFeedback: getParticleUpdateTransformFeedback(
        gl,
        readBuffer,
      ),
    },
  };
}

function getParticleBuffer(
  gl: WebGL2RenderingContext,
  points: number[],
): WebGLBuffer {
  const buffer = createBufferSafe(gl);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buffer;
}

export function drawParticles(
  particleState: ParticleState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  drawParticlesDraw(particleState.drawState, centerCoord, zoomLevel);
}

export function updateParticles(
  particleState: ParticleState,
  deltaT: number,
  resetPositions: boolean,
) {
  updateParticleBuffers(particleState.updateState, deltaT, resetPositions);
  switchReadWriteBuffers(particleState);
}

function switchReadWriteBuffers(particleState: ParticleState): void {
  const nextParticlesState = {
    drawVertexArray:
      particleState.drawState.drawParticlesToFrameBufferState.vertexArray,
    updateVertexArray: particleState.updateState.vertexArray,
    updateTransformFeedback: particleState.updateState.coordTransformFeedback,
  };

  particleState.drawState.drawParticlesToFrameBufferState.vertexArray =
    particleState.nextState.drawVertexArray;
  particleState.updateState.vertexArray =
    particleState.nextState.updateVertexArray;
  particleState.updateState.coordTransformFeedback =
    particleState.nextState.updateTransformFeedback;

  particleState.nextState = nextParticlesState;
}
