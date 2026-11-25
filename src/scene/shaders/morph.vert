uniform float uOceanTime;
uniform float uGeoTime;
uniform float uRibbonTime;
uniform float uCustomTime;
uniform float uCount;
uniform float uProgress;
uniform float uIntro;      // 0.0 = 漆黒 -> 0.10..0.26 = 一点点火 -> 0.26..1.0 = 一点から展開
uniform float uFromMode;   // 0.0 = Ocean, 1.0 = Geometry, 2.0 = Ribbons, 3.0 = Custom
uniform float uTargetMode; // 0.0 = Ocean, 1.0 = Geometry, 2.0 = Ribbons, 3.0 = Custom

// PlayGround Custom Uniforms (Uniform Branching)
uniform int uCustomFunc;       // 0: Wave, 1: Sphere, 2: Torus, 3: Lissajous, 4: Helix
uniform int uCustomNoise;      // 0: None, 1: FBM, 2: Gyroid, 3: Value3D, 4: Curl
uniform float uCustomShape;
uniform float uCustomNoiseAmp;
uniform float uCustomNoiseFreq;
uniform float uCustomPointSize;

attribute float aParticleId;

varying vec3 vColor;
varying float vBlur;
varying float vAlpha;

float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbmRough(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 4; i++) {
        float n = 1.0 - abs(noise2D(p) * 2.0 - 1.0);
        value += amp * n;
        p = rot * p * 2.15 + vec2(13.7, 7.3);
        amp *= 0.5;
    }
    return value;
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, u.x);
    float nx10 = mix(n010, n110, u.x);
    float nx01 = mix(n001, n101, u.x);
    float nx11 = mix(n011, n111, u.x);

    float nxy0 = mix(nx00, nx10, u.y);
    float nxy1 = mix(nx01, nx11, u.y);

    return mix(nxy0, nxy1, u.z);
}

vec3 noise3DVec(vec3 p) {
    return vec3(
        noise3D(p),
        noise3D(p + vec3(31.416, -17.32, 47.85)),
        noise3D(p + vec3(-23.19, 59.13, -11.42))
    );
}

vec3 curlNoise(vec3 p) {
    float e = 0.12;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 p_y0 = noise3DVec(p - dy);
    vec3 p_y1 = noise3DVec(p + dy);
    vec3 p_z0 = noise3DVec(p - dz);
    vec3 p_z1 = noise3DVec(p + dz);
    vec3 p_x0 = noise3DVec(p - dx);
    vec3 p_x1 = noise3DVec(p + dx);

    float x = (p_y1.z - p_y0.z) - (p_z1.y - p_z0.y);
    float y = (p_z1.x - p_z0.x) - (p_x1.z - p_x0.z);
    float z = (p_x1.y - p_x0.y) - (p_y1.x - p_y0.x);

    return vec3(x, y, z) / (2.0 * e);
}

vec3 curlLikeField(vec3 p) {
    float e = 0.15;
    float n1 = noise3D(p + vec3(0.0, e, 0.0)) - noise3D(p - vec3(0.0, e, 0.0));
    float n2 = noise3D(p + vec3(0.0, 0.0, e)) - noise3D(p - vec3(0.0, 0.0, e));
    float n3 = noise3D(p + vec3(e, 0.0, 0.0)) - noise3D(p - vec3(e, 0.0, 0.0));
    return vec3(n1 - n2, n2 - n3, n3 - n1) / (2.0 * e);
}

vec3 gyroidFlow(vec3 p) {
    return vec3(
        sin(p.y) * cos(p.z) + cos(p.x * 0.7),
        sin(p.z) * cos(p.x) + cos(p.y * 0.7),
        sin(p.x) * cos(p.y) + cos(p.z * 0.7)
    );
}

vec3 trochoidalWaveParam(vec4 wave, vec3 p, float steepScale, float t) {
    float steepness = wave.z * steepScale;
    float wavelength = wave.w;
    float k = 6.2831853 / wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(wave.xy);
    float f = k * (dot(d, p.xz) - c * t);
    float a = steepness / k;

    return vec3(
        d.x * (a * cos(f)),
        a * sin(f),
        d.y * (a * cos(f))
    );
}

