#version 300 es

in vec2 positionTextureCoord;
uniform sampler2D positionTexture;
uniform float zoomLevel;
uniform vec2 centerCoord;
uniform vec2 canvasDimensions;

vec2 decodeLonLat(in vec4 rgba);

void main() {
  vec2 lonLat = decodeLonLat(texture(positionTexture, positionTextureCoord));

  float aspectRatio = canvasDimensions.x / canvasDimensions.y;
  vec2 shifted = vec2(mod(lonLat.x - centerCoord.x + 180.0, 360.0) - 180.0, lonLat.y - centerCoord.y);
  vec2 clipSpace = 2.0
                   * shifted
                   * zoomLevel / vec2(359.99, 180)
                   * vec2(2.0 / min(aspectRatio, 2.0), max(aspectRatio, 2.0) / 2.0);
  gl_Position = vec4(clipSpace, 0, 1);

  gl_PointSize = min(2.0 * zoomLevel, 5.0);
}

/**
 * Decode an RGBA value back into a lat lon vec2.
 */
vec2 decodeLonLat(in vec4 rgba) {
  // Convert RGBA back to 2 byte values
  vec4 bytes = rgba * float(0xff);
  float encodedLon = bytes.x * float(0x100) + bytes.y;
  float encodedLat = bytes.z * float(0x100) + bytes.w;

  // Convert back to 0-360 / -90-90 ranges
  float lon = encodedLon / float(0x10000 / 360);
  float lat = encodedLat / float(0x10000 / 180) - 90.0;

  return vec2(lon, lat);
}