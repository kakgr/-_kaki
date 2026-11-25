import { useState } from 'react';
import type {
  CustomFuncType,
  CustomNoiseType,
  CustomParams,
  SceneMode,
} from '../scene/presets';
import type { FrameId } from '../data/portfolio';

interface PlaygroundSectionProps {
  mode: SceneMode;
  customParams: CustomParams;
  onModeChange: (mode: SceneMode) => void;
  onCustomChange: (patch: Partial<CustomParams>) => void;
  onResetCustom: () => void;
  onResetCamera: () => void;
  onZoom: (delta: number) => void;
  onNavigate: (id: FrameId) => void;
}

const MODE_OPTIONS: { value: SceneMode; label: string }[] = [
  { value: 'custom', label: 'Custom' },
  { value: 'geometry', label: '立体' },
  { value: 'ribbons', label: '帯' },
  { value: 'ocean', label: '波' },
];

const FUNC_OPTIONS: { value: CustomFuncType; label: string }[] = [
  { value: 'wave', label: 'Wave' },
  { value: 'sphere', label: 'Sphere' },
  { value: 'torus', label: 'Torus' },
  { value: 'lissajous', label: 'Lissajous' },
  { value: 'helix', label: 'Helix' },
];

const NOISE_OPTIONS: { value: CustomNoiseType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fbm', label: 'FBM' },
  { value: 'gyroid', label: 'Gyroid' },
  { value: 'value3d', label: 'Value 3D' },
  { value: 'curl', label: 'Curl' },
];

export function PlaygroundSection({
  mode,
  customParams,
  onModeChange,
  onCustomChange,
  onResetCustom,
  onResetCamera,
  onZoom,
  onNavigate,
}: PlaygroundSectionProps) {
  const [controlsOpen, setControlsOpen] = useState(true);
  const isCustom = mode === 'custom';

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
          {/* Custom Function & Noise Controls (Open Swiss Strip) */}
          {isCustom && controlsOpen && (
            <div className="swiss-custom-dock">
              <div className="swiss-custom-selectors">
                <div className="swiss-selector-group">
                  <span className="swiss-selector-group__label">FUNCTION</span>
                  <div className="swiss-selector-group__items" role="group" aria-label="Base Function">
                    {FUNC_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`swiss-chip ${customParams.funcType === opt.value ? 'is-active' : ''}`}
                        onClick={() => onCustomChange({ funcType: opt.value })}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="swiss-selector-group">
                  <span className="swiss-selector-group__label">NOISE</span>
                  <div className="swiss-selector-group__items" role="group" aria-label="Noise Type">
                    {NOISE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`swiss-chip ${customParams.noiseType === opt.value ? 'is-active' : ''}`}
                        onClick={() => onCustomChange({ noiseType: opt.value })}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="swiss-reset-btn swiss-custom-default-btn"
                  onClick={onResetCustom}
                >
                  DEFAULT
                </button>
              </div>

              <div className="swiss-custom-sliders">
                <label className="swiss-slider">
                  <span className="swiss-slider__head">
                    <span>SPEED</span>
                    <span>{customParams.speed.toFixed(2)}×</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1.5}
                    step={0.05}
                    value={customParams.speed}
                    onChange={(e) => onCustomChange({ speed: Number(e.target.value) })}
                  />
                </label>

                <label className="swiss-slider">
                  <span className="swiss-slider__head">
                    <span>SHAPE</span>
                    <span>{customParams.shape.toFixed(1)}</span>
                  </span>
                  <input
                    type="range"
                    min={0.4}
                    max={5.0}
                    step={0.1}
                    value={customParams.shape}
                    onChange={(e) => onCustomChange({ shape: Number(e.target.value) })}
                  />
                </label>

                <label className="swiss-slider">
                  <span className="swiss-slider__head">
                    <span>NOISE AMP</span>
                    <span>{customParams.noiseAmp.toFixed(1)}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={4.0}
                    step={0.1}
                    value={customParams.noiseAmp}
                    onChange={(e) => onCustomChange({ noiseAmp: Number(e.target.value) })}
                  />
                </label>

                <label className="swiss-slider">
                  <span className="swiss-slider__head">
                    <span>NOISE FREQ</span>
                    <span>{customParams.noiseFreq.toFixed(2)}</span>
                  </span>
                  <input
                    type="range"
                    min={0.05}
                    max={1.2}
                    step={0.05}
                    value={customParams.noiseFreq}
                    onChange={(e) => onCustomChange({ noiseFreq: Number(e.target.value) })}
                  />
                </label>

                <label className="swiss-slider">
                  <span className="swiss-slider__head">
                    <span>SIZE</span>
                    <span>{Math.round(customParams.pointSize)}</span>
                  </span>
                  <input
                    type="range"
                    min={60}
                    max={180}
                    step={5}
                    value={customParams.pointSize}
                    onChange={(e) => onCustomChange({ pointSize: Number(e.target.value) })}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Main Mode & Camera Bar */}
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
              <span className="swiss-playground__hint">DRAG: MOVE / PINCH: ZOOM</span>
              <div className="swiss-zoom-group" role="group" aria-label="Camera Zoom">
                <button
                  type="button"
                  className="swiss-zoom-btn"
                  onClick={() => onZoom(1.4)}
                  aria-label="Zoom Out"
                >
                  −
                </button>
                <button
                  type="button"
                  className="swiss-zoom-btn"
                  onClick={() => onZoom(-1.4)}
                  aria-label="Zoom In"
                >
                  +
                </button>
              </div>
              {isCustom && (
                <button
                  type="button"
                  className="swiss-reset-btn"
                  onClick={() => setControlsOpen((v) => !v)}
                >
                  {controlsOpen ? 'HIDE' : 'CONTROLS'}
                </button>
              )}
              <button
                type="button"
                className="swiss-reset-btn"
                onClick={onResetCamera}
              >
                RESET CAMERA
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
