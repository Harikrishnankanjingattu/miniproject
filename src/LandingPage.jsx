import React, { useState } from 'react';
import {
  Bot, Globe, MessageSquare, Database, Calendar, ShieldCheck,
  TrendingUp, CheckCircle, ChevronRight, Hospital, GraduationCap,
  Store, Leaf, Briefcase, Mail, Github, Twitter, Linkedin, ExternalLink, Play,
  List, X
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted, onLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`landing-page ${mobileMenuOpen ? 'menu-open' : ''}`}>
      {/* Navigation Header */}
      <header className="lp-header">
        <div className="lp-logo" onClick={() => window.scrollTo(0, 0)}>
          <Bot size={28} />
          <span>AutoConnect AI</span>
        </div>

        {/* Desktop Nav */}
        <nav className="lp-nav desktop-only">
          <button onClick={() => document.getElementById('features').scrollIntoView()}>Features</button>
          <button onClick={() => document.getElementById('how-it-works').scrollIntoView()}>Process</button>
          <button onClick={() => document.getElementById('industries').scrollIntoView()}>Industries</button>
          <button onClick={onLogin}>Sign In</button>
          <button className="lp-btn-primary" onClick={onGetStarted}>Get Started</button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <List size={28} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <nav className="mobile-nav-menu" onClick={e => e.stopPropagation()}>
          <button onClick={() => { document.getElementById('features').scrollIntoView(); setMobileMenuOpen(false); }}>Features</button>
          <button onClick={() => { document.getElementById('how-it-works').scrollIntoView(); setMobileMenuOpen(false); }}>Process</button>
          <button onClick={() => { document.getElementById('industries').scrollIntoView(); setMobileMenuOpen(false); }}>Industries</button>
          <div className="mobile-nav-auth">
            <button onClick={() => { onLogin(); setMobileMenuOpen(false); }}>Sign In</button>
            <button className="lp-btn-primary" onClick={() => { onGetStarted(); setMobileMenuOpen(false); }}>Get Started</button>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="animate-fade-in">
          <div className="hero-tagline">Intelligent Sales Automation</div>
          <h1 className="hero-title">AI Sales & Lead<br />Outreach Agent</h1>
          <p className="hero-subtext">
            Automate multilingual lead conversations using emotion-aware AI voice agents.
            Improve customer engagement and conversion with intelligent voice automation.
          </p>
          <div className="hero-btns">
            <button className="lp-btn-primary lp-btn-lg" onClick={onGetStarted}>
              Get Started
            </button>
            <button className="lp-btn-outline lp-btn-lg" onClick={() => {/* demo logic */ }}>
              Request Demo
            </button>
          </div>
        </div>

        <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="analytics-mock">
            <div className="mock-header">
              <div>
                <h3 style={{ margin: 0 }}>System Overview</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.5, margin: '4px 0 0' }}>Real-time outreach tracking</p>
              </div>
              <Bot size={24} color="#3b82f6" />
            </div>
            <div className="mock-stats-grid">
              <div className="mock-stat-card">
                <span>Total Calls</span>
                <h4>1,284</h4>
              </div>
              <div className="mock-stat-card">
                <span>Hot Leads</span>
                <h4>342</h4>
              </div>
              <div className="mock-stat-card">
                <span>Conversion</span>
                <h4>24.8%</h4>
              </div>
            </div>
            <div className="mock-charts">
              <div className="mock-chart-placeholder">
                <TrendingUp size={48} />
              </div>
              <div className="mock-chart-placeholder">
                <MessageSquare size={48} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Advanced AI Capabilities</h2>
          <p>Powerful features tailored for enterprise outreach and scaling.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Globe size={24} /></div>
            <h3>Multilingual Voice</h3>
            <p>Conduct natural, human-like conversations in multiple regional languages with perfect accent and tone.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Bot size={24} /></div>
            <h3>Emotion Detection</h3>
            <p>Analyzes sentiment and emotional cues to adjust tone and strategy in real-time during conversations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><TrendingUp size={24} /></div>
            <h3>AI Lead Scoring</h3>
            <p>Automatically qualifies and ranks leads based on interaction depth and intent signal metrics.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Database size={24} /></div>
            <h3>Sheets CRM Sync</h3>
            <p>Real-time bidirectional synchronization with Google Sheets for seamless lead management.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Calendar size={24} /></div>
            <h3>Smart Scheduling</h3>
            <p>Automatically books follow-ups or meetings directly during the AI-driven voice interaction.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={24} /></div>
            <h3>Context Memory</h3>
            <p>Remembers previous interactions and customer preferences for deeply personalized follow-up calls.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to automate your entire outreach pipeline.</p>
        </div>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <h3>Upload Leads</h3>
            <p>Import your lead list directly via CSV or our native Google Sheets integration.</p>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h3>AI Voice Calls</h3>
            <p>Our intelligent agents conduct empathic, context-aware conversations at scale.</p>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h3>Score & Schedule</h3>
            <p>Leads are automatically scored and follow-ups are scheduled in your CRM.</p>
          </div>
        </div>
      </section>

      {/* Industry Use Cases */}
      <section id="industries" className="industries-section">
        <div className="section-header">
          <h2>Tailored for Your Industry</h2>
          <p>Trusted across various sectors to handle complex outreach needs.</p>
        </div>
        <div className="use-cases-grid">
          <div className="use-case-card">
            <div className="feature-icon" style={{ margin: '0 auto 1rem' }}><Briefcase size={20} /></div>
            <h3>BFSI</h3>
          </div>
          <div className="use-case-card">
            <div className="feature-icon" style={{ margin: '0 auto 1rem' }}><GraduationCap size={20} /></div>
            <h3>EdTech</h3>
          </div>
          <div className="use-case-card">
            <div className="feature-icon" style={{ margin: '0 auto 1rem' }}><Hospital size={20} /></div>
            <h3>Healthcare</h3>
          </div>
          <div className="use-case-card">
            <div className="feature-icon" style={{ margin: '0 auto 1rem' }}><Store size={20} /></div>
            <h3>Retail</h3>
          </div>
          <div className="use-case-card">
            <div className="feature-icon" style={{ margin: '0 auto 1rem' }}><Leaf size={20} /></div>
            <h3>Agriculture</h3>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="integrations-section">
        <div className="section-header">
          <h2>Seamless Integrations</h2>
          <p>Powered by world-class technology partners.</p>
        </div>
        <div className="logos-grid">
          <div className="lp-logo"><Database size={20} /> Firebase</div>
          <div className="lp-logo"><Bot size={20} /> Gemini AI</div>
          <div className="lp-logo"><MessageSquare size={20} /> n8n</div>
          <div className="lp-logo"><Database size={20} /> Google Sheets</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="footer-brand">
          <h2>AutoConnect AI</h2>
          <p>Empowering businesses with intelligent, emotion-aware voice agents for the next generation of sales and outreach.</p>
          <div className="social-links">
            <Twitter className="social-icon" />
            <Linkedin className="social-icon" />
            <Github className="social-icon" />
          </div>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li>Features</li>
            <li>Pricing</li>
            <li>Integrations</li>
            <li>Live Demo</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li>API Docs</li>
            <li>Legal</li>
            <li>Privacy Policy</li>
            <li>Contact Support</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
