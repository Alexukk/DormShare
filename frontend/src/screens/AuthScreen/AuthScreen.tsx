import { useState } from 'react'
import { useDormShare } from '../../data/DormShareContext'
import './AuthScreen.css'

type AuthTab = 'login' | 'register'

const universityOptions = [
  'UPB — National University of Science and Technology POLITEHNICA Bucharest (бывший University POLITEHNICA of Bucharest)',
  'UB — University of Bucharest',
  'ASE — Bucharest University of Economic Studies',
  'UMFCD — Carol Davila University of Medicine and Pharmacy',
  'USAMV — University of Agronomic Sciences and Veterinary Medicine of Bucharest',
  'UNATC — National University of Theatre and Film I.L. Caragiale',
  'UNARTE — National University of Arts Bucharest',
  'SNSPA — National University of Political Studies and Public Administration',
  'UNEFS — National University of Physical Education and Sport',
  'UTCB — Technical University of Civil Engineering Bucharest',
  'UAUIM — Ion Mincu University of Architecture and Urban Planning',
  'UNMB — National University of Music Bucharest',
]

function AuthScreen() {
  const { login, register, authError } = useDormShare()
  const [tab, setTab] = useState<AuthTab>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register fields
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regUniversity, setRegUniversity] = useState('')

  const displayError = localError || authError

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')
    if (!loginEmail || !loginPassword) {
      setLocalError('Please fill in all fields')
      return
    }
    setIsSubmitting(true)
    try {
      await login(loginEmail, loginPassword)
    } catch {
      // Error is set in context
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')
    if (!regUsername || !regEmail || !regPassword || !regUniversity) {
      setLocalError('Please fill in all fields')
      return
    }
    if (regPassword.length < 8) {
      setLocalError('Password must be at least 8 characters')
      return
    }
    setIsSubmitting(true)
    try {
      await register(regUsername, regEmail, regPassword, regUniversity)
    } catch {
      // Error is set in context
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-screen" aria-label="Authentication">
      <div className="auth-screen__container">
        {/* Logo / Brand */}
        <header className="auth-screen__brand">
          <div className="auth-screen__logo" aria-hidden="true">
            <span className="material-symbols-rounded">storefront</span>
          </div>
          <h1>DormShare</h1>
          <p>Buy, sell &amp; trade with campus students</p>
        </header>

        {/* Tab Switcher */}
        <div className="auth-screen__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'login'}
            className={`auth-screen__tab ${tab === 'login' ? 'auth-screen__tab--active' : ''}`}
            onClick={() => { setTab('login'); setLocalError(''); setShowLoginPassword(false); setShowRegPassword(false) }}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'register'}
            className={`auth-screen__tab ${tab === 'register' ? 'auth-screen__tab--active' : ''}`}
            onClick={() => { setTab('register'); setLocalError(''); setShowLoginPassword(false); setShowRegPassword(false) }}
          >
            Create Account
          </button>
        </div>

        {/* Error banner */}
        {displayError && (
          <div className="auth-screen__error" role="alert">
            <span className="material-symbols-rounded" aria-hidden="true">error</span>
            <span>{displayError}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form className="auth-screen__form" onSubmit={handleLogin}>
            <label className="auth-field">
              <span className="material-symbols-rounded" aria-hidden="true">mail</span>
              <input
                type="email"
                placeholder="Email address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="auth-field">
              <span className="material-symbols-rounded" aria-hidden="true">lock</span>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-field__toggle-password"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  {showLoginPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </label>
            <button
              type="submit"
              className="auth-screen__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-screen__spinner" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form className="auth-screen__form" onSubmit={handleRegister}>
            <label className="auth-field">
              <span className="material-symbols-rounded" aria-hidden="true">person</span>
              <input
                type="text"
                placeholder="Username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                autoComplete="username"
                minLength={3}
                maxLength={25}
                required
              />
            </label>
            <label className="auth-field">
              <span className="material-symbols-rounded" aria-hidden="true">mail</span>
              <input
                type="email"
                placeholder="Email address"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="auth-field">
              <span className="material-symbols-rounded" aria-hidden="true">lock</span>
              <input
                type={showRegPassword ? 'text' : 'password'}
                placeholder="Password (min 8 characters)"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="auth-field__toggle-password"
                onClick={() => setShowRegPassword(!showRegPassword)}
                aria-label={showRegPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  {showRegPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </label>
            <label className="auth-field">
              <span className="material-symbols-rounded" aria-hidden="true">school</span>
              <select
                value={regUniversity}
                onChange={(e) => setRegUniversity(e.target.value)}
                className={!regUniversity ? 'placeholder-selected' : ''}
                required
              >
                <option value="" disabled hidden>Select University</option>
                {universityOptions.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="auth-screen__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-screen__spinner" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        <footer className="auth-screen__footer">
          <p>Your campus marketplace, one tap away</p>
        </footer>
      </div>
    </main>
  )
}

export default AuthScreen
