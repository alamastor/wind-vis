precision mediump float;

uniform float deltaT;
uniform sampler2D positionTexture;
uniform sampler2D uTexture;
uniform sampler2D vTexture;
uniform float positionTextureWidth;
uniform float positionTextureHeight;

vec4 encodeLonLat(in mediump vec2 lonLat);
vec2 decodeLonLat(in vec4 rgba);

void main() {
  vec4 positionTextureVal = texture2D(positionTexture,
                                      vec2(floor(gl_FragCoord.x), floor(gl_FragCoord.y)) /
                                      vec2(positionTextureWidth - 1.0, positionTextureHeight - 1.0));

  vec2 lonLat = decodeLonLat(positionTextureVal);
  float lon = lonLat.x;
  float lat = lonLat.y;

  vec2 uvTextureCoord = vec2(lon / 359.5, (lat + 90.0) / 180.0);
  float u = texture2D(uTexture, uvTextureCoord).x;
  float v = texture2D(vTexture, uvTextureCoord).x;
  float restoredU = u / 0.5 - 1.0;
  float restoredV = v / 0.5 - 1.0;

  lon = mod(lon + deltaT * restoredU / 30.0, 360.0);
  lat = mod(lat + 90.0 + deltaT * restoredV / 30.0, 180.0) - 90.0;

  gl_FragColor = encodeLonLat(vec2(lon, lat));
}


vec4 encodeLonLat(in vec2 lonLat) {
  // Encode a lon lat vec2 into an RGBA vec4 for storage in a texture.

  // Encode lons to from range 0-360 to 0x0-0x10000
  float encodedLon = lonLat.x * float(0x10000 / 360);
  // Encode lats to from range -90-90 to 0x0-0xffff
  float encodedLat = (lonLat.y + 90.0) * float(0xffff / 180);

  // Get upper and lower bytes from encoded values and conver to 0-1 range in vec4
  float lonUByte = floor(encodedLon / float(0x100));
  float lonLByte = fract(encodedLon / float(0x100)) * float(0x100);
  float latUByte = floor(encodedLat / float(0x100));
  float latLByte = fract(encodedLat / float(0x100)) * float(0x100);
  return vec4(lonUByte, lonLByte, latUByte, latLByte) / float(0xff);
}

vec2 decodeLonLat(in vec4 rgba) {
  // Decode an RGBA value back into a lat lon vec2

  // Convert RGBA back to 2 byte values
  vec4 bytes = rgba * float(0xff);
  float encodedLon = bytes.x * float(0x100) + bytes.y;
  float encodedLat = bytes.z * float(0x100) + bytes.w;

  // Convert back to 0-360 / -90-90 ranges
  float lon = encodedLon / float(0x10000 / 360);
  float lat = encodedLat / float(0xffff / 180) - 90.0;

  return vec2(lon, lat);
}