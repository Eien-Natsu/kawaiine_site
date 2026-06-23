window.KawaiineShaders.void = `${window.KawaiineShaderCommon}
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
`;
