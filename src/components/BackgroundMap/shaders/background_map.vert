#version 300 es

in vec2 vertex;

uniform float aspectRatio; // aspect ratio of canvas
uniform float zoomLevel; // zoom factor from fully zoomed out map
uniform vec2 midCoord; // lon-lat of map centre point

out vec2 texCoord;

void main() {
    texCoord = 0.5
        + (midCoord - vec2(180, 0)) / vec2(360, 180)
        + vertex
        * vec2(
            min(0.5, aspectRatio / 4.0),
            min(0.5, 1.0 / aspectRatio)
        ) / zoomLevel;
    gl_Position = vec4(vertex, 0, 1);
}