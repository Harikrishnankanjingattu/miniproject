import React, { useState, useEffect } from 'react';
import { ArrowRight, Bot, PhoneCall, BarChart3, Clock } from 'lucide-react';

const LandingPage = ({ onGetStarted, onLogin }) => {
  const [loading, setLoading] = useState(true);

  // simulate loading (remove if you control loading from parent)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={styles.page}>
      <style>{keyframes + loaderCSS}</style>

      {/* LOADER OVERLAY */}
      {loading && (
        <div style={styles.loaderOverlay}>
          <div className="loader">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="text"><span>Loading</span></div>
            ))}
            <div className="line"></div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ ...styles.header, animation: 'fadeDown 0.8s ease' }}>
        <div style={styles.logoBox}>
          <div style={styles.logoIcon}><Bot size={26} color="white" /></div>
          <span style={styles.logoText}>AutoConnect</span>
        </div>
        <div style={styles.navBtns}>
          <button style={styles.linkBtn} onClick={onLogin}>Log in</button>
          <button style={styles.primaryBtn} onClick={onGetStarted}>Get Started</button>
        </div>
      </header>

      {/* HERO */}
      <main style={styles.heroWrap}>
        <div style={styles.heroText}>
          <div style={styles.badge}>⚡ ᴬᴵ ᴾᴼᵂᴱᴿᴱᴰ</div>

          <h1 style={styles.title}>
            Automate customer calls<br />
            <span style={styles.gradientText}>24/7 with AI</span>
          </h1>

          <p style={styles.subtitle}>
            Smart AI voice agents converting your leads nonstop.
          </p>

          <div style={styles.actions}>
            <button style={styles.primaryBtnLg} onClick={onGetStarted}>
              Get Started <ArrowRight size={18} />
            </button>
            <button style={styles.secondaryBtn} onClick={onLogin}>View Demo</button>
          </div>
        </div>

        {/* VISUAL */}
        <div style={styles.visual}>
          <div style={{ ...styles.glow, animation: 'pulse 4s infinite' }} />
          <div style={{ ...styles.glow, background: '#3b82f6', animation: 'pulse 6s infinite' }} />
        </div>
      </main>

      {/* FEATURES */}
      <section style={styles.features}>
        {[
          { icon: <PhoneCall />, title: 'AI Calls', desc: 'Natural human-like conversations' },
          { icon: <Clock />, title: '24/7 Online', desc: 'Never miss a customer call' },
          { icon: <BarChart3 />, title: 'Analytics', desc: 'Track conversion and performance' }
        ].map((f, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.cardIcon}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

/* ===== PAGE STYLES ===== */
const styles = {
  page: { minHeight: '100vh', background: '#050b1a', color: '#fff', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', padding: '20px 60px', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 },
  logoBox: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', padding: 10, borderRadius: 12 },
  logoText: { fontSize: 20, fontWeight: 700 },
  navBtns: { display: 'flex', gap: 12 },
  linkBtn: { background: 'transparent', border: 'none', color: '#cbd5f5', cursor: 'pointer' },
  primaryBtn: { background: 'linear-gradient(135deg,#2563eb,#06b6d4)', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: 10 },
  heroWrap: { display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '80px 60px', alignItems: 'center' },
  heroText: { animation: 'fadeUp 1s ease' },
  badge: { display: 'inline-block', marginBottom: 16, padding: '6px 14px', borderRadius: 999, background: '#0f1b3d', color: '#60a5fa' },
  title: { fontSize: 52, lineHeight: 1.1, marginBottom: 20 },
  gradientText: { background: 'linear-gradient(90deg,#3b82f6,#22d3ee)', WebkitBackgroundClip: 'text', color: 'transparent' },
  subtitle: { color: '#cbd5e1', maxWidth: 420 },
  actions: { display: 'flex', gap: 14, marginTop: 30 },
  primaryBtnLg: { display: 'flex', gap: 8, alignItems: 'center', padding: '14px 22px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#22d3ee)', color: '#fff' },
  secondaryBtn: { background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '14px 22px', borderRadius: 12 },
  visual: { position: 'relative', height: 360 },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.7, top: '20%', left: '30%' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 30, padding: '60px' },
  card: { background: 'rgba(255,255,255,0.04)', padding: 30, borderRadius: 20, animation: 'fadeUp 1.2s ease' },
  cardIcon: { color: '#60a5fa', marginBottom: 14 },

  /* loader overlay */
  loaderOverlay: {
    position: 'fixed',
    inset: 0,
    background: '#050b1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }
};

/* ===== ANIMATIONS ===== */
const keyframes = `
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1}}
@keyframes fadeDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
`;

/* ===== LOADER CSS ===== */
const loaderCSS = `
.loader{
--main-size:4em;--text-color:#fff;--shadow-color:#aaa;
display:flex;align-items:center;justify-content:center;
font-size:var(--main-size);font-weight:900;
width:7.3em;height:1em;position:relative;text-transform:uppercase;
}
.loader .text{position:absolute;white-space:nowrap}
.loader .text span{animation:scrolling 2s infinite linear;background:linear-gradient(to right,var(--text-color),var(--shadow-color));
background-size:200%;-webkit-background-clip:text;color:transparent}
@keyframes scrolling{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
.loader .line{position:absolute;bottom:-1em;width:2em;height:.05em;background:#fff;opacity:.3}
`;

export default LandingPage;
