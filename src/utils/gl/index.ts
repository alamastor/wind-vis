function loadShader(gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type);
  if (shader == null) {
    console.log('Failed to create shader.');
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  console.log('Error compiling shader: ' + gl.getShaderInfoLog(shader));
  return null;
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
  if (vertexShader == null) {
    throw new Error('Failed to create to load vertex shader.');
  }
  const fragmentShader = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  if (fragmentShader == null) {
    throw new Error('Failed to create to load fragment shader.');
  }
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
