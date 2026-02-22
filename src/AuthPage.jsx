import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Smartphone, Mail, Lock, Building2 } from 'lucide-react';
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
    <div className="auth-wrapper">
      <div className="auth-bg-decor"></div>

      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo-box">
            <Smartphone size={28} color="white" strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">
            {isLogin ? 'Sign in to account' : 'Create your account'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Welcome back! Please enter your details.'
              : 'Join our platform and start managing your business.'}
          </p>
        </div>

        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Company Name</label>
              <div className="input-container">
                <Building2 className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email address</label>
            <div className="input-container">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-container">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="google-auth-btn"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Sign in with Google
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
