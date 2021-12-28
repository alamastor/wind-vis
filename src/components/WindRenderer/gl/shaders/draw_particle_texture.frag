#version 300 es

precision mediump float;

uniform sampler2D textureData;
uniform float alpha;
uniform vec2 textureDimensions;
uniform vec2 currentDimensions;
uniform float textureZoom;
uniform float currentZoom;
uniform vec2 textureCenterCoord;
uniform vec2 currentCenterCoord;

out vec4 fragColor;

void main() {
    float textureAspectRatio = textureDimensions.x / textureDimensions.y;
    float currentAspectRatio = currentDimensions.x / currentDimensions.y;

    vec2 texCoord = gl_FragCoord.xy / (currentDimensions - 1.0);
    vec2 transformed = (texCoord - 0.5)
        * (textureZoom / currentZoom)
        * vec2(min(currentAspectRatio, 2.0) / min(textureAspectRatio, 2.0),
               max(textureAspectRatio, 2.0) / max(currentAspectRatio, 2.0))
        + (currentCenterCoord - textureCenterCoord)
        * textureZoom / vec2(359.99, 180)
        * vec2(2.0 / min(textureAspectRatio, 2.0), max(textureAspectRatio, 2.0) / 2.0)
        + 0.5;
    if (any(lessThan(transformed, vec2(0, 0))) || any(greaterThan(transformed, vec2(1, 1)))) {
        fragColor = vec4(0, 0, 0, 0);
    } else {
        fragColor = texture(textureData, transformed) * alpha;
    }
}