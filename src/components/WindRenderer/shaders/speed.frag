precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D vTexture;
uniform float maxWind;

varying vec2 texCoord;

vec3 viridis(in float i);

void main() {
  float restoredU = texture2D(uTexture, texCoord).r / 0.5 - 1.0;
  float restoredV = texture2D(vTexture, texCoord).r / 0.5 - 1.0;
  float speed = sqrt(pow(restoredU, 2.0) + pow(restoredV, 2.0));
  gl_FragColor = vec4(viridis(speed), 1);
}

vec3 viridis(in float i) {
  // Convert i (intensity 0-1) to Matplotlib Viridis colormap.
  return vec3(
    0.279996085294 - 0.1349846921598316 * i + 2.139562241779562 * pow(i, 2.0) - 14.618561485877892 * pow(i, 3.0) + 25.097783408548356 * pow(i, 4.0) - 11.772588644921733 * pow(i, 5.0),
    0.0010336091072 + 1.609681944005644 * i - 1.8935162112806887 * pow(i, 2.0) + 2.687992417906457 * pow(i, 3.0) - 1.6835417416062761 * pow(i, 4.0) + 0.17873836015256522 * pow(i, 5.0),
    0.305866611269 + 2.5680305844367317 * i - 11.850371601508543 * pow(i, 2.0) + 28.67243222734909 * pow(i, 3.0) - 33.35689847617539 * pow(i, 4.0) + 13.762053354579717 * pow(i, 5.0)
  );
}
