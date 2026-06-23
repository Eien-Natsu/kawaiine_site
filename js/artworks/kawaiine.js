window.KawaiineShaders.kawaiine = `${window.KawaiineShaderCommon}
  ${window.KawaiineShaderEffects.scanlines}

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
    float vignette = smoothstep(1.08, 0.18, length(center));
    color *= 0.56 + vignette * 0.66;
    float sparkle = step(0.996, hash(floor(uv * 95.0) + floor(t * 10.0)));
    color += vec3(1.0, 0.78, 0.95) * sparkle * 0.5;
    color = applyArtworkScanlines(color, 0.72);
    gl_FragColor = vec4(color, 1.0);
  }
`;
