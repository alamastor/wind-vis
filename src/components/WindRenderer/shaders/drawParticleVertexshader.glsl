attribute float vertex;
uniform sampler2D positionTexture;
uniform float aspectRatio;
uniform float zoomLevel;
uniform vec2 midCoord;
uniform float positionTextureWidth;
uniform float positionTextureHeight;

vec2 decodeLonLat(in vec4 rgba);

void main() {
  vec2 positionTextureCoord = vec2(mod(vertex, positionTextureWidth),
                                   floor(vertex / positionTextureWidth));
  vec4 positionTextureVal = texture2D(positionTexture,
                                      positionTextureCoord / vec2(positionTextureWidth - 1.0,
                                                                  positionTextureHeight - 1.0));

  vec2 lonLat = decodeLonLat(positionTextureVal);
  vec2 offset = vec2(180, 0) - midCoord;
  float offsetLon = mod(lonLat.x + offset.x, 360.0) - 180.0;
  float offsetLat = lonLat.y + offset.y;
  vec2 clipSpace = vec2(max(0.5, 1.0 / aspectRatio), max(2.0, aspectRatio)) *
                   vec2(offsetLon, offsetLat) / vec2(90, 180);
  vec2 zoomed = zoomLevel * clipSpace;
  gl_PointSize = 3.0 * zoomLevel;
  gl_Position = vec4(zoomed, 0, 1);
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