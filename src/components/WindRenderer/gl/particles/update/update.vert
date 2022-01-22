#version 300 es

// Particles consist of a set of vertices, which serve to draw the particle with a trail.
// This shader updates vertices in the particle by moving each one in a vector field. Each
// vertex has a particleIndex, which is it's position in the particle trail, with 0 being
// the head and n - 1 being the end of the tail, where n is number vertices in the particle.
// Each vertex also as a particleId, which is an integer representing the particle it
// belongs to.

in vec2 coordIn;
in uint ageIn;

uniform sampler2D uTexture;
uniform sampler2D vTexture;
uniform float deltaT;
uniform bool resetPositions;
uniform uint particleFrameLifetime;

// Particle lon, lat
out vec2 coord;
// Number of frames particle as been alive
flat out uint age;

// Minimum number of frames a particle can live for.
uint particleMinLifetime = uint(500);
// Chance that a particle will be reset to new location each frame after it's min lifetime is up.
float resetProb = 0.05;

// Forward declarations
float hash12 (vec2 p);
vec2 hash22 (vec2 p);
vec2 hash23 (vec3 p);
float coordTexelFetch(sampler2D texture, vec2 coord);

void main() {
  uint particleIndex = particleFrameLifetime - uint(mod(float(gl_VertexID), float(particleFrameLifetime)));
  uint particleId = uint(gl_VertexID) / particleFrameLifetime;

  if (resetPositions || (ageIn > particleMinLifetime && hash12(vec2(float(particleId), deltaT)) < resetProb)) {
    coord = hash23(vec3(float(particleId), deltaT, float(ageIn))) * vec2(359.99, 180) - vec2(0, 90);
    age = uint(0);
  } else {
    coord = coordIn;
    age = ageIn;
  }

  vec2 uv = vec2(
    coordTexelFetch(uTexture, coord),
    coordTexelFetch(vTexture, coord)
  ) / 0.5 - 1.0;


  if (age >= particleIndex) {
    // NOTE: u and v are on range -1,-1, not actually wind speeds. Speeds near
    // the poles will be greater than at equator due to projection.
    coord = coord + deltaT * uv / 60.0;

    // Wrap points
    coord = mod(coord + vec2(0, 90), vec2(360, 180)) - vec2(0, 90);
  }

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
