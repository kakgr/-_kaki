import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { MorphParticleField } from './MorphParticleField';
import { SceneCamera } from './SceneCamera';
import { CAMERA_PRESETS } from './presets';
import type { SceneMode } from './presets';

interface ParticleCanvasProps {
  mode: SceneMode;
  interactive: boolean;
  resetSignal: number;
  onIntroReady?: () => void;
}

export function ParticleCanvas({
  mode,
  interactive,
  resetSignal,
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
        <MorphParticleField mode={mode} onIntroReady={onIntroReady} />
        <SceneCamera mode={mode} interactive={interactive} resetSignal={resetSignal} />
      </Canvas>
    </div>
  );
}
