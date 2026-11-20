import type { SceneMode } from '../scene/presets';
import type { FrameId } from '../data/portfolio';

interface PlaygroundSectionProps {
  mode: SceneMode;
  onModeChange: (mode: SceneMode) => void;
  onResetCamera: () => void;
  onNavigate: (id: FrameId) => void;
}

const MODE_OPTIONS: { value: SceneMode; label: string }[] = [
  { value: 'geometry', label: '立体' },
  { value: 'ribbons', label: '帯' },
  { value: 'ocean', label: '波' },
];

export function PlaygroundSection({
  mode,
  onModeChange,
  onResetCamera,
  onNavigate,
}: PlaygroundSectionProps) {
  return (
    <section
      id="playground"
      className="swiss-frame swiss-playground"
      data-frame="playground"
    >
      <div className="swiss-frame__inner swiss-playground__inner">
        <div className="swiss-playground__top">
          <h2 className="swiss-playground__title">PlayGround</h2>
          <p className="swiss-playground__subtitle">
            このパーティクル演出はフルスクラッチで作成しました。
          </p>
        </div>

        <div className="swiss-playground__bottom">
          <div className="swiss-playground__bar">
            <div className="swiss-playground__modes" role="group" aria-label="Particle Mode">
              {MODE_OPTIONS.map((opt) => {
                const isActive = opt.value === mode;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`swiss-mode-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => onModeChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="swiss-playground__actions">
              <span className="swiss-playground__hint">DRAG TO MOVE CAMERA</span>
              <button
                type="button"
                className="swiss-reset-btn"
                onClick={onResetCamera}
              >
                RESET
              </button>
              <button
                type="button"
                className="swiss-back-top"
                onClick={() => onNavigate('hero')}
              >
                <span>TOP</span>
                <span aria-hidden="true">↑</span>
              </button>
            </div>
          </div>

          <p className="swiss-copyright">© 2026 KAKI</p>
        </div>
      </div>
    </section>
  );
}
