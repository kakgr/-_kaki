import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA_PRESETS } from './presets';
import type { SceneMode } from './presets';

const TRANSITION_DURATION = 2.6;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface SceneCameraProps {
  mode: SceneMode;
  interactive: boolean;
  resetSignal: number;
}

export function SceneCamera({ mode, interactive, resetSignal }: SceneCameraProps) {
  const { camera, gl } = useThree();

  const controlsRef = useRef<ThreeOrbitControls | null>(null);
  const currentBasePos = useRef(CAMERA_PRESETS[mode].position.clone());
  const currentTarget = useRef(CAMERA_PRESETS[mode].target.clone());
  const pointer = useRef({ x: 0, y: 0, smoothX: 0, smoothY: 0 });
  const isFirstMountRef = useRef(true);
  const interactiveRef = useRef(interactive);

  const transitionRef = useRef<{
    active: boolean;
    elapsed: number;
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toPos: THREE.Vector3;
    toTarget: THREE.Vector3;
  }>({
    active: false,
    elapsed: 0,
    fromPos: CAMERA_PRESETS[mode].position.clone(),
    fromTarget: CAMERA_PRESETS[mode].target.clone(),
    toPos: CAMERA_PRESETS[mode].position.clone(),
    toTarget: CAMERA_PRESETS[mode].target.clone(),
  });

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement);
    // OrbitControls disables browser gestures by default, including vertical scrolling.
    controls.domElement?.style.setProperty('touch-action', 'pan-y pinch-zoom');
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Keep mouse wheel free for vertical page scrolling
    controls.enableZoom = false;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.enabled = interactiveRef.current;
    controls.target.copy(currentTarget.current);
    controls.update();

    const onControlStart = () => {
      transitionRef.current.active = false;
    };
    controls.addEventListener('start', onControlStart);
    controlsRef.current = controls;

    return () => {
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl.domElement]);

  useEffect(() => {
    interactiveRef.current = interactive;
    if (controlsRef.current) {
      controlsRef.current.enabled = interactive;
    }
  }, [interactive]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  // Trigger smooth 2.6s preset transition on mode change, camera reset, or leaving playground
  useEffect(() => {
    const preset = CAMERA_PRESETS[mode];
    const controls = controlsRef.current;

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      currentBasePos.current.copy(preset.position);
      currentTarget.current.copy(preset.target);
      camera.position.copy(preset.position);
      if (controls) {
        controls.target.copy(preset.target);
        controls.update();
      } else {
        camera.lookAt(preset.target);
      }
      return;
    }

    transitionRef.current = {
      active: true,
      elapsed: 0,
      fromPos: camera.position.clone(),
      fromTarget: controls ? controls.target.clone() : currentTarget.current.clone(),
      toPos: preset.position.clone(),
      toTarget: preset.target.clone(),
    };
  }, [mode, resetSignal, interactive, camera]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const tr = transitionRef.current;
    const controls = controlsRef.current;

    if (tr.active) {
      tr.elapsed += dt;
      const rawT = Math.min(1, tr.elapsed / TRANSITION_DURATION);
      const eased = easeInOutCubic(rawT);

      currentBasePos.current.lerpVectors(tr.fromPos, tr.toPos, eased);
      currentTarget.current.lerpVectors(tr.fromTarget, tr.toTarget, eased);

      camera.position.copy(currentBasePos.current);
      if (controls) {
        controls.target.copy(currentTarget.current);
        controls.update();
      } else {
        camera.lookAt(currentTarget.current);
      }

      if (rawT >= 1) {
        tr.active = false;
      }
      return;
    }

    if (interactive && controls) {
      controls.update();
      currentBasePos.current.copy(camera.position);
      currentTarget.current.copy(controls.target);
      return;
    }

    // Gentle pointer parallax on non-interactive frames
    const lerpFactor = 1 - Math.exp(-3.5 * dt);
    pointer.current.smoothX += (pointer.current.x - pointer.current.smoothX) * lerpFactor;
    pointer.current.smoothY += (pointer.current.y - pointer.current.smoothY) * lerpFactor;

    camera.position.set(
      currentBasePos.current.x + pointer.current.smoothX * 0.75,
      currentBasePos.current.y - pointer.current.smoothY * 0.55,
      currentBasePos.current.z
    );
    camera.lookAt(currentTarget.current);
  });

  return null;
}
