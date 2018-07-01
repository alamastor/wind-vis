precision mediump float;

uniform sampler2D texture;
uniform float alpha;
uniform vec2 textureDimensions;
uniform vec2 currentDimensions;
uniform float textureZoom;
uniform float currentZoom;
uniform vec2 textureCenterCoord;
uniform vec2 currentCenterCoord;

void main() {
    float textureAspectRatio = textureDimensions.x / textureDimensions.y;
    float currentAspectRatio = currentDimensions.x / currentDimensions.y;

    vec2 texCoord = gl_FragCoord.xy / (currentDimensions - 1.0);
    vec2 transformed = (texCoord - 0.5)
        * (textureZoom / currentZoom)
        * vec2(min(currentAspectRatio, 2.0) / min(textureAspectRatio, 2.0),
               min(2.0 / currentAspectRatio, 1.0) / min(textureAspectRatio, 1.0))
        + (currentCenterCoord - textureCenterCoord)
        * textureZoom / vec2(359.99, 180)
        * 1.0 / vec2(min(textureAspectRatio / 2.0, 1.0), min(2.0 / textureAspectRatio, 1.0))
        + 0.5;
    if (any(lessThan(transformed, vec2(0, 0))) || any(greaterThan(transformed, vec2(1, 1)))) {
        gl_FragColor = vec4(0, 0, 0, 0);
    } else {
        gl_FragColor = texture2D(texture, transformed) * alpha;
    }
}