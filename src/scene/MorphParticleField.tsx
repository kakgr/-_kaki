import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from './shaders/morph.vert?raw';
import fragmentShader from './shaders/morph.frag?raw';

export type SceneMode = 'ocean' | 'geometry' | 'ribbons';

const MODE_INDEX: Record<SceneMode, number> = {
  ocean: 0,
  geometry: 1,
  ribbons: 2,
};

const PARTICLE_COUNT = 16000;
const TRANSITION_DURATION = 2.6;
const INTRO_DURATION = 3.0;

interface MorphParticleFieldProps {
  mode: SceneMode;
  onIntroReady?: () => void;
}

export function MorphParticleField({ mode, onIntroReady }: MorphParticleFieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const oceanTimeRef = useRef(0);
  const geoTimeRef = useRef(0);
  const ribbonTimeRef = useRef(0);
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
      uCount: { value: PARTICLE_COUNT },
      uProgress: { value: 1 },
      uIntro: { value: 0 },
      uFromMode: { value: MODE_INDEX[mode] },
      uTargetMode: { value: MODE_INDEX[mode] },
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
    const nextIndex = MODE_INDEX[mode];
    if (nextIndex === targetModeRef.current) return;

    fromModeRef.current = targetModeRef.current;
    targetModeRef.current = nextIndex;
    progressRef.current = 0;
  }, [mode]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    oceanTimeRef.current += dt * 0.3;  // 波 0.3x
    geoTimeRef.current += dt * 0.2;    // 立体 0.2x
    ribbonTimeRef.current += dt * 0.2; // 帯 0.2x

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
      mat.uniforms.uProgress.value = progressRef.current;
      mat.uniforms.uIntro.value = introRef.current;
      mat.uniforms.uFromMode.value = fromModeRef.current;
      mat.uniforms.uTargetMode.value = targetModeRef.current;
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
