const kaomoji = document.getElementById("kaomoji");
const faces = ["( •̀ ω •́ )✧", "(◎﹏◎)"];
let faceIndex = 0;

kaomoji.classList.add("is-flashing");
setInterval(() => {
  faceIndex = 1 - faceIndex;
  kaomoji.textContent = faces[faceIndex];
}, 520);

const vertexSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const commonSource = `
  precision highp float;

  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform float u_time;

  #define PI 3.14159265359

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

  vec3 spectral(float t) {
    return 0.55 + 0.45 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
  }

  vec2 centeredUv() {
    vec2 p = v_uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;
    return p;
  }
`;

const shaders = {
  background: `${commonSource}
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
      vec2 center = centeredUv();
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
      float scan = sin((v_uv.y * u_resolution.y) * PI);
      color *= 0.82 + scan * 0.045;
      float vignette = smoothstep(1.08, 0.18, length(center));
      color *= 0.56 + vignette * 0.66;
      float sparkle = step(0.996, hash(floor(uv * 95.0) + floor(t * 10.0)));
      color += vec3(1.0, 0.78, 0.95) * sparkle * 0.5;
      gl_FragColor = vec4(color, 1.0);
    }
  `,

  gem: `${commonSource}
    void main() {
      vec2 p = centeredUv();
      float t = u_time;
      float r = length(p);
      float a = atan(p.y, p.x);
      float diamond = abs(p.x) * 0.72 + abs(p.y) * 1.05;
      float body = smoothstep(0.86, 0.78, diamond) * smoothstep(0.98, 0.18, r);

      float facetId = floor((a + PI) / (PI * 2.0) * 20.0);
      float facet = hash(vec2(facetId, floor(r * 8.0)));
      float cut = abs(fract(a * 4.0 / PI + r * 3.2) - 0.5);
      float sharp = smoothstep(0.48, 0.08, cut);
      float pulse = 0.55 + 0.45 * sin(t * 2.8 + facet * 8.0);

      vec3 deep = vec3(0.02, 0.0, 0.08);
      vec3 cyan = vec3(0.0, 0.96, 1.0);
      vec3 pink = vec3(1.0, 0.05, 0.58);
      vec3 lemon = vec3(1.0, 0.94, 0.15);
      vec3 color = mix(deep, mix(cyan, pink, facet), body);
      color += spectral(facet + t * 0.035) * sharp * body * 0.85;
      color += lemon * pow(max(0.0, 1.0 - r), 8.0) * 1.25;
      color += vec3(1.0) * step(0.988, noise(p * 54.0 + t * 1.7)) * body;
      color += vec3(0.0, 0.92, 1.0) * smoothstep(0.035, 0.0, abs(diamond - 0.78)) * 1.4;
      color *= 0.35 + pulse * 1.1;
      color = mix(vec3(0.005, 0.0, 0.015), color, body);
      gl_FragColor = vec4(color, 1.0);
    }
  `,

  sun: `${commonSource}
    void main() {
      vec2 p = centeredUv();
      float t = u_time;
      float r = length(p);
      float a = atan(p.y, p.x);
      float rays = pow(abs(sin(a * 15.0 + t * 1.5)) * 0.7 + abs(sin(a * 5.0 - t)), 3.0);
      float disc = smoothstep(0.48, 0.36, r);
      float core = pow(max(0.0, 1.0 - r * 1.75), 1.4);
      float corona = 0.055 / max(0.018, r - 0.23);
      float flare = pow(max(0.0, 1.0 - abs(p.y + sin(p.x * 9.0 + t) * 0.02) * 12.0), 2.0);
      float grain = noise(p * 22.0 + vec2(t * 0.8, -t * 0.2));

      vec3 whiteHot = vec3(1.0);
      vec3 yellow = vec3(1.0, 0.95, 0.05);
      vec3 orange = vec3(1.0, 0.18, 0.0);
      vec3 magenta = vec3(1.0, 0.0, 0.42);
      vec3 color = mix(orange, yellow, core + grain * 0.2);
      color = mix(color, whiteHot, smoothstep(0.34, 0.0, r));
      color += yellow * corona * (0.55 + rays * 1.4);
      color += magenta * rays * smoothstep(1.2, 0.26, r) * 0.65;
      color += whiteHot * flare * 0.7;
      color *= 0.08 + disc * 2.9 + smoothstep(1.1, 0.0, r) * 0.55;
      gl_FragColor = vec4(color, 1.0);
    }
  `,

  void: `${commonSource}
    void main() {
      vec2 p = centeredUv();
      float t = u_time;
      float r = length(p);
      float ring = smoothstep(0.72, 0.69, r) * smoothstep(0.58, 0.63, r);
      float glitch = step(0.985, noise(vec2(floor(v_uv.y * 120.0), floor(t * 11.0))));
      float dead = step(0.997, hash(floor(v_uv * vec2(160.0, 90.0)) + floor(t * 8.0)));
      vec3 color = vec3(0.0);
      color += vec3(0.02, 0.02, 0.025) * smoothstep(1.35, 0.9, r);
      color *= 1.0 - smoothstep(0.0, 0.86, 1.0 - r);
      color += vec3(0.0, 0.7, 0.85) * ring * glitch * 0.28;
      color += vec3(1.0, 0.0, 0.44) * ring * (1.0 - glitch) * 0.12;
      color += vec3(0.006) * dead;
      color = mix(color, vec3(0.0), smoothstep(0.0, 0.62, 1.0 - r));
      gl_FragColor = vec4(color, 1.0);
    }
  `,

  rainbow: `${commonSource}
    void main() {
      vec2 p = centeredUv();
      float t = u_time;
      float wave = sin(p.x * 3.2 + p.y * 6.5 + t * 1.6) * 0.08;
      float band = p.y + wave + sin(p.x * 12.0 - t * 2.0) * 0.025;
      float hue = fract(band * 0.72 + 0.5 + t * 0.045);
      vec3 color = spectral(hue);
      float prism = abs(fract((band + p.x * 0.06) * 8.0) - 0.5);
      color += spectral(hue + 0.18) * smoothstep(0.42, 0.0, prism) * 0.55;
      color += vec3(1.0) * pow(max(0.0, 1.0 - length(p * vec2(0.72, 1.25))), 5.0) * 0.35;
      color += vec3(0.0, 0.95, 1.0) * step(0.992, noise(p * 70.0 + t)) * 0.75;
      color += vec3(1.0, 0.0, 0.5) * step(0.994, hash(floor(v_uv * vec2(120.0, 80.0)) + floor(t * 14.0))) * 0.85;
      color *= 0.72 + 0.28 * sin(v_uv.y * u_resolution.y * PI);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

function createRenderer(canvas, fragmentSource) {
  const gl = canvas.getContext("webgl", {
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  });

  if (!gl) return null;

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

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  return {
    render(time) {
      resize();
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
  };
}

const renderers = [];
const backgroundCanvas = document.getElementById("shader-canvas");
const gallery = document.querySelector("[data-gallery]");
const pageCounter = document.querySelector("[data-page-counter]");
const pages = Array.from(document.querySelectorAll("[data-page]"));
const exhibitCanvases = Array.from(document.querySelectorAll(".exhibit-canvas"));
let activePageIndex = 0;

try {
  const background = createRenderer(backgroundCanvas, shaders.background);
  if (background) renderers.push(background);

  exhibitCanvases.forEach((canvas) => {
    const shader = shaders[canvas.dataset.piece];
    const renderer = shader ? createRenderer(canvas, shader) : null;
    if (renderer) renderers.push(renderer);
  });
} catch (error) {
  console.error(error);
  document.body.classList.add("no-webgl");
}

if (renderers.length === 0) {
  document.body.classList.add("no-webgl");
} else {
  function render(time) {
    renderers.forEach((renderer) => renderer.render(time));
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function setPage(index) {
  const nextIndex = (index + pages.length) % pages.length;
  if (nextIndex === activePageIndex) return;
  activePageIndex = nextIndex;

  pages.forEach((page, pageIndex) => {
    page.classList.toggle("is-active", pageIndex === activePageIndex);
  });

  pageCounter.textContent = `${String(activePageIndex + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}`;

  gallery.classList.remove("is-switching");
  void gallery.offsetWidth;
  gallery.classList.add("is-switching");
}

window.addEventListener("click", () => {
  setPage(activePageIndex + 1);
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

  const direction = event.key === "ArrowRight" ? 1 : -1;
  setPage(activePageIndex + direction);
});
