import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import SubAdminDashboard from './pages/SubAdminDashboard';
import PlansPage from './pages/PlansPage';
import { Zap } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState('login');
  const [googleToken, setGoogleToken] = useState<string | null>(localStorage.getItem('google_token'));

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) { setGoogleToken(token); localStorage.setItem('google_token', token); }
    } catch (error) {
      console.error("Google Auth Error:", error);
    }
  };

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const savedToken = localStorage.getItem('google_token');
      if (savedToken) setGoogleToken(savedToken);
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }
      if (currentUser) {
        unsubProfile = onSnapshot(doc(db, 'users', currentUser.uid), (userDoc) => {
          setUserProfile(userDoc.exists() ? userDoc.data() : null);
          setLoading(false);
        }, () => setLoading(false));
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => { unsubAuth(); if (unsubProfile) unsubProfile(); };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 animate-pulse">
          <Zap size={24} className="text-primary-foreground" />
        </div>
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return <AuthPage initialMode={initialAuthMode} onGoogleAuth={handleGoogleAuth} googleToken={googleToken} />;
    }
    return (
      <LandingPage
        onGetStarted={() => { setInitialAuthMode('signup'); setShowAuth(true); }}
        onLogin={() => { setInitialAuthMode('login'); setShowAuth(true); }}
      />
    );
  }

  if (userProfile?.status === 'suspended') {
    return (
      <div className="flex items-center justify-center h-screen bg-background p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <h1 className="text-xl font-bold font-display text-destructive mb-2">Account Suspended</h1>
          <p className="text-sm text-muted-foreground mb-6">Your account has been suspended. Contact support.</p>
          <button className="btn-gamma" onClick={() => auth.signOut()}>Logout</button>
        </div>
      </div>
    );
  }

  if (userProfile?.role === 'admin' || user?.email?.toLowerCase() === 'admin@gmail.com') {
    return <AdminDashboard user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={handleGoogleAuth} />;
  }

  if (userProfile?.role === 'subadmin' || userProfile?.company) {
    if (userProfile?.credits <= 0 && userProfile?.plan === 'trial') {
      return <PlansPage userProfile={userProfile} setUserProfile={setUserProfile} />;
    }
    return <SubAdminDashboard user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={handleGoogleAuth} />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-background p-4">
      <div className="glass-card p-8 text-center max-w-md">
        <h2 className="text-lg font-bold font-display text-foreground mb-2">Security Check...</h2>
        <p className="text-sm text-muted-foreground mb-6">Authorized access for {user?.email}</p>
        <button className="btn-gamma-outline" onClick={() => auth.signOut()}>Log Out</button>
      </div>
    </div>
  );
};

export default App;
