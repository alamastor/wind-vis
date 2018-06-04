uniform mediump vec2 viewport;
uniform mediump float particleCount;
void main() {
  /*
  mediump float lon = 10.0;
  mediump float lat = 80.0;
  /*
  if (particleVertex == 1.0) {
    lon = 60.0;
    lat = 30.0;
  }
  if (particleVertex == 2.0) {
    lon = 200.0;
    lat = -20.0;
  }
  gl_FragColor = vec4(floor(100.0 * lon / 255.0) / 255.0,
                      mod(100.0 * lon, 255.0) / 255.0,
                      floor(100.0 * (90.0 + lat) / 255.0) / 255.0,
                      mod(100.0 * (90.0 + lat), 255.0) / 255.0);
  */
  gl_FragColor = vec4(0.000001 * particleCount + gl_FragCoord.x / viewport.x, 0, 0, 1);
}