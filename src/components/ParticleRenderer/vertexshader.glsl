attribute float lon;
attribute float lat;
attribute vec3 color;
uniform float aspectRatio;
uniform float zoomLevel;
uniform vec2 midCoord;

varying lowp vec3 shColor;

void main() {
  shColor = color;
  vec2 offset = vec2(180, 0) - midCoord;
  float newLon = mod(lon + offset.x, 360.0) - 180.0;
  float newLat = lat + offset.y;
  vec2 clipSpace = vec2(max(0.5, 1.0 / aspectRatio), max(2.0, aspectRatio)) *
                  vec2(newLon, newLat) / vec2(90, 180);
  vec2 zoomed = zoomLevel * clipSpace;
  gl_PointSize = 3.0 * zoomLevel;
  gl_Position = vec4(zoomed, 0, 1);
}