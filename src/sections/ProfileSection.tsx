import { useState } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolio';
import { TechLogo } from '../components/TechLogo';

export function ProfileSection() {
  const { profile } = PORTFOLIO_DATA;
  const [avatarError, setAvatarError] = useState(false);
  const [hobbyImgError, setHobbyImgError] = useState(false);

  const showAvatar = Boolean(profile.avatar) && !avatarError;
  const showHobbyImg = Boolean(profile.hobby.image) && !hobbyImgError;

  const subMeta = [profile.affiliation, profile.birthday].filter(Boolean).join('  /  ');

  return (
    <section id="profile" className="swiss-frame swiss-profile" data-frame="profile">
      <div className="swiss-frame__inner">
        <div className="swiss-profile__grid">
          {/* Left Column: Icon + Name + RealName + Affiliation/Birthday + Statement */}
          <div className="swiss-profile__left">
            <p className="swiss-section-label">PROFILE</p>

            <div className="swiss-profile__identity">
              <div className="swiss-avatar-frame">
                {showAvatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="swiss-avatar-frame__img"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="swiss-avatar-placeholder" aria-label="Icon Placeholder">
                    <span>ICON</span>
                  </div>
                )}
              </div>

              <div className="swiss-profile__names">
                <h2 className="swiss-profile__name">{profile.name}</h2>
                {profile.realName && (
                  <p className="swiss-profile__realname">{profile.realName}</p>
                )}
                {subMeta && <p className="swiss-profile__submeta">{subMeta}</p>}
              </div>
            </div>

            <p className="swiss-statement">{profile.statement}</p>
          </div>

          {/* Right Column: Skills (with logos) + Hobby (Photo left, text right) */}
          <div className="swiss-profile__right">
            <div className="swiss-profile__group">
              <h3 className="swiss-group-heading">SKILLS</h3>
              <ul className="swiss-skills-flat">
                {profile.skills.map((tech) => (
                  <li key={tech} className="swiss-skill-item">
                    <TechLogo name={tech} />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="swiss-profile__group">
              <h3 className="swiss-group-heading">HOBBY</h3>
              <div className="swiss-hobby-feature">
                {profile.hobby.image && (
                  <div className="swiss-hobby-photo">
                    {showHobbyImg ? (
                      <img
                        src={profile.hobby.image}
                        alt="Hobby"
                        className="swiss-hobby-photo__img"
                        loading="lazy"
                        onError={() => setHobbyImgError(true)}
                      />
                    ) : (
                      <div className="swiss-hobby-photo__placeholder">
                        <span>PHOTO</span>
                      </div>
                    )}
                  </div>
                )}
                <p className="swiss-hobby-feature__text">{profile.hobby.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
