import {Coord} from '../../../../types';
import {createBufferSafe} from '../../../../utils/gl';
import {
  drawParticles as drawParticlesDraw,
  DrawState,
  getDrawProgramState,
  getDrawVertexArray,
} from './draw';
import {
  getUpdateProgramState,
  getUpdateTransformFeedback,
  getUpdateVertexArray,
  updateParticleBuffers,
  UpdateState,
} from './update';
import {MAX_PARTICLE_COUNT, PARTICLE_FRAME_LIFETIME} from './util';

export interface ParticleState {
  gl: WebGL2RenderingContext;
  drawState: DrawState;
  updateState: UpdateState;
  nextState: {
    drawVertexArray: WebGLVertexArrayObject;
    updateVertexArray: WebGLVertexArrayObject;
    updateTransformFeedback: WebGLTransformFeedback;
  };
  buffers: {
    ageRead: WebGLBuffer;
    ageWrite: WebGLBuffer;
    coordRead: WebGLBuffer;
    coordWrite: WebGLBuffer;
  };
}

export function getParticleProgramState(
  gl: WebGL2RenderingContext,
  uTexture: WebGLTexture,
  vTexture: WebGLTexture,
): ParticleState {
  const points = [];
  for (let i = 0; i < MAX_PARTICLE_COUNT; i++) {
    let lon = Math.random() * 359.9;
    let lat = Math.random() * 180 - 90;
    for (let j = 0; j < PARTICLE_FRAME_LIFETIME; j++) {
      points.push(lon);
      points.push(lat);
    }
  }

  const coordReadBuffer = getCoordBuffer(gl, points);
  const ageReadBuffer = getUintBuffer(gl);
  const coordWriteBuffer = getCoordBuffer(gl, points);
  const ageWriteBuffer = getUintBuffer(gl);

  const drawState = getDrawProgramState(gl, coordReadBuffer, ageReadBuffer);
  const updateState = getUpdateProgramState(
    gl,
    uTexture,
    vTexture,
    coordReadBuffer,
    coordWriteBuffer,
    ageReadBuffer,
    ageWriteBuffer,
  );

  return {
    gl,
    drawState,
    updateState,
    nextState: {
      drawVertexArray: getDrawVertexArray(
        gl,
        drawState.shaderProgram,
        coordWriteBuffer,
        ageWriteBuffer,
      ),
      updateVertexArray: getUpdateVertexArray(
        gl,
        updateState.shaderProgram,
        coordWriteBuffer,
        ageWriteBuffer,
      ),
      updateTransformFeedback: getUpdateTransformFeedback(
        gl,
        coordReadBuffer,
        ageReadBuffer,
      ),
    },
    buffers: {
      ageRead: ageReadBuffer,
      ageWrite: ageWriteBuffer,
      coordRead: coordReadBuffer,
      coordWrite: coordWriteBuffer,
    },
  };
}

function getCoordBuffer(
  gl: WebGL2RenderingContext,
  points: number[],
): WebGLBuffer {
  const buffer = createBufferSafe(gl);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buffer;
}

function getUintBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
  const buffer = createBufferSafe(gl);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Uint32Array(PARTICLE_FRAME_LIFETIME * MAX_PARTICLE_COUNT),
    gl.DYNAMIC_DRAW,
  );
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
    drawVertexArray: particleState.drawState.vertexArray,
    updateVertexArray: particleState.updateState.vertexArray,
    updateTransformFeedback: particleState.updateState.coordTransformFeedback,
  };

  particleState.drawState.vertexArray = particleState.nextState.drawVertexArray;
  particleState.updateState.vertexArray =
    particleState.nextState.updateVertexArray;
  particleState.updateState.coordTransformFeedback =
    particleState.nextState.updateTransformFeedback;

  particleState.nextState = nextParticlesState;
}
