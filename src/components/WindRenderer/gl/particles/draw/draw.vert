#version 300 es

in vec2 coord;

uniform float zoomLevel;
uniform vec2 centerCoord;
uniform vec2 canvasDimensions;

vec2 decodeLonLat(in vec4 rgba);

void main() {
  float aspectRatio = canvasDimensions.x / canvasDimensions.y;
  vec2 shifted = vec2(mod(coord.x - centerCoord.x + 180.0, 360.0) - 180.0, coord.y - centerCoord.y);
  vec2 clipSpace = 2.0
                   * shifted
                   * zoomLevel / vec2(359.99, 180)
                   * vec2(2.0 / min(aspectRatio, 2.0), max(aspectRatio, 2.0) / 2.0);
  gl_Position = vec4(clipSpace, 0, 1);

  gl_PointSize = min(2.0 * zoomLevel, 5.0);
}
