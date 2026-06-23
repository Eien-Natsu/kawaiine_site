window.KawaiineShaders.sun = `${window.KawaiineShaderCommon}
  ${window.KawaiineShaderEffects.scanlines}

  vec3 applyArtworkScanlines(vec3 color, float strength, vec2 center) {
    float line = sin(v_uv.y * u_resolution.y * PI);
    float thinLine = smoothstep(0.22, 1.0, line);
    float vignette = smoothstep(1.08, 0.18, length(centeredUv() - center));
    color *= 1.0 - strength * 0.18 + thinLine * strength * 0.14;
    color *= 0.72 + vignette * 0.28;
    return color;
  }

  void main() {
    vec2 uv = v_uv;
    float t = u_time;
    vec2 p = centeredUv();
    vec2 sunPos = vec2(0.34, 0.34);
    vec2 toSun = p - sunPos;
    float d = length(toSun);
    float sunAngle = dot(normalize(vec3(p, 1.0)), normalize(vec3(sunPos, 1.0)));

    float skyLift = smoothstep(0.0, 1.0, uv.y);
    float nearSun = exp(-d * 3.4);
    float rayleigh = pow(max(0.0, 1.0 - sunAngle), 0.62);
    vec3 deepSky = vec3(0.36, 0.72, 1.0);
    vec3 highSky = vec3(0.7, 0.9, 1.0);
    vec3 color = mix(deepSky, highSky, skyLift * 0.46);
    color = mix(color, vec3(0.88, 0.97, 1.0), clamp(nearSun * 0.34 + rayleigh * 0.08, 0.0, 0.42));

    float air = noise(uv * vec2(2.4, 1.6) + vec2(t * 0.006, -t * 0.004));
    float fineAir = noise(uv * vec2(18.0, 10.0) + vec2(-t * 0.025, t * 0.012));
    color += vec3(0.01, 0.028, 0.052) * (air - 0.5);
    color += vec3(0.006, 0.016, 0.026) * (fineAir - 0.5);

    float core = smoothstep(0.038, 0.0, d);
    float coreSpike = exp(-d * 42.0);
    float whiteout = exp(-d * 16.0);
    float innerGlare = exp(-d * 7.8);
    float outerGlare = exp(-d * 2.75);
    float retinalBloom = 0.004 / max(0.052, d * d);
    float softVeil = exp(-d * 1.55) * 0.035;
    float eyeWater = noise(uv * vec2(4.0, 2.6) + vec2(t * 0.006, 0.0)) * 0.003;

    vec3 hotWhite = vec3(1.0);
    vec3 glareWhite = vec3(0.82, 0.94, 1.0);
    vec3 warmGlare = vec3(1.0, 0.98, 0.86);
    color = mix(color, hotWhite, clamp(core * 1.9 + coreSpike * 2.4 + whiteout * 0.42, 0.0, 1.0));
    color += glareWhite * innerGlare * 0.2;
    color += warmGlare * outerGlare * 0.07;
    color += vec3(0.78, 0.92, 1.0) * retinalBloom * 0.04;
    color = mix(color, glareWhite, softVeil + eyeWater);

    vec2 chroma = normalize(toSun + 0.0001) * 0.012;
    float redGhost = exp(-length(toSun + chroma) * 5.2);
    float blueGhost = exp(-length(toSun - chroma) * 5.7);
    color.r += redGhost * 0.08;
    color.b += blueGhost * 0.1;

    color *= 1.18;
    color = color / (1.0 + color * 0.035);
    color = pow(color, vec3(0.62));
    color = applyArtworkScanlines(color, 0.06, sunPos);
    gl_FragColor = vec4(color, 1.0);
  }
`;
