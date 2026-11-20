import { PORTFOLIO_DATA } from '../data/portfolio';
import type { FrameId } from '../data/portfolio';

interface ContactSectionProps {
  onNavigate: (id: FrameId) => void;
}

export function ContactSection({ onNavigate }: ContactSectionProps) {
  const { contact } = PORTFOLIO_DATA;

  return (
    <section id="contact" className="swiss-frame swiss-contact" data-frame="contact">
      <div className="swiss-frame__inner">
        <div className="swiss-contact__grid">
          {/* Left: Closing Greeting / 終わりの謝辞 */}
          <div className="swiss-contact__closing">
            <p className="swiss-section-label">CONTACT</p>
            <h2 className="swiss-closing-title">{contact.closingTitle}</h2>
            <p className="swiss-closing-message">{contact.closingMessage}</p>
          </div>

          {/* Right: Social Links (X, GitHub, Qiita) */}
          <div className="swiss-contact__links">
            <ul className="swiss-link-table">
              {contact.links.map((link) => (
                <li key={link.platform}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="swiss-link-row"
                  >
                    <span className="swiss-link-row__platform">{link.platform}</span>
                    <span className="swiss-link-row__handle">{link.handle}</span>
                    <span className="swiss-link-row__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gentle animated down-arrow cue guiding to PlayGround */}
        <div className="swiss-contact__next">
          <button
            type="button"
            className="swiss-down-cue"
            onClick={() => onNavigate('playground')}
            aria-label="PlayGroundへ進む"
          >
            <span className="swiss-down-cue__label">PlayGround</span>
            <span className="swiss-down-cue__arrow" aria-hidden="true">
              ↓
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
