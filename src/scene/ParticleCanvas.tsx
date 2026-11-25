import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { MorphParticleField } from './MorphParticleField';
import { SceneCamera } from './SceneCamera';
import { CAMERA_PRESETS } from './presets';
import type { CustomParams, SceneMode } from './presets';

interface ParticleCanvasProps {
  mode: SceneMode;
  customParamsRef: RefObject<CustomParams>;
  interactive: boolean;
  resetSignal: number;
  zoomCommand: { id: number; delta: number };
  onIntroReady?: () => void;
}

export function ParticleCanvas({
  mode,
  customParamsRef,
  interactive,
  resetSignal,
  zoomCommand,
  onIntroReady,
}: ParticleCanvasProps) {
  const [isVisible, setIsVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden
  );

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const initialPos = CAMERA_PRESETS.geometry.position;

  return (
    <div
      className={`particle-stage ${interactive ? 'is-interactive' : ''}`}
      aria-hidden={!interactive}
    >
      <Canvas
        dpr={1}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{
          position: [initialPos.x, initialPos.y, initialPos.z],
          fov: 50,
        }}
      >
        <MorphParticleField
          mode={mode}
          customParamsRef={customParamsRef}
          onIntroReady={onIntroReady}
        />
        <SceneCamera
          mode={mode}
          interactive={interactive}
          resetSignal={resetSignal}
          zoomCommand={zoomCommand}
        />
      </Canvas>
    </div>
  );
}
