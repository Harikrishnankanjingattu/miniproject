import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Smartphone, Mail, Lock, Building2, Bot, Globe, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import './AuthPage.css';

const AuthPage = ({ initialMode = 'login', onGoogleAuth, googleToken }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          company,
          role: 'subadmin',
          status: 'active',
          leadsEnabled: true,
          campaignsEnabled: true,
          createdAt: new Date().toISOString()
        });
        setMessage({ type: 'success', text: 'Account created successfully!' });
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (onGoogleAuth) {
      await onGoogleAuth();
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          company: result.user.displayName || 'New Business',
          role: 'subadmin',
          status: 'active',
          leadsEnabled: true,
          campaignsEnabled: true,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      setMessage({ type: 'error', text: "Google Authentication failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-mesh-bg">
      <div className="auth-wrapper">
        <div className="auth-brand-side">
          <div className="brand-overlay"></div>
          <div className="brand-content">
            <div className="brand-badge reveal-up">Enterprise Edition</div>
            <h2 className="reveal-up delay-1">
              Next-Gen <br /><span>Voice Automation</span>
            </h2>
            <p className="reveal-up delay-2">
              Empower your sales pipeline with emotion-aware AI agents that talk like humans and close like experts.
            </p>

            <ul className="brand-features">
              <li className="reveal-up delay-2">
                <div className="feat-icon"><Bot size={18} /></div>
                <span>Emotion Detection Engine</span>
              </li>
              <li className="reveal-up delay-2">
                <div className="feat-icon"><Globe size={18} /></div>
                <span>12+ Global Accent Profiles</span>
              </li>
              <li className="reveal-up delay-2">
                <div className="feat-icon"><TrendingUp size={18} /></div>
                <span>Autonomous Lead Scoring</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-container glass-effect">
            <header className="auth-header">
              <div className="auth-logo-box">
                <Bot size={28} color="white" strokeWidth={2.5} />
              </div>
              <h1 className="auth-title">
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h1>
              <p className="auth-subtitle">
                {isLogin
                  ? 'Access your Master Console telemetry.'
                  : 'Establish your enterprise orchestration hub.'}
              </p>
            </header>

            {message.text && (
              <div className={`auth-message ${message.type} animate-fade`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleAuth} className="auth-form">
              {!isLogin && (
                <div className="form-group reveal-up delay-1">
                  <label>Business Entity</label>
                  <div className="input-container">
                    <Building2 className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. Nexus Global"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group reveal-up delay-1">
                <label>Admin Email</label>
                <div className="input-container">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="admin@nexus.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group reveal-up delay-2">
                <label>Access Key</label>
                <div className="input-container">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn reveal-up delay-3"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : (isLogin ? 'Initialize Session' : 'Create Master Account')}
                {!loading && <ArrowRight size={18} style={{ marginLeft: '8px' }} />}
              </button>

              <div className="auth-divider reveal-up delay-3">
                <span>or continue with</span>
              </div>

              <button
                type="button"
                className="google-auth-btn reveal-up delay-3"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                Google Workspace
              </button>
            </form>

            <div className="toggle-auth reveal-up delay-3">
              <p>
                {isLogin ? "New to AutoConnect?" : 'Already registered?'}
                <button type="button" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Request Access' : 'Return to Login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
