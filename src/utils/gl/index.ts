function loadShader(gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type);
  if (shader == null) {
    throw new Error('Failed to create shader.');
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('Error compiling shader: ' + gl.getShaderInfoLog(shader));
  }

  return shader;
}

export function createProgramWithShaders(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
) {
  const shaderProgram = gl.createProgram();
  if (shaderProgram == null) {
    throw new Error('Failed to create shader program.');
  }
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(
      'Error initializing shader program: ' +
        gl.getProgramInfoLog(shaderProgram),
    );
  }

  return shaderProgram;
}

export function getUniformLocationSafe(
  gl: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  uniformName: string,
): WebGLUniformLocation {
  const location = gl.getUniformLocation(shaderProgram, uniformName);
  if (location == null) {
    throw new Error(`getUniformLocation for ${uniformName} returned null`);
  }
  return location;
}

export function createBufferSafe(
  gl: WebGL2RenderingContext | WebGL2RenderingContext,
) {
  const buffer = gl.createBuffer();
  if (buffer == null) {
    throw new Error('createBuffer returned null');
  }
  return buffer;
}

export function createTextureSafe(
  gl: WebGL2RenderingContext | WebGL2RenderingContext,
) {
  const texture = gl.createTexture();
  if (texture == null) {
    throw new Error('createTexture returned null');
  }
  return texture;
}

export function createVertexArraySafe(gl: WebGL2RenderingContext) {
  const vertexArray = gl.createVertexArray();
  if (vertexArray == null) {
    throw new Error('createVertexArray returned null');
  }
  return vertexArray;
}
