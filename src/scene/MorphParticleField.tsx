import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from './shaders/morph.vert?raw';
import fragmentShader from './shaders/morph.frag?raw';
import {
  CUSTOM_FUNC_INDEX,
  CUSTOM_NOISE_INDEX,
  DEFAULT_CUSTOM_PARAMS,
} from './presets';
import type { CustomParams, SceneMode } from './presets';

const MODE_INDEX: Record<SceneMode, number> = {
  ocean: 0,
  geometry: 1,
  ribbons: 2,
  custom: 3,
};

const PARTICLE_COUNT = 16000;
const TRANSITION_DURATION = 2.6;
const INTRO_DURATION = 3.0;

interface MorphParticleFieldProps {
  mode: SceneMode;
  customParamsRef: RefObject<CustomParams>;
  onIntroReady?: () => void;
}

export function MorphParticleField({
  mode,
  customParamsRef,
  onIntroReady,
}: MorphParticleFieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const oceanTimeRef = useRef(0);
  const geoTimeRef = useRef(0);
  const ribbonTimeRef = useRef(0);
  const customTimeRef = useRef(0);
  const progressRef = useRef(1);
  const introRef = useRef(0);
  const introNotifiedRef = useRef(false);
  const fromModeRef = useRef<number>(MODE_INDEX[mode]);
  const targetModeRef = useRef<number>(MODE_INDEX[mode]);
  const isFirstMountRef = useRef(true);

  const { positions, particleIds } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const ids = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      ids[i] = i;
    }
    return { positions: pos, particleIds: ids };
  }, []);

  const uniforms = useMemo(
    () => ({
      uOceanTime: { value: 0 },
      uGeoTime: { value: 0 },
      uRibbonTime: { value: 0 },
      uCustomTime: { value: 0 },
      uCount: { value: PARTICLE_COUNT },
      uProgress: { value: 1 },
      uIntro: { value: 0 },
      uFromMode: { value: MODE_INDEX[mode] },
      uTargetMode: { value: MODE_INDEX[mode] },
      uCustomFunc: { value: CUSTOM_FUNC_INDEX[DEFAULT_CUSTOM_PARAMS.funcType] },
      uCustomNoise: { value: CUSTOM_NOISE_INDEX[DEFAULT_CUSTOM_PARAMS.noiseType] },
      uCustomShape: { value: DEFAULT_CUSTOM_PARAMS.shape },
      uCustomNoiseAmp: { value: DEFAULT_CUSTOM_PARAMS.noiseAmp },
      uCustomNoiseFreq: { value: DEFAULT_CUSTOM_PARAMS.noiseFreq },
      uCustomPointSize: { value: DEFAULT_CUSTOM_PARAMS.pointSize },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      fromModeRef.current = MODE_INDEX[mode];
      targetModeRef.current = MODE_INDEX[mode];
      progressRef.current = 1;
      return;
    }

    const prevIndex = targetModeRef.current;
    const nextIndex = MODE_INDEX[mode];
    if (nextIndex === prevIndex) return;

    // Seamless handoff between Ocean (0) and Custom Wave+FBM (3) when entering/leaving PlayGround
    const cp = customParamsRef.current;
    const isSeamlessWaveHandoff =
      ((prevIndex === 0 && nextIndex === 3) || (prevIndex === 3 && nextIndex === 0)) &&
      cp.funcType === 'wave' &&
      cp.noiseType === 'fbm';

    if (isSeamlessWaveHandoff) {
      if (nextIndex === 3) {
        customTimeRef.current = oceanTimeRef.current;
      } else {
        oceanTimeRef.current = customTimeRef.current;
      }
      fromModeRef.current = nextIndex;
      targetModeRef.current = nextIndex;
      progressRef.current = 1;
      return;
    }

    fromModeRef.current = prevIndex;
    targetModeRef.current = nextIndex;
    progressRef.current = 0;
  }, [mode, customParamsRef]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const cp = customParamsRef.current;

    oceanTimeRef.current += dt * 0.3;  // 波 0.3x
    geoTimeRef.current += dt * 0.2;    // 立体 0.2x
    ribbonTimeRef.current += dt * 0.2; // 帯 0.2x
    customTimeRef.current += dt * cp.speed;

    if (introRef.current < 1) {
      introRef.current = Math.min(1, introRef.current + dt / INTRO_DURATION);
      if (!introNotifiedRef.current && introRef.current >= 0.58) {
        introNotifiedRef.current = true;
        onIntroReady?.();
      }
    }

    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + dt / TRANSITION_DURATION);
    }

    const mat = materialRef.current;
    if (mat) {
      mat.uniforms.uOceanTime.value = oceanTimeRef.current;
      mat.uniforms.uGeoTime.value = geoTimeRef.current;
      mat.uniforms.uRibbonTime.value = ribbonTimeRef.current;
      mat.uniforms.uCustomTime.value = customTimeRef.current;
      mat.uniforms.uProgress.value = progressRef.current;
      mat.uniforms.uIntro.value = introRef.current;
      mat.uniforms.uFromMode.value = fromModeRef.current;
      mat.uniforms.uTargetMode.value = targetModeRef.current;

      mat.uniforms.uCustomFunc.value = CUSTOM_FUNC_INDEX[cp.funcType];
      mat.uniforms.uCustomNoise.value = CUSTOM_NOISE_INDEX[cp.noiseType];
      mat.uniforms.uCustomShape.value = cp.shape;
      mat.uniforms.uCustomNoiseAmp.value = cp.noiseAmp;
      mat.uniforms.uCustomNoiseFreq.value = cp.noiseFreq;
      mat.uniforms.uCustomPointSize.value = cp.pointSize;
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aParticleId" args={[particleIds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
