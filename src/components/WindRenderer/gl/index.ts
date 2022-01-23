import {createTextureSafe} from '../../../utils/gl';
import {getParticleProgramState, ParticleState} from './particles';
import {getSpeedProgramState, SpeedState} from './speeds';

const WIND_TEXTURE_WIDTH = 512;
const WIND_TEXTURE_HEIGHT = 512;
export interface GlState {
  gl: WebGL2RenderingContext;
  speedState: SpeedState;
  particleState: ParticleState;
  uTexture: WebGLTexture;
  vTexture: WebGLTexture;
}

/**
 * Initialize GL and return programs, buffers, textures, and locations.
 */
export function getGLState(gl: WebGL2RenderingContext): GlState {
  const uTexture = createWindMagTex(gl);
  const vTexture = createWindMagTex(gl);
  return {
    gl,
    speedState: getSpeedProgramState(gl, uTexture, vTexture),
    particleState: getParticleProgramState(gl, uTexture, vTexture),
    uTexture,
    vTexture,
  };
}

function createWindMagTex(gl: WebGL2RenderingContext): WebGLTexture {
  const texture = createTextureSafe(gl);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

export function updateWindTextures(
  {gl, uTexture, vTexture}: GlState,
  uData: Uint8Array,
  vData: Uint8Array,
): void {
  updateWindTexture(gl, uTexture, uData);
  updateWindTexture(gl, vTexture, vData);
}

function updateWindTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  data: Uint8Array,
): void {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    WIND_TEXTURE_WIDTH,
    WIND_TEXTURE_HEIGHT,
    0,
    gl.LUMINANCE,
    gl.UNSIGNED_BYTE,
    data,
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
}
