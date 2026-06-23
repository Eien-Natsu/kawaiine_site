window.KawaiineShaders.sun = `${window.KawaiineShaderCommon}
  void main() {
    vec2 uv = v_uv;
    float t = u_time;
    vec2 p = centeredUv();
    vec2 sunPos = vec2(0.34, 0.34);
    vec2 toSun = p - sunPos;
    float d = length(toSun);
    float sunAngle = dot(normalize(vec3(p, 1.0)), normalize(vec3(sunPos, 1.0)));

    float horizon = smoothstep(-1.08, 0.92, p.y);
    float rayleigh = 0.55 + 0.45 * pow(max(0.0, 1.0 - sunAngle), 0.42);
    vec3 zenithBlue = vec3(0.12, 0.48, 1.0);
    vec3 glareBlue = vec3(0.78, 0.92, 1.0);
    vec3 color = mix(zenithBlue, glareBlue, horizon * 0.78 + rayleigh * 0.32);

    float air = noise(uv * vec2(2.4, 1.6) + vec2(t * 0.006, -t * 0.004));
    float fineAir = noise(uv * vec2(18.0, 10.0) + vec2(-t * 0.025, t * 0.012));
    color += vec3(0.04, 0.12, 0.24) * (air - 0.5);
    color += vec3(0.08, 0.11, 0.16) * (fineAir - 0.5) * 0.08;

    float core = smoothstep(0.105, 0.0, d);
    float whiteout = exp(-d * 4.45);
    float innerGlare = exp(-d * 2.15);
    float outerGlare = exp(-d * 0.88);
    float retinalBloom = 0.018 / max(0.018, d * d);
    float softVeil = smoothstep(1.45, 0.0, d) * 0.38;
    float eyeWater = noise(uv * vec2(5.0, 3.0) + vec2(t * 0.01, 0.0)) * 0.06;

    vec3 hotWhite = vec3(1.0);
    vec3 warmGlare = vec3(1.0, 0.97, 0.78);
    color = mix(color, hotWhite, clamp(core + whiteout * 0.72 + retinalBloom * 0.2, 0.0, 1.0));
    color += hotWhite * innerGlare * 0.92;
    color += warmGlare * outerGlare * 0.52;
    color += vec3(1.0, 0.96, 0.82) * retinalBloom * 0.2;
    color = mix(color, hotWhite, softVeil + eyeWater);

    vec2 chroma = normalize(toSun + 0.0001) * 0.012;
    float redGhost = exp(-length(toSun + chroma) * 5.2);
    float blueGhost = exp(-length(toSun - chroma) * 5.7);
    color.r += redGhost * 0.12;
    color.b += blueGhost * 0.16;

    color = color / (1.0 + color * 0.2);
    color = pow(color, vec3(0.78));
    gl_FragColor = vec4(color, 1.0);
  }
`;
