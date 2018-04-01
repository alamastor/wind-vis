attribute vec2 point;

uniform float aspectRatio;
uniform float zoomLevel;
uniform vec2 midCoord;

varying vec2 texCoord;

void main() {
  gl_Position = vec4(point, 0, 1);

  texCoord = 0.5 + (midCoord - vec2(180, 0)) / vec2(360, 180) +
            point * vec2(min(0.5, aspectRatio / 4.0),
                         min(0.5, 1.0 / aspectRatio)) / zoomLevel;
}