vec3 selectVec3(float mode, vec3 oceanV, vec3 geoV, vec3 ribbonV, vec3 customV) {
    if (mode < 0.5) return oceanV;
    if (mode < 1.5) return geoV;
    if (mode < 2.5) return ribbonV;
    return customV;
}

float selectFloat(float mode, float oceanF, float geoF, float ribbonF, float customF) {
    if (mode < 0.5) return oceanF;
    if (mode < 1.5) return geoF;
    if (mode < 2.5) return ribbonF;
    return customF;
}

void main() {
    float i = aParticleId;

    // 必要なモードだけをユニフォーム分岐で計算（全頂点で同一分岐のためGPU効率◎）
    bool isTransitioning = uProgress < 0.999;
    bool needFrom = isTransitioning && (uProgress < 0.69);
    bool needTo = !isTransitioning || (uProgress > 0.35);

    bool needOcean  = (needTo && uTargetMode < 0.5) || (needFrom && uFromMode < 0.5);
    bool needGeo    = (needTo && uTargetMode >= 0.5 && uTargetMode < 1.5) || (needFrom && uFromMode >= 0.5 && uFromMode < 1.5);
    bool needRibbon = (needTo && uTargetMode >= 1.5 && uTargetMode < 2.5) || (needFrom && uFromMode >= 1.5 && uFromMode < 2.5);
    bool needCustom = (needTo && uTargetMode >= 2.5) || (needFrom && uFromMode >= 2.5);

    // --- 1. 波 (Ocean) の座標・色 (Setting.md 固定値) ---
    vec3 oceanPos = vec3(0.0);
    vec3 oceanColor = vec3(0.0);
    if (needOcean) {
        float angle = i * 2.39996 + (hash11(i + 1.0) - 0.5) * 0.25;
        float radius = sqrt((i + 0.5) / uCount) * 26.0;
        vec3 oceanBase = vec3(cos(angle) * radius * 1.15, 0.0, sin(angle) * radius - 10.0);

        oceanPos = oceanBase;
        oceanPos += trochoidalWaveParam(vec4(1.0,  0.35, 0.24, 9.5), oceanBase, 2.2, uOceanTime);
        oceanPos += trochoidalWaveParam(vec4(0.4,  0.90, 0.18, 5.2), oceanBase, 2.2, uOceanTime);
        oceanPos += trochoidalWaveParam(vec4(-0.6, 0.75, 0.14, 3.1), oceanBase, 2.2, uOceanTime);
        oceanPos += trochoidalWaveParam(vec4(0.85, -0.5, 0.10, 1.8), oceanBase, 2.2, uOceanTime);

        vec2 noiseUv = oceanPos.xz * 0.45 + vec2(uOceanTime * 0.18, -uOceanTime * 0.12);
        float nOcean = fbmRough(noiseUv);
        oceanPos.y += (nOcean - 0.5) * 0.45 * 1.4; // ノイズの荒さ 1.4

        float oHeight = clamp(oceanPos.y * 0.5 + 0.5, 0.0, 1.0);
        float oFoam = smoothstep(0.35, 1.15, oceanPos.y) * 0.75 + smoothstep(0.62, 0.92, nOcean) * 0.45 * 1.4;
        oceanColor = mix(vec3(0.05, 0.25, 0.55), vec3(0.12, 0.68, 0.92), smoothstep(0.15, 0.85, oHeight));
        oceanColor = mix(oceanColor, vec3(0.88, 0.96, 1.00), clamp(oFoam, 0.0, 1.0) * 0.85);
    }

    // --- 2. 立体 (Geometry) の座標・色 (Setting.md 固定値) ---
    vec3 geoPos = vec3(0.0);
    vec3 geoColor = vec3(0.0);
    if (needGeo) {
        vec3 seedPos = vec3(
            (hash11(i * 0.173 + 1.3) - 0.5) * 18.0,
            (hash11(i * 0.317 + 7.9) - 0.5) * 7.0,
            (hash11(i * 0.719 + 19.1) - 0.5) * 18.0
        );

        geoPos = seedPos;
        float freq = 0.28 + 4.0 * 0.03; // 螺旋の捻れ 4.0
        for (int stepIdx = 0; stepIdx < 3; stepIdx++) {
            vec3 flow = vec3(
                sin(geoPos.y * freq * 1.7 + uGeoTime * 0.55) + cos(geoPos.z * freq + uGeoTime * 0.35),
                sin(geoPos.z * freq * 1.3 - uGeoTime * 0.45) * cos(geoPos.x * freq * 0.9 + uGeoTime * 0.25),
                cos(geoPos.x * freq * 1.5 + uGeoTime * 0.50) - sin(geoPos.y * freq + uGeoTime * 0.30)
            );
            vec3 curl = curlLikeField(geoPos * 0.24 + vec3(uGeoTime * 0.12, -uGeoTime * 0.09, uGeoTime * 0.10));
            geoPos += flow * 0.75 + curl * 1.15; // 3Dノイズ強度 1.0
        }

        float gHeight = clamp(geoPos.y * 0.12 + 0.5, 0.0, 1.0);
        float gSpeed = clamp(length(geoPos - seedPos) * 0.14, 0.0, 1.0);
        geoColor = mix(vec3(0.10, 0.32, 0.78), vec3(0.20, 0.82, 0.96), gHeight);
        geoColor = mix(geoColor, vec3(0.92, 0.97, 1.00), smoothstep(0.45, 0.95, gSpeed) * 0.65);
    }

    // --- 3. 帯 (Riemann) の座標・色 (ユーザー指定固定値) ---
    vec3 ribbonPos = vec3(0.0);
    vec3 ribbonColor = vec3(0.0);
    if (needRibbon) {
        float uParam = hash11(i * 0.293 + 9.7);
        float vParam = hash11(i * 0.547 + 17.3);

        float flowU = fract(uParam + uRibbonTime * 0.04);
        float s = flowU - 0.5;

        float theta = s * (6.2831853 * 3.5) + uRibbonTime * 0.25;
        float rSheet = 4.5 + (vParam - 0.5) * 7.8 + sin(theta * 2.0 - uRibbonTime * 0.5) * 0.5;
        float axial = s * 185.0;

        vec3 rawRiemann = vec3(
            axial * 0.82 + cos(theta) * rSheet * 0.58,
            sin(theta) * rSheet * 0.62 + axial * 0.22,
            sin(theta + 1.1) * rSheet * 0.72 - axial * 0.35
        );

        vec3 c1 = curlNoise(rawRiemann * 0.13 + vec3(uRibbonTime * 0.12, -uRibbonTime * 0.08, uRibbonTime * 0.10));
        vec3 c2 = curlNoise(rawRiemann * (0.13 * 2.1) - vec3(uRibbonTime * 0.07, uRibbonTime * 0.09, -uRibbonTime * 0.08)) * 0.45;
        ribbonPos = rawRiemann + (c1 + c2) * 3.5;

        float curlMag = clamp(length(c1) * 0.42, 0.0, 1.0);
        float edgeGlow = 1.0 - abs(vParam - 0.5) * 2.0;
        ribbonColor = mix(vec3(0.12, 0.38, 0.92), vec3(0.18, 0.88, 0.92), flowU);
        ribbonColor = mix(ribbonColor, vec3(0.98, 0.84, 0.68), smoothstep(0.35, 0.9, curlMag) * 0.75);
        ribbonColor = mix(ribbonColor, vec3(0.92, 0.98, 1.00), pow(edgeGlow, 2.0) * 0.35);
    }

    // --- 4. カスタム (PlayGround: ベース関数 × 軽量ノイズ、ユニフォーム分岐) ---
    vec3 customPos = vec3(0.0);
    vec3 customColor = vec3(0.0);
    if (needCustom) {
        float ct = uCustomTime;
        float accentFactor = 0.0;

        // 4-A. ベース関数
        if (uCustomFunc == 0) {
            // Wave (波と同じ初期形状)
            float angle = i * 2.39996 + (hash11(i + 1.0) - 0.5) * 0.25;
            float radius = sqrt((i + 0.5) / uCount) * 26.0;
            vec3 base = vec3(cos(angle) * radius * 1.15, 0.0, sin(angle) * radius - 10.0);

            customPos = base;
            customPos += trochoidalWaveParam(vec4(1.0,  0.35, 0.24, 9.5), base, uCustomShape, ct);
            customPos += trochoidalWaveParam(vec4(0.4,  0.90, 0.18, 5.2), base, uCustomShape, ct);
            customPos += trochoidalWaveParam(vec4(-0.6, 0.75, 0.14, 3.1), base, uCustomShape, ct);
            customPos += trochoidalWaveParam(vec4(0.85, -0.5, 0.10, 1.8), base, uCustomShape, ct);
        } else if (uCustomFunc == 1) {
            // Fibonacci Sphere
            float yNorm = 1.0 - (2.0 * i + 1.0) / uCount;
            float rSlice = sqrt(max(0.0, 1.0 - yNorm * yNorm));
            float phi = i * 2.3999632 + ct * 0.35;
            float harmonic = 1.0 + 0.14 * sin(phi * max(1.0, floor(uCustomShape + 0.5)) + yNorm * 4.0 - ct * 1.2);
            float rad = 5.0 * harmonic;
            customPos = vec3(cos(phi) * rSlice * rad, yNorm * rad, sin(phi) * rSlice * rad);
        } else if (uCustomFunc == 2) {
            // Torus Knot
            float u = ((i + 0.5) / uCount) * 6.2831853 + ct * 0.25;
            float pK = 2.0;
            float qK = max(1.0, floor(uCustomShape + 1.2));
            float rKnot = 3.8 + 1.5 * cos(qK * u);
            vec3 center = vec3(
                rKnot * cos(pK * u),
                1.9 * sin(qK * u),
                rKnot * sin(pK * u)
            );
            float tubeAngle = hash11(i * 0.371 + 3.1) * 6.2831853;
            float tubeRad = (0.35 + 0.75 * hash11(i * 0.713 + 9.7));
            customPos = center + vec3(
                cos(tubeAngle) * tubeRad,
                sin(tubeAngle) * tubeRad,
                sin(tubeAngle + u) * tubeRad * 0.7
            );
        } else if (uCustomFunc == 3) {
            // 3D Lissajous Surface
            float u = hash11(i * 0.217 + 1.7) * 6.2831853;
            float v = hash11(i * 0.619 + 8.3) * 6.2831853;
            float a = max(1.0, floor(uCustomShape + 0.5));
            float b = a + 1.0;
            customPos = vec3(
                sin(a * u + ct * 0.6) * cos(v) * 5.6,
                sin(b * v - ct * 0.45) * 4.2,
                cos(a * u - v + ct * 0.35) * 5.6
            );
        } else {
            // Helix / Mobius Ribbon
            float uP = hash11(i * 0.293 + 9.7);
            float vP = hash11(i * 0.547 + 17.3);
            float flowU = fract(uP + ct * 0.08);
            float s = flowU - 0.5;
            float theta = s * (6.2831853 * max(0.5, uCustomShape)) + ct * 0.5;
            float rSheet = 3.0 + (vP - 0.5) * 2.8;
            customPos = vec3(
                s * 18.0,
                sin(theta) * rSheet,
                cos(theta) * rSheet
            );
        }

        // 4-B. ノイズ（ユニフォーム分岐で1つだけ実行）
        if (uCustomNoise == 1) {
            // 2D FBM (Ocean と同一)
            vec2 nUv = customPos.xz * uCustomNoiseFreq + vec2(ct * 0.18, -ct * 0.12);
            float nVal = fbmRough(nUv);
            customPos.y += (nVal - 0.5) * 0.45 * uCustomNoiseAmp;
            accentFactor = smoothstep(0.62, 0.92, nVal) * 0.45 * uCustomNoiseAmp;
        } else if (uCustomNoise == 2) {
            // Gyroid (sin/cos のみ・超軽量)
            vec3 g = gyroidFlow(customPos * uCustomNoiseFreq + vec3(ct * 0.45, -ct * 0.32, ct * 0.28));
            customPos += g * (uCustomNoiseAmp * 0.55);
            accentFactor = clamp(length(g) * 0.35, 0.0, 1.0);
        } else if (uCustomNoise == 3) {
            // Value 3D (1オクターブ)
            vec3 n3 = noise3DVec(customPos * uCustomNoiseFreq + vec3(ct * 0.3, -ct * 0.2, ct * 0.25)) - 0.5;
            customPos += n3 * (uCustomNoiseAmp * 2.2);
            accentFactor = clamp(length(n3) * 1.4, 0.0, 1.0);
        } else if (uCustomNoise == 4) {
            // Lightweight Curl-Like (6回評価)
            vec3 cl = curlLikeField(customPos * uCustomNoiseFreq + vec3(ct * 0.22, -ct * 0.18, ct * 0.20));
            customPos += cl * (uCustomNoiseAmp * 0.72);
            accentFactor = clamp(length(cl) * 0.42, 0.0, 1.0);
        }

        // 4-C. カラー（Wave 初期値時は Ocean と完全一致）
        if (uCustomFunc == 0) {
            float cHeight = clamp(customPos.y * 0.5 + 0.5, 0.0, 1.0);
            float cFoam = smoothstep(0.35, 1.15, customPos.y) * 0.75 + accentFactor;
            customColor = mix(vec3(0.05, 0.25, 0.55), vec3(0.12, 0.68, 0.92), smoothstep(0.15, 0.85, cHeight));
            customColor = mix(customColor, vec3(0.88, 0.96, 1.00), clamp(cFoam, 0.0, 1.0) * 0.85);
        } else {
            float cHeight = clamp(customPos.y * 0.14 + 0.5, 0.0, 1.0);
            customColor = mix(vec3(0.08, 0.30, 0.76), vec3(0.18, 0.84, 0.95), cHeight);
            customColor = mix(customColor, vec3(0.95, 0.82, 0.62), smoothstep(0.35, 0.95, accentFactor) * 0.65);
        }
    }

    // --- 5. 3段階遷移: 中心へ集束 -> 一拍溜め -> 全粒子同時に等速展開 ---
    vec3 fromPos   = selectVec3(uFromMode, oceanPos, geoPos, ribbonPos, customPos);
    vec3 toPos     = selectVec3(uTargetMode, oceanPos, geoPos, ribbonPos, customPos);
    vec3 fromColor = selectVec3(uFromMode, oceanColor, geoColor, ribbonColor, customColor);
    vec3 toColor   = selectVec3(uTargetMode, oceanColor, geoColor, ribbonColor, customColor);

    vec3 corePos = vec3(0.0, 0.8, 0.0);
    vec3 coreCluster = corePos + vec3(
        hash11(i * 0.41 + 1.0) - 0.5,
        hash11(i * 0.67 + 2.0) - 0.5,
        hash11(i * 0.89 + 3.0) - 0.5
    ) * 0.45;

    float customMaxDist = (uCustomFunc == 0) ? 32.0 : 18.0;
    float maxSourceDist = selectFloat(uFromMode, 32.0, 18.0, 100.0, customMaxDist);
    float srcDistNorm = clamp(length(fromPos - corePos) / maxSourceDist, 0.18, 1.0);
    float gatherRaw = clamp(uProgress / (0.36 * srcDistNorm), 0.0, 1.0);
    float gatherT = gatherRaw * gatherRaw * (3.0 - 2.0 * gatherRaw);

    float maxTargetDist = selectFloat(uTargetMode, 32.0, 18.0, 100.0, customMaxDist);
    float distNorm = clamp(length(toPos - corePos) / maxTargetDist, 0.15, 1.0);
    float outRaw = clamp((uProgress - 0.48) / (0.52 * distNorm), 0.0, 1.0);
    float outT = 1.0 - pow(1.0 - outRaw, 1.6);

    vec3 pos = uProgress < 0.48
        ? mix(fromPos, coreCluster, gatherT)
        : mix(coreCluster, toPos, outT);

    float colorT = clamp((uProgress - 0.36) / 0.32, 0.0, 1.0);
    vColor = mix(fromColor, toColor, colorT);

    // --- 6. オープニング演出: 漆黒 -> 一点点火 -> 放射状に展開 ---
    float introVis = 1.0;
    if (uIntro < 0.999) {
        introVis = smoothstep(0.10, 0.24, uIntro);
        vec3 introOrigin = corePos + (coreCluster - corePos) * mix(0.03, 0.45, smoothstep(0.10, 0.30, uIntro));
        float introDistNorm = clamp(length(pos - corePos) / maxTargetDist, 0.15, 1.0);
        float introOutRaw = clamp((uIntro - 0.26) / (0.74 * introDistNorm), 0.0, 1.0);
        float introOutT = 1.0 - pow(1.0 - introOutRaw, 1.6);
        pos = mix(introOrigin, pos, introOutT);
        vColor = mix(vec3(0.82, 0.95, 1.0), vColor, smoothstep(0.0, 0.35, introOutT));
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float camDist = length(mvPosition.xyz);

    float lodKeep = mix(1.0, 0.10, smoothstep(6.0, 42.0, camDist));
    float lodRand = hash11(i * 0.731 + 19.19);
    float oceanLod = smoothstep(lodRand, lodRand + 0.08, lodKeep);
    float oceanDistAlpha = 1.0 - smoothstep(8.0, 42.0, camDist) * 0.2;

    float fromIsWave = (uFromMode < 0.5 || (uFromMode >= 2.5 && uCustomFunc == 0)) ? 1.0 : 0.0;
    float toIsWave   = (uTargetMode < 0.5 || (uTargetMode >= 2.5 && uCustomFunc == 0)) ? 1.0 : 0.0;
    float isWave = mix(fromIsWave, toIsWave, smoothstep(0.25, 0.75, uProgress));
    float inTransition = sin(clamp(uProgress, 0.0, 1.0) * 3.14159265);
    float alpha = mix(1.0, oceanLod * oceanDistAlpha, isWave * (1.0 - inTransition)) * introVis;

    if (alpha <= 0.001) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        gl_PointSize = 0.0;
        return;
    }

    vec4 clipPos = projectionMatrix * mvPosition;
    if (abs(clipPos.x) > clipPos.w * 1.15 ||
        abs(clipPos.y) > clipPos.w * 1.15 ||
        clipPos.z < -clipPos.w ||
        clipPos.z > clipPos.w) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        gl_PointSize = 0.0;
        return;
    }

    // モードごとの DoF・粒子サイズ
    // Ocean: (15, 18, 120), Geometry: (12, 22, 120), Ribbons: (22, 18, 130)
    // Custom: カメラ距離に追従しつつ前後がしっかりボケる固定 DoF
    float camOriginDist = length(cameraPosition);
    float customFocusDist = (uCustomFunc == 0) ? max(6.0, camOriginDist + 1.5) : max(4.0, camOriginDist);
    float customFocusRange = (uCustomFunc == 0) ? 11.0 : 6.0;

    float fromFocusDist  = selectFloat(uFromMode, 15.0, 12.0, 22.0, customFocusDist);
    float toFocusDist    = selectFloat(uTargetMode, 15.0, 12.0, 22.0, customFocusDist);
    float fromFocusRange = selectFloat(uFromMode, 18.0, 22.0, 18.0, customFocusRange);
    float toFocusRange   = selectFloat(uTargetMode, 18.0, 22.0, 18.0, customFocusRange);
    float fromPointSize  = selectFloat(uFromMode, 120.0, 120.0, 130.0, uCustomPointSize);
    float toPointSize    = selectFloat(uTargetMode, 120.0, 120.0, 130.0, uCustomPointSize);

    float smoothProg = smoothstep(0.0, 1.0, uProgress);
    float focusDist  = mix(fromFocusDist, toFocusDist, smoothProg);
    float focusRange = mix(fromFocusRange, toFocusRange, smoothProg);
    float pointSize  = mix(fromPointSize, toPointSize, smoothProg);

    float depth = max(-mvPosition.z, 0.1);
    float distFromFocus = abs(depth - focusDist);
    float halfRange = focusRange * 0.5;
    vBlur = smoothstep(halfRange, halfRange + 8.0, distFromFocus);
    vAlpha = alpha;

    gl_Position = clipPos;
    float baseSize = clamp(pointSize / depth, 1.0, 40.0);
    gl_PointSize = clamp(baseSize * (1.0 + vBlur * 2.0), 1.0, 48.0);
}
