import {Coord} from '../../../../types';
import {createBufferSafe} from '../../../../utils/gl';
import {
  drawParticles as drawParticlesDraw,
  DrawState,
  getDrawProgramState,
} from './draw';
import {
  getUpdateProgramState,
  getUpdateTransformFeedback,
  getUpdateVertexArray,
  updateParticleBuffers,
  UpdateState,
} from './updateHead';
import {
  getNumberOfParticlesToDraw,
  MAX_PARTICLE_COUNT,
  PARTICLE_FRAME_LIFETIME,
} from './util';

export interface ParticleState {
  gl: WebGL2RenderingContext;
  drawState: DrawState;
  updateState: UpdateState;
  nextState: {
    updateVertexArray: WebGLVertexArrayObject;
    updateTransformFeedback: WebGLTransformFeedback;
    coordBuffer: WebGLBuffer;
  };
  coordBuffer: WebGLBuffer;
  tailBuffer: WebGLBuffer;
  tailHeadIndex: number;
}

export function getParticleProgramState(
  gl: WebGL2RenderingContext,
  uTexture: WebGLTexture,
  vTexture: WebGLTexture,
): ParticleState {
  const points = [];
  const ages = [];
  for (let i = 0; i < MAX_PARTICLE_COUNT; i++) {
    let lon = Math.random() * 359.9;
    let lat = Math.random() * 180 - 90;
    points.push(lon);
    points.push(lat);

    ages.push(Math.floor(Math.random() * (PARTICLE_FRAME_LIFETIME - 1)));
  }

  const coordReadBuffer = getBuffer(gl, new Float32Array(points));
  const ageReadBuffer = getBuffer(gl, new Uint32Array(ages));
  const coordWriteBuffer = getBuffer(
    gl,
    new Float32Array(MAX_PARTICLE_COUNT * 2),
  );
  const ageWriteBuffer = getBuffer(gl, new Uint32Array(MAX_PARTICLE_COUNT));
  const tailBuffer = getBuffer(
    gl,
    new Float32Array(MAX_PARTICLE_COUNT * PARTICLE_FRAME_LIFETIME * 2),
  );

  const drawState = getDrawProgramState(gl, tailBuffer);
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
      coordBuffer: coordWriteBuffer,
    },
    coordBuffer: coordReadBuffer,
    tailBuffer,
    tailHeadIndex: 0,
  };
}

function getBuffer(gl: WebGL2RenderingContext, data: ArrayBuffer): WebGLBuffer {
  const buffer = createBufferSafe(gl);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buffer;
}

export function drawParticles(
  particleState: ParticleState,
  centerCoord: Coord,
  zoomLevel: number,
) {
  drawParticlesDraw(
    particleState.drawState,
    centerCoord,
    zoomLevel,
    particleState.tailHeadIndex,
  );
}

export function updateParticles(
  particleState: ParticleState,
  deltaT: number,
  resetPositions: boolean,
) {
  updateParticleBuffers(particleState.updateState, deltaT, resetPositions);
  copyHeadCoordsToTail(particleState);
  switchReadWriteBuffers(particleState);
}

function copyHeadCoordsToTail(particleState: ParticleState) {
  const {gl, coordBuffer, tailBuffer} = particleState;

  gl.bindBuffer(gl.COPY_READ_BUFFER, coordBuffer);
  gl.bindBuffer(gl.COPY_WRITE_BUFFER, tailBuffer);

  gl.copyBufferSubData(
    gl.COPY_READ_BUFFER,
    gl.COPY_WRITE_BUFFER,
    0,
    getNumberOfParticlesToDraw(gl) *
      particleState.tailHeadIndex *
      2 * // Points per particle
      4, // Bytes per 32 bit float
    getNumberOfParticlesToDraw(gl) *
      2 * // Points per particle
      4, // Bytes per 32 bit float
  );

  particleState.tailHeadIndex =
    (particleState.tailHeadIndex + 1) % PARTICLE_FRAME_LIFETIME;

  gl.bindBuffer(gl.COPY_READ_BUFFER, null);
  gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
}

function switchReadWriteBuffers(particleState: ParticleState): void {
  const nextParticlesState = {
    updateVertexArray: particleState.updateState.vertexArray,
    updateTransformFeedback: particleState.updateState.coordTransformFeedback,
    coordBuffer: particleState.coordBuffer,
  };

  particleState.updateState.vertexArray =
    particleState.nextState.updateVertexArray;
  particleState.updateState.coordTransformFeedback =
    particleState.nextState.updateTransformFeedback;
  particleState.coordBuffer = particleState.nextState.coordBuffer;

  particleState.nextState = nextParticlesState;
}
