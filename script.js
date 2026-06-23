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
const shaders = window.KawaiineShaders || {};

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
const gallery = document.querySelector("[data-gallery]");
const pageCounter = document.querySelector("[data-page-counter]");
const pages = Array.from(document.querySelectorAll("[data-page]"));
const artworkCanvases = Array.from(document.querySelectorAll("[data-piece]"));
let activePageIndex = 0;

try {
  artworkCanvases.forEach((canvas) => {
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
