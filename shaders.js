let Shaders = {defaultVertexShader: `
precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`,
defaultFragmentShader:`
precision mediump float;
uniform sampler2D texture;
varying vec2 vUv;
void main() {
    gl_FragColor = texture2D(texture, vUv);
}
`,
gradientBoxShader:`
precision mediump float;
uniform sampler2D texture;
varying vec2 vUv;
void main() {
    float a = abs(vUv.x - 0.5)*2.0;
    a = a*a*a*a*a;
    float b = abs(vUv.y - 0.5)*2.0;
    b = b*b*b*b*b;
    gl_FragColor = vec4(0, 0, 0, max(a, b));
}
`}
