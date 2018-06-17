attribute vec2 positionTextureCoord;
uniform sampler2D positionTexture;
uniform float zoomLevel;
uniform vec2 centerCoord;
uniform vec2 canvasDimensions;

vec2 decodeLonLat(in vec4 rgba);

void main() {
  vec2 lonLat = decodeLonLat(texture2D(positionTexture, positionTextureCoord));

  float aspectRatio = canvasDimensions.x / canvasDimensions.y;
  vec2 clipSpace = 2.0 * ((lonLat -centerCoord) / vec2(359.99, 180))
                    * vec2(max(2.0 / aspectRatio, 1.0), max(aspectRatio / 2.0, 1.0))
                    * zoomLevel;
  gl_Position = vec4(clipSpace, 0, 1);

  gl_PointSize = 2.0 * zoomLevel;
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