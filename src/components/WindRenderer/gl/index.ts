import {Coord} from '../../../types';
import {getParticleProgramState} from './particles';
import {getSpeedProgramState} from './speeds';

export interface GlState {
  gl: WebGL2RenderingContext;
  speedState: {
    shaderProgram: WebGLProgram;
    vertexArray: WebGLVertexArrayObject;
    aspectRatioLoc: WebGLUniformLocation;
    midCoordLoc: WebGLUniformLocation;
    zoomLevelLoc: WebGLUniformLocation;
    uTextureLoc: WebGLUniformLocation;
    vTextureLoc: WebGLUniformLocation;
  };
  particleState: {
    drawState: {
      frameBuffers: {
        frameBuffer: WebGLFramebuffer;
        texture: WebGLTexture;
        centerCoord: Coord;
        zoomLevel: number;
        screenWidth: number;
        screenHeight: number;
      }[];
      drawParticlesToFrameBufferState: {
        shaderProgram: WebGLProgram;
        positionTextureLoc: WebGLUniformLocation;
        positionTextureCoordLoc: number;
        zoomLevelLoc: WebGLUniformLocation;
        midCoordLoc: WebGLUniformLocation;
        canvasDimensionsLoc: WebGLUniformLocation;
      };
      drawFrameBufferState: {
        shaderProgram: WebGLProgram;
        vertexArray: WebGLVertexArrayObject;
        textureLoc: WebGLUniformLocation;
        alphaLoc: WebGLUniformLocation;
        currentDimensionsLoc: WebGLUniformLocation;
        textureDimensionsLoc: WebGLUniformLocation;
        textureZoomLoc: WebGLUniformLocation;
        currentZoomLoc: WebGLUniformLocation;
        textureCenterCoordLoc: WebGLUniformLocation;
        currentCenterCoordLoc: WebGLUniformLocation;
      };
    };
    updateState: {
      shaderProgram: WebGLProgram;
      frameBuffer: WebGLFramebuffer;
      frameBufferVertexArray: WebGLVertexArrayObject;
      positionTextureLoc: WebGLUniformLocation;
      deltaTLoc: WebGLUniformLocation;
      uTextureLoc: WebGLUniformLocation;
      vTextureLoc: WebGLUniformLocation;
      positionTextureDimensionsLoc: WebGLUniformLocation;
      resetPositionsLoc: WebGLUniformLocation;
    };
    positionTextureCoordBuffer: WebGLBuffer;
    positionTexture: WebGLTexture;
  };
  uTexture: WebGLTexture;
  vTexture: WebGLTexture;
}

/**
 * Initialize GL and return programs, buffers, textures, and locations.
 */
export function getGLState(gl: WebGL2RenderingContext): GlState {
  const speedState = getSpeedProgramState(gl);
  const particleState = getParticleProgramState(gl);

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

export function updateWindTex(
  glState: GlState,
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
