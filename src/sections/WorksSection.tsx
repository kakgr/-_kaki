import { useState } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolio';

export function WorksSection() {
  const { works } = PORTFOLIO_DATA;
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <>
      {works.map((work, idx) => {
        const variantClass =
          idx === 0 ? 'is-layout-a' : idx === 1 ? 'is-layout-b' : 'is-layout-c';
        const showImage = Boolean(work.image) && !failedImages[work.id];

        return (
          <section
            key={work.id}
            id={work.frameId}
            className={`swiss-frame swiss-work-frame ${variantClass}`}
            data-frame={work.frameId}
          >
            <div className="swiss-frame__inner">
              <div className="swiss-work-spread">
                {/* 写真 */}
                <div className="swiss-work-spread__media">
                  <div className="swiss-media-frame">
                    {showImage ? (
                      <img
                        src={work.image}
                        alt={work.title}
                        className="swiss-media-frame__img"
                        loading="lazy"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [work.id]: true }))
                        }
                      />
                    ) : (
                      <div className="swiss-media-placeholder" aria-label={work.title}>
                        <div className="swiss-media-placeholder__crosshair" aria-hidden="true" />
                        <span className="swiss-media-placeholder__num">PHOTO {work.id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 見出し + 本文 */}
                <div className="swiss-work-spread__content">
                  <span className="swiss-work-spread__index">{work.id}</span>
                  <h2 className="swiss-work-spread__title">{work.title}</h2>
                  <p className="swiss-work-spread__body">{work.body}</p>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
