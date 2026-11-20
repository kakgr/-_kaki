varying vec3 vColor;
varying float vBlur;
varying float vAlpha;

void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float innerEdge = mix(0.35, 0.0, vBlur);
    float alpha = smoothstep(0.5, innerEdge, dist);
    alpha *= mix(1.0, 0.25, vBlur) * vAlpha;

    gl_FragColor = vec4(vColor, alpha);
}
