varying lowp vec3 shColor;

void main() {
  gl_FragColor = vec4(shColor, 1) * 0.5;
}
