import { FRAMES } from '../data/portfolio';
import type { FrameId } from '../data/portfolio';

interface SwissChromeProps {
  activeFrame: FrameId;
  introReady: boolean;
  onNavigate: (id: FrameId) => void;
}

export function SwissChrome({ activeFrame, introReady, onNavigate }: SwissChromeProps) {
  return (
    <>
      {/* Subtle warm nostalgic vignette */}
      <div className="nostal-vignette" aria-hidden="true" />

      {/* Quiet right-edge frame ticks */}
      <nav
        className={`swiss-rail ${introReady ? 'is-visible' : ''}`}
        aria-label="Frame Navigation"
      >
        <div className="swiss-rail__dots">
          {FRAMES.map((frame) => {
            const isActive = frame.id === activeFrame;
            return (
              <button
                key={frame.id}
                type="button"
                className={`swiss-rail__tick ${isActive ? 'is-active' : ''}`}
                onClick={() => onNavigate(frame.id)}
                title={frame.label}
                aria-label={frame.label}
              />
            );
          })}
        </div>
      </nav>
    </>
  );
}
