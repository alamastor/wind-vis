#version 300 es

precision mediump float;

// trailFrac: fraction of distance particle is along the trail
// head: 0, tail 1.
in float trailFrac;

out vec4 fragColor;

void main() {
  fragColor = vec4(1, 1, 0, pow(trailFrac * 0.4, 3.0));
}