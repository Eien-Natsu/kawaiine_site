window.KawaiineShaders.void = `${window.KawaiineShaderCommon}
  mat2 rotate2d(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  bool hitBox(vec3 ro, vec3 rd, vec3 halfSize, out float hitNear) {
    vec3 invRd = 1.0 / rd;
    vec3 t0 = (-halfSize - ro) * invRd;
    vec3 t1 = (halfSize - ro) * invRd;
    vec3 tMin = min(t0, t1);
    vec3 tMax = max(t0, t1);
    float nearT = max(max(tMin.x, tMin.y), tMin.z);
    float farT = min(min(tMax.x, tMax.y), tMax.z);
    hitNear = nearT;
    return farT >= max(nearT, 0.0);
  }

  void main() {
    vec2 uv = v_uv;
    vec2 p = centeredUv();
    float t = u_time;

    vec3 color = vec3(0.995, 0.996, 0.994);
    float evenLight = 0.018 * smoothstep(-0.95, 0.95, p.y);
    color += vec3(evenLight);

    vec2 backLeft = vec2(-0.72, 0.42);
    vec2 backRight = vec2(0.72, 0.42);
    vec2 frontLeft = vec2(-1.08, -0.82);
    vec2 frontRight = vec2(1.08, -0.82);
    float backWall = smoothstep(0.006, 0.0, abs(p.y - backLeft.y));
    backWall *= smoothstep(backLeft.x, backLeft.x + 0.02, p.x);
    backWall *= 1.0 - smoothstep(backRight.x - 0.02, backRight.x, p.x);
    float leftWall = smoothstep(0.008, 0.0, abs((p.x - frontLeft.x) * (backLeft.y - frontLeft.y) - (p.y - frontLeft.y) * (backLeft.x - frontLeft.x)));
    float rightWall = smoothstep(0.008, 0.0, abs((p.x - frontRight.x) * (backRight.y - frontRight.y) - (p.y - frontRight.y) * (backRight.x - frontRight.x)));
    leftWall *= smoothstep(frontLeft.y, frontLeft.y + 0.02, p.y);
    leftWall *= 1.0 - smoothstep(backLeft.y - 0.02, backLeft.y, p.y);
    rightWall *= smoothstep(frontRight.y, frontRight.y + 0.02, p.y);
    rightWall *= 1.0 - smoothstep(backRight.y - 0.02, backRight.y, p.y);
    float wallLines = backWall + leftWall + rightWall;
    color -= vec3(0.105, 0.112, 0.118) * wallLines;

    float labGrain = noise(uv * vec2(72.0, 46.0));
    color += vec3(labGrain - 0.5) * 0.003;

    float angleY = t * 1.22;
    float angleX = t * 0.37 + 0.58;
    float angleZ = t * 0.19 + 0.21;

    vec3 ro = vec3(0.0, 0.03, 2.45);
    vec3 rd = normalize(vec3(p * vec2(1.02, 0.86), -1.7));
    ro.xy = rotate2d(angleZ) * ro.xy;
    rd.xy = rotate2d(angleZ) * rd.xy;
    ro.yz = rotate2d(angleX) * ro.yz;
    rd.yz = rotate2d(angleX) * rd.yz;
    ro.xz = rotate2d(angleY) * ro.xz;
    rd.xz = rotate2d(angleY) * rd.xz;

    float hitNear = 0.0;
    bool cubeHit = hitBox(ro, rd, vec3(0.43), hitNear);

    vec2 shadowP = p - vec2(0.02, -0.38);
    float contactShadow = exp(-dot(shadowP * vec2(1.15, 7.2), shadowP * vec2(1.15, 7.2))) * 0.18;
    color -= vec3(0.1, 0.105, 0.11) * contactShadow;

    if (cubeHit) {
      color = vec3(0.0);
    }

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;
