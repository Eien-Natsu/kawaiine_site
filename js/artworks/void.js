window.KawaiineShaders.void = `${window.KawaiineShaderCommon}
  float sphereField(vec2 p, float radius) {
    return length(p) - radius;
  }

  float boxField(vec2 p, vec2 b) {
    vec2 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  }

  void main() {
    vec2 uv = v_uv;
    vec2 p = centeredUv();
    float t = u_time;

    vec3 wall = vec3(0.965, 0.97, 0.965);
    vec3 coolWhite = vec3(0.88, 0.93, 0.96);
    vec3 warmWhite = vec3(1.0, 0.99, 0.96);
    float labGrad = smoothstep(-1.05, 0.92, p.y);
    vec3 color = mix(coolWhite, warmWhite, labGrad);

    float roomFalloff = smoothstep(1.55, 0.2, length(p * vec2(0.78, 1.1)));
    float floorLine = smoothstep(0.018, 0.0, abs(p.y + 0.42));
    float floorShade = smoothstep(-0.9, -0.18, p.y);
    color = mix(color, wall, roomFalloff * 0.42);
    color -= vec3(0.06, 0.055, 0.05) * floorShade;
    color -= vec3(0.045, 0.05, 0.055) * floorLine * 0.28;

    float slowAir = noise(uv * vec2(2.0, 1.35) + vec2(t * 0.01, -t * 0.006));
    float labGrain = noise(uv * vec2(70.0, 44.0));
    color += vec3(slowAir - 0.5) * 0.018;
    color += vec3(labGrain - 0.5) * 0.008;

    vec2 objectP = p - vec2(0.0, 0.02);
    float phase = 0.5 + 0.5 * sin(t * 0.72);
    float jitter =
      (noise(vec2(atan(objectP.y, objectP.x) * 10.0, t * 8.5)) - 0.5) * 0.022 +
      (noise(objectP * 18.0 + t * 4.0) - 0.5) * 0.012;
    float sphere = sphereField(objectP, 0.44 + jitter);
    float cube = boxField(objectP, vec2(0.36 + jitter * 0.5));
    float shapeField = mix(sphere, cube, smoothstep(0.25, 0.75, phase));
    float inside = smoothstep(0.006, -0.006, shapeField);
    float edge = smoothstep(0.055, 0.0, abs(shapeField));
    float outsideHalo = smoothstep(0.13, 0.0, shapeField) * (1.0 - inside);

    vec2 shadowP = objectP - vec2(0.0, -0.48);
    float contactShadow = exp(-dot(shadowP * vec2(1.3, 7.0), shadowP * vec2(1.3, 7.0))) * 0.34;
    float occlusion = exp(-max(shapeField, 0.0) * 8.0) * 0.14;
    color -= vec3(0.22, 0.24, 0.25) * contactShadow;
    color -= vec3(0.18, 0.19, 0.2) * occlusion * (1.0 - inside);
    color += vec3(0.04, 0.045, 0.05) * outsideHalo;
    color += vec3(0.16, 0.17, 0.18) * edge * (1.0 - inside);

    color = mix(color, vec3(0.0), inside);
    gl_FragColor = vec4(color, 1.0);
  }
`;
