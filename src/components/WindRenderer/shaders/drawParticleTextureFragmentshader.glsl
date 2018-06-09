precision mediump float;

uniform sampler2D particleTexture;
uniform vec2 particleTextureDimensions;

void main() {
    gl_FragColor = texture2D(particleTexture, gl_FragCoord.xy / (particleTextureDimensions - 1.0));
}