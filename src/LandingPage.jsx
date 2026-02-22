import React, { useState, useEffect } from 'react';
import { ArrowRight, Bot, PhoneCall, BarChart3, Clock, ShieldCheck, Zap } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted, onLogin }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="premium-loader">
          <div className="loader-inner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <div className="mesh-gradient"></div>

      <header className="landing-header glass-effect">
        <div className="logo-box" onClick={() => window.location.reload()}>
          <div className="logo-icon">
            <Bot size={24} color="white" />
          </div>
          <span className="logo-text">AutoConnect</span>
        </div>

        <nav className="nav-actions">
          <button className="login-link" onClick={onLogin}>Sign In</button>
          <button className="btn-primary" onClick={onGetStarted}>Get Started</button>
        </nav>
      </header>

      <main className="hero-wrapper">
        <div className="hero-content animate-fade">
          <div className="badge-ai">
            <Zap size={14} fill="currentColor" />
            <span>Next-Gen Voice AI</span>
          </div>

          <h1 className="hero-title">
            <span className="title-gradient">Scale your calls with</span><br />
            <span className="accent-gradient">Human-Like AI</span>
          </h1>

          <p className="hero-subtitle">
            Automate outbound leads, customer support, and appointment scheduling with 24/7 AI voice agents that sound exactly like humans.
          </p>

          <div className="hero-actions">
            <button className="btn-primary btn-lg" onClick={onGetStarted}>
              Start Building <ArrowRight size={20} />
            </button>
            <button className="btn-outline btn-lg" onClick={onLogin}>
              Watch Demo
            </button>
          </div>
        </div>

        <div className="hero-visual animate-slide">
          <div className="floating-card glass-effect animate-float">
            <div className="card-header">
              <PhoneCall size={18} color="#22d3ee" />
              <span>Active AI Call</span>
            </div>
            <div className="wave-container">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="wave-bar"></div>
              ))}
            </div>
            <div className="card-status">Analyzing Response...</div>
          </div>
        </div>
      </main>

      <section className="features-grid">
        {[
          {
            icon: <Bot size={28} />,
            title: 'Neural Voices',
            desc: 'Ultra-low latency voices that replicate human emotion and tone perfectly.'
          },
          {
            icon: <ShieldCheck size={28} />,
            title: 'Enterprise Security',
            desc: 'Bank-grade encryption for all customer interactions and lead data.'
          },
          {
            icon: <PhoneCall size={28} />,
            title: 'Instant Scaling',
            desc: 'Deploy 1,000+ AI agents simultaneously without any hardware setup.'
          }
        ].map((feature, index) => (
          <div key={index} className="feature-card glass-effect animate-fade">
            <div className="card-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </section>

      <footer className="landing-footer">
        <p>© 2026 AutoConnect AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

