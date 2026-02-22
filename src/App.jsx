import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebase'
import AuthPage from './AuthPage'
import SubAdminDashboard from './SubAdminDashboard'
import AdminDashboard from './AdminDashboard'
import PlansPage from './PlansPage'
import LandingPage from './LandingPage'
import { Palette, Moon, Sun, Smartphone } from 'lucide-react'
import './index.css'

const ThemeToggle = ({ theme, setTheme }) => {
  const themes = ['blue', 'dark', 'white'];
  const currentIndex = themes.indexOf(theme);

  const toggleNext = () => {
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    if (theme === 'blue') return <Palette size={20} />;
    if (theme === 'dark') return <Moon size={20} />;
    return <Sun size={20} />;
  };

  const getLabel = () => {
    if (theme === 'blue') return 'Sky Theme';
    if (theme === 'dark') return 'Midnight';
    return 'Clean White';
  };

  return (
    <button
      className="floating-theme-toggle single-btn"
      onClick={toggleNext}
      title="Switch Theme"
    >
      <div className="toggle-inner">
        {getIcon()}
        <span className="toggle-text">{getLabel()}</span>
      </div>
    </button>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#fee2e2', color: '#991b1b', height: '100vh' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {

  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [initialAuthMode, setInitialAuthMode] = useState('login')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'blue')
  const [googleToken, setGoogleToken] = useState(localStorage.getItem('google_token'))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleGoogleAuth = async () => {
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      if (token) {
        setGoogleToken(token);
        localStorage.setItem('google_token', token);
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      alert("Failed to connect Google Sheets. Check your Firebase console settings.");
    }
  };

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Try to recover token from local storage
      const savedToken = localStorage.getItem('google_token');
      if (savedToken) setGoogleToken(savedToken);

      // Cleanup previous profile listener if it exists
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile sync error:", error);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-deep)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--border-glass)',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ThemeToggle theme={theme} setTheme={setTheme} />
      {(() => {
        if (!user) {
          if (showAuth) {
            return <AuthPage initialMode={initialAuthMode} onGoogleAuth={handleGoogleAuth} googleToken={googleToken} />
          }
          return (
            <LandingPage
              onGetStarted={() => {
                setInitialAuthMode('signup')
                setShowAuth(true)
              }}
              onLogin={() => {
                setInitialAuthMode('login')
                setShowAuth(true)
              }}
            />
          )
        }

        if (userProfile?.status === 'suspended') {
          return (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--bg-deep)'
            }}>
              <div style={{
                background: 'var(--bg-card)',
                padding: '3rem',
                borderRadius: '32px',
                boxShadow: 'var(--shadow-elevated)',
                border: '1px solid var(--border-glass)'
              }}>
                <h1 style={{ color: 'var(--error)', marginBottom: '1rem', fontWeight: '800' }}>Account Suspended</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your account has been suspended by the administrator. Please contact support.</p>
                <button
                  onClick={() => auth.signOut()}
                  style={{
                    padding: '0.85rem 2rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: 'var(--primary-glow)'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )
        }

        if (userProfile?.role === 'admin' || user?.email?.toLowerCase() === 'admin@gmail.com') {
          return <AdminDashboard user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={handleGoogleAuth} />
        }

        if (userProfile?.role === 'subadmin' || userProfile?.company) {
          if (userProfile?.credits <= 0 && userProfile?.plan === 'trial') {
            return <PlansPage userProfile={userProfile} setUserProfile={setUserProfile} />
          }
          return <SubAdminDashboard user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={handleGoogleAuth} />
        }

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            textAlign: 'center',
            background: 'var(--bg-deep)'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              padding: '3rem',
              borderRadius: '32px',
              boxShadow: 'var(--shadow-elevated)',
              border: '1px solid var(--border-glass)'
            }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: '800' }}>Security Check...</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Authorized access for {user?.email}...</p>
              <button
                onClick={() => auth.signOut()}
                style={{
                  padding: '0.85rem 2rem',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        )
      })()}
    </ErrorBoundary>
  )
}


export default App
