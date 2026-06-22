const canvas = document.getElementById("shader-canvas");
const gl = canvas.getContext("webgl", {
  antialias: false,
  depth: false,
  stencil: false,
  preserveDrawingBuffer: false,
});

const kaomoji = document.getElementById("kaomoji");
const faces = ["( •̀ ω •́ )✧", "(◎﹏◎)"];
let faceIndex = 0;

kaomoji.classList.add("is-flashing");
setInterval(() => {
  faceIndex = 1 - faceIndex;
  kaomoji.textContent = faces[faceIndex];
}, 520);

if (!gl) {
  document.body.classList.add("no-webgl");
} else {
  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;

    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;

    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform float u_time;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float bands(vec2 uv, float t) {
      float row = floor(uv.y * 42.0);
      float gate = step(0.84, hash(vec2(row, floor(t * 8.0))));
      float shard = smoothstep(0.72, 1.0, noise(vec2(row * 0.21, t * 3.0)));
      return gate * shard;
    }

    vec3 palette(float v) {
      vec3 berry = vec3(0.035, 0.012, 0.055);
      vec3 pink = vec3(1.0, 0.16, 0.55);
      vec3 soft = vec3(1.0, 0.72, 0.88);
      vec3 cyan = vec3(0.0, 0.96, 1.0);
      vec3 yellow = vec3(1.0, 0.92, 0.0);
      vec3 color = mix(berry, pink, smoothstep(0.05, 0.92, v));
      color = mix(color, soft, smoothstep(0.72, 1.0, v) * 0.46);
      color += cyan * pow(max(0.0, sin(v * 9.4 + u_time * 1.8)), 10.0) * 0.24;
      color += yellow * step(0.985, hash(vec2(v * 900.0, floor(u_time * 12.0)))) * 0.22;
      return color;
    }

    void main() {
      vec2 uv = v_uv;
      vec2 center = uv - 0.5;
      center.x *= u_resolution.x / u_resolution.y;

      float t = u_time;
      float tear = bands(uv, t);
      uv.x += tear * (hash(vec2(floor(uv.y * 55.0), floor(t * 12.0))) - 0.5) * 0.12;
      uv.x += sin(uv.y * 36.0 + t * 2.8) * 0.006;

      float n1 = noise(uv * vec2(7.0, 4.0) + vec2(t * 0.08, -t * 0.05));
      float n2 = noise(uv * vec2(34.0, 18.0) - vec2(t * 0.5, t * 0.12));
      float pixels = step(0.78, noise(floor(uv * vec2(110.0, 70.0)) * 0.12 + t));
      float radial = 1.0 - smoothstep(0.05, 0.76, length(center));
      float signal = n1 * 0.72 + n2 * 0.28 + radial * 0.32 + tear * 0.42 + pixels * 0.16;

      vec3 color = palette(signal);
      float scan = sin((v_uv.y * u_resolution.y) * 3.14159);
      color *= 0.82 + scan * 0.045;

      float gridX = step(0.988, sin(v_uv.x * u_resolution.x * 0.42 + t * 1.7));
      float gridY = step(0.991, sin(v_uv.y * u_resolution.y * 0.36 - t * 1.1));
      color += vec3(0.0, 0.55, 0.62) * (gridX + gridY) * 0.08;

      float vignette = smoothstep(1.08, 0.18, length(center));
      color *= 0.56 + vignette * 0.66;

      float sparkle = step(0.996, hash(floor(uv * 95.0) + floor(t * 10.0)));
      color += vec3(1.0, 0.78, 0.95) * sparkle * 0.5;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const program = createProgram(vertexSource, fragmentSource);
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
    }
    return shader;
  }

  function createProgram(vertex, fragment) {
    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Shader link failed");
    }
    return program;
  }

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  function render(time) {
    resize();
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, time * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
