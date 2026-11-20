import { PORTFOLIO_DATA } from '../data/portfolio';
import type { FrameId } from '../data/portfolio';

interface HeroSectionProps {
  introReady: boolean;
  onNavigate: (id: FrameId) => void;
}

export function HeroSection({ introReady, onNavigate }: HeroSectionProps) {
  const { hero } = PORTFOLIO_DATA;

  return (
    <section id="hero" className="swiss-frame swiss-hero" data-frame="hero">
      <div className={`swiss-frame__inner swiss-hero__grid ${introReady ? 'is-visible' : ''}`}>
        <div className="swiss-hero__bottom">
          <div className="swiss-hero__title-col">
            <h1 className="swiss-display-title">
              {hero.headlineLines.map((line, idx) => (
                <span
                  key={line}
                  className="swiss-display-title__line"
                  style={{ transitionDelay: `${idx * 100 + 120}ms` }}
                >
                  {line}
                </span>
              ))}
            </h1>
          </div>

          <div className="swiss-hero__action-col">
            <button
              type="button"
              className="swiss-scroll-cue"
              onClick={() => onNavigate('profile')}
            >
              <span>SCROLL</span>
              <span className="swiss-scroll-cue__arrow" aria-hidden="true">
                ↓
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
