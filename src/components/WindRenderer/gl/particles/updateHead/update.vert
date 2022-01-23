#version 300 es

in vec2 coordIn;
in uint ageIn;

uniform sampler2D uTexture;
uniform sampler2D vTexture;
uniform float deltaT;
uniform bool resetPositions;

// Particle lon, lat
out vec2 coord;
// Number of frames particle as been alive
flat out uint age;

// Minimum number of frames a particle can live for.
uint particleMinLifetime = uint(120);
// Chance that a particle will be reset to new location each frame after it's min lifetime is up.
float resetProb = 0.1;

// Forward declarations
float hash12 (vec2 p);
vec2 hash22 (vec2 p);
vec2 hash23 (vec3 p);
float coordTexelFetch(sampler2D texture, vec2 coord);

void main() {
  if (resetPositions || (ageIn > particleMinLifetime && hash12(vec2(float(gl_VertexID), deltaT)) < resetProb)) {
    coord = hash23(vec3(float(gl_VertexID), deltaT, float(ageIn))) * vec2(359.99, 180) - vec2(0, 90);
    age = uint(0);
  } else {
    coord = coordIn;
    age = ageIn;
  }

  vec2 uv = vec2(
    coordTexelFetch(uTexture, coord),
    coordTexelFetch(vTexture, coord)
  ) / 0.5 - 1.0;


  // NOTE: u and v are on range -1,-1, not actually wind speeds. Speeds near
  // the poles will be greater than at equator due to projection.
  coord = coord + deltaT * uv / 60.0;

  // Wrap points
  coord = mod(coord + vec2(0, 90), vec2(360, 180)) - vec2(0, 90);

  age = age + uint(1);
}

float coordTexelFetch(sampler2D texture, vec2 coord) {
  vec2 normCoord = (coord + vec2(0, 90)) / vec2(360, 180);
  return texelFetch(texture, ivec2(floor(normCoord * vec2(textureSize(texture, 0)))), 0).x;
}

/**
 * Hash functions
 * From https://www.shadertoy.com/view/4djSRW
 */

float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}

vec2 hash23(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}
