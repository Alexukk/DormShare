import type { BottomNavItem } from '../../components/BottomNav/BottomNav'
import BottomNav from '../../components/BottomNav/BottomNav'
import { contributorsList } from './contributors'
import './AboutScreen.css'

type AboutScreenProps = {
  onBack: () => void
  onNavigate?: (item: BottomNavItem) => void
}

function AboutScreen({ onBack, onNavigate }: AboutScreenProps) {
  return (
    <main className="about-screen" aria-label="About DormShare">
      {/* Top Header Bar */}
      <header className="about-screen__topbar">
        <button
          type="button"
          className="about-screen__back-btn"
          onClick={onBack}
          aria-label="Back to profile"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            arrow_back
          </span>
        </button>
        <h1>About</h1>
      </header>

      {/* Brand Header Card */}
      <section className="about-screen__brand-card" aria-label="Brand introduction">
        <div className="about-screen__logo-container">
          <img src="/logo.png?v=3" alt="DormShare logo" className="about-screen__logo-img" />
        </div>
        <h2>DormShare</h2>
        <span className="about-screen__version">Version 1.2.0 (Stable)</span>

        <p className="about-screen__mission">
          DormShare is a hyper-local peer-to-peer campus marketplace designed by college students, for college students.
          We make it fast, secure, and completely free to buy, sell, barter, or loan items right in your dorm community.
        </p>
      </section>

      {/* Contributors Section */}
      <section className="about-screen__contributors" aria-label="Contributors">
        <h2>Built By</h2>
        <div className="about-screen__contributors-grid">
          {contributorsList.map((c) => (
            <div key={c.name} className="contributor-card">
              <div className="contributor-card__avatar">
                <span className="material-symbols-rounded" aria-hidden="true">
                  {c.icon}
                </span>
              </div>
              <div className="contributor-card__content">
                <div className="contributor-card__title-row">
                  <h3>{c.name}</h3>
                  {c.githubUrl && (
                    <a
                      href={c.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contributor-card__github-link"
                      aria-label={`${c.name}'s GitHub profile`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="github-icon"
                      >
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    </a>
                  )}
                </div>
                <span className="contributor-card__role">{c.role}</span>
                <p>{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Info */}
      <footer className="about-screen__meta-footer">
        <p>&copy; {new Date().getFullYear()} DormShare App. All rights reserved.</p>
        <p className="about-screen__tagline">Made with &hearts; for campus communities.</p>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav activeItem="profile" onSelect={onNavigate} />
    </main>
  )
}

export default AboutScreen
