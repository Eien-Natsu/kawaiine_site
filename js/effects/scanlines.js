window.KawaiineShaderEffects = window.KawaiineShaderEffects || {};

window.KawaiineShaderEffects.scanlines = `
  vec3 applyArtworkScanlines(vec3 color, float strength) {
    float line = sin(v_uv.y * u_resolution.y * PI);
    float thinLine = smoothstep(0.22, 1.0, line);
    float vignette = smoothstep(1.08, 0.18, length(centeredUv()));
    color *= 1.0 - strength * 0.18 + thinLine * strength * 0.14;
    color *= 0.72 + vignette * 0.28;
    return color;
  }
`;
