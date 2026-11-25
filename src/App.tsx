import { useCallback, useEffect, useRef, useState } from 'react';
import { ParticleCanvas } from './scene/ParticleCanvas';
import { DEFAULT_CUSTOM_PARAMS } from './scene/presets';
import type { CustomParams, SceneMode } from './scene/presets';
import { FRAMES } from './data/portfolio';
import type { FrameId } from './data/portfolio';
import { SwissChrome } from './components/SwissChrome';
import { HeroSection } from './sections/HeroSection';
import { ProfileSection } from './sections/ProfileSection';
import { WorksSection } from './sections/WorksSection';
import { PlaygroundSection } from './sections/PlaygroundSection';
import { ContactSection } from './sections/ContactSection';

const FRAME_MAP = new Map(FRAMES.map((f) => [f.id, f]));

export default function App() {
  const [activeFrame, setActiveFrame] = useState<FrameId>('hero');
  const [playgroundMode, setPlaygroundMode] = useState<SceneMode>('custom');
  const [customParams, setCustomParams] = useState<CustomParams>(DEFAULT_CUSTOM_PARAMS);
  const customParamsRef = useRef<CustomParams>(DEFAULT_CUSTOM_PARAMS);
  const [cameraResetSignal, setCameraResetSignal] = useState(0);
  const [zoomCommand, setZoomCommand] = useState({ id: 0, delta: 0 });
  const [introReady, setIntroReady] = useState(false);
  const dimmerRef = useRef<HTMLDivElement>(null);

  const currentMeta = FRAME_MAP.get(activeFrame) ?? FRAMES[0];
  const isPlayground = activeFrame === 'playground';
  const mode: SceneMode = isPlayground ? playgroundMode : currentMeta.mode;

  const handleIntroReady = useCallback(() => {
    setIntroReady(true);
  }, []);

  const handleNavigate = useCallback((id: FrameId) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleCustomChange = useCallback((patch: Partial<CustomParams>) => {
    setCustomParams((prev) => {
      const next = { ...prev, ...patch };
      customParamsRef.current = next;
      return next;
    });
  }, []);

  const handleResetCustom = useCallback(() => {
    customParamsRef.current = DEFAULT_CUSTOM_PARAMS;
    setCustomParams(DEFAULT_CUSTOM_PARAMS);
  }, []);

  const handleResetCamera = useCallback(() => {
    setCameraResetSignal((n) => n + 1);
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setZoomCommand((prev) => ({ id: prev.id + 1, delta }));
  }, []);

  useEffect(() => {
    let rafId = 0;
    let snapTimer = 0;
    let isAutoSnapping = false;
    let autoSnapClearTimer = 0;

    const getNearestFrame = () => {
      const scrollY = window.scrollY;
      let nearest = FRAMES[0];
      let nearestTop = 0;
      let minDist = Infinity;

      for (const frame of FRAMES) {
        const el = document.getElementById(frame.id);
        if (!el) continue;
        const top = el.offsetTop;
        const dist = Math.abs(scrollY - top);
        if (dist < minDist) {
          minDist = dist;
          nearest = frame;
          nearestTop = top;
        }
      }
      return { nearest, nearestTop, minDist };
    };

    const updateFrameAndDimmer = () => {
      rafId = 0;
      const vh = Math.max(1, window.innerHeight);
      const { nearest, minDist } = getNearestFrame();

      setActiveFrame((prev) => (prev === nearest.id ? prev : nearest.id));

      if (dimmerRef.current) {
        if (!introReady) {
          dimmerRef.current.style.opacity = '0';
        } else {
          const rawCloseness = Math.max(0, Math.min(1, 1 - minDist / (vh * 0.44)));
          const smooth = rawCloseness * rawCloseness * (3 - 2 * rawCloseness);
          dimmerRef.current.style.opacity = (smooth * nearest.dimMax).toFixed(3);
        }
      }
    };

    const cancelSnap = () => {
      if (snapTimer) {
        window.clearTimeout(snapTimer);
        snapTimer = 0;
      }
      isAutoSnapping = false;
    };

    const scheduleMagneticPull = () => {
      if (snapTimer) window.clearTimeout(snapTimer);
      if (isAutoSnapping) return;

      snapTimer = window.setTimeout(() => {
        snapTimer = 0;
        const vh = Math.max(1, window.innerHeight);
        const { nearestTop, minDist } = getNearestFrame();

        // Pull gently into the sweet spot only when very close (~11% of viewport height)
        if (minDist > 2 && minDist < vh * 0.11) {
          isAutoSnapping = true;
          window.scrollTo({ top: nearestTop, behavior: 'smooth' });
          if (autoSnapClearTimer) window.clearTimeout(autoSnapClearTimer);
          autoSnapClearTimer = window.setTimeout(() => {
            isAutoSnapping = false;
          }, 650);
        }
      }, 150);
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateFrameAndDimmer);
      }
      if (!isAutoSnapping) {
        scheduleMagneticPull();
      }
    };

    updateFrameAndDimmer();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('wheel', cancelSnap, { passive: true });
    window.addEventListener('touchstart', cancelSnap, { passive: true });
    window.addEventListener('pointerdown', cancelSnap, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', cancelSnap);
      window.removeEventListener('touchstart', cancelSnap);
      window.removeEventListener('pointerdown', cancelSnap);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (snapTimer) window.clearTimeout(snapTimer);
      if (autoSnapClearTimer) window.clearTimeout(autoSnapClearTimer);
    };
  }, [introReady]);

  return (
    <>
      <ParticleCanvas
        mode={mode}
        customParamsRef={customParamsRef}
        interactive={isPlayground}
        resetSignal={cameraResetSignal}
        zoomCommand={zoomCommand}
        onIntroReady={handleIntroReady}
      />

      <div ref={dimmerRef} className="frame-dimmer" aria-hidden="true" />

      <SwissChrome
        activeFrame={activeFrame}
        introReady={introReady}
        onNavigate={handleNavigate}
      />

      <main className="swiss-main">
        <HeroSection introReady={introReady} onNavigate={handleNavigate} />
        <ProfileSection />
        <WorksSection />
        <ContactSection onNavigate={handleNavigate} />
        <PlaygroundSection
          mode={playgroundMode}
          customParams={customParams}
          onModeChange={setPlaygroundMode}
          onCustomChange={handleCustomChange}
          onResetCustom={handleResetCustom}
          onResetCamera={handleResetCamera}
          onZoom={handleZoom}
          onNavigate={handleNavigate}
        />
      </main>
    </>
  );
}
