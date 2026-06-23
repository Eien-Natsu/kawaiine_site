window.KawaiineShaders.rainbow = `${window.KawaiineShaderCommon}
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
`;
