precision mediump float;

uniform sampler2D particleTexture;
uniform vec2 particleTextureDimensions;
uniform float alpha;

void main() {
    gl_FragColor = texture2D(particleTexture, gl_FragCoord.xy / (particleTextureDimensions - 1.0)) * alpha;
}