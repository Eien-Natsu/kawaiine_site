window.KawaiineShaders.sun = `${window.KawaiineShaderCommon}
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
`;
