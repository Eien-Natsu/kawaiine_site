window.KawaiineShaders.gem = `${window.KawaiineShaderCommon}
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
`;
