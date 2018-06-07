precision mediump float;

uniform float deltaT;
uniform vec2 positionTextureDimensions;
uniform sampler2D positionTexture;
uniform sampler2D uTexture;
uniform sampler2D vTexture;
uniform bool resetPositions;

vec4 encodeLonLat(in mediump vec2 lonLat);
vec2 decodeLonLat(in vec4 rgba);
float random (vec2 st);

void main() {
  float lon;
  float lat;

  if (resetPositions || random(gl_FragCoord.xy / deltaT) > 0.997) {
    // Reset particle if resetting all or randomy to main spread
    lon = random(gl_FragCoord.xy * deltaT) * 359.99;
    lat = random(gl_FragCoord.yx * deltaT) * 180.0 - 90.0;
  } else {
    // Read and decode lon and lat from position texture coord
    vec2 positionTextureCoord = floor(gl_FragCoord.xy) / (positionTextureDimensions - 1.0);
    vec2 lonLat = decodeLonLat(texture2D(positionTexture, positionTextureCoord));
    lon = lonLat.x;
    lat = lonLat.y;

    // Read u and v from their respective textures
    // TODO: Check these lookup coords. Are these the correct texture dimensions?
    vec2 uvTextureCoord = vec2(lon / 359.5, (lat + 90.0) / 180.0);
    float u = texture2D(uTexture, uvTextureCoord).x;
    float v = texture2D(vTexture, uvTextureCoord).x;
    float restoredU = u / 0.5 - 1.0;
    float restoredV = v / 0.5 - 1.0;

    // Update lat and lon with u, v and deltaT.
    // NOTE: u and v are on range -1-1, not actually wind speeds. Speeds near
    // the poles will be greater than at equator due to projection.
    lon = lon + deltaT * restoredU / 30.0;
    lat = lat + deltaT * restoredV / 30.0;
    // Wrap lats to 180˚ around the globe
    if (lat > 90.0) {
      lat = 180.0 - lat;
      lon = lon + 180.0;
    } else if (lat < -90.0) {
      lat = -180.0 - lat;
      lon = lon + 180.0;
    }
    lon = mod(lon, 360.0);
  }

  // Encode position back to RGBA
  gl_FragColor = encodeLonLat(vec2(lon, lat));
}

/**
 * Encode a lon lat vec2 into an RGBA vec4 for storage in a texture.
 */
vec4 encodeLonLat(in vec2 lonLat) {
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
  float lat = encodedLat / float(0xffff / 180) - 90.0;

  return vec2(lon, lat);
}

/**
 * Random float 0-1
 * From https://thebookofshaders.com/10/
 */
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}