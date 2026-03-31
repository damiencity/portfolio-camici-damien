import { useEffect, useRef, useState } from 'react';

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID || 'TON_ID';

export default function CalendlySection() {
  const calendlyInited = useRef(false);
  const [ready, setReady] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.Calendly) {
        clearInterval(interval);
        setReady(true);
      }
      if (attempts >= 30) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!ready || calendlyInited.current) return;
    const el = document.getElementById('calendly-embed');
    if (!el || !window.Calendly) return;
    calendlyInited.current = true;
    window.Calendly.initInlineWidget({
      url: 'https://calendly.com/damienk06/30min?hide_gdpr_banner=1&background_color=0d0d0d&text_color=ffffff&primary_color=f97316',
      parentElement: el,
    });
  }, [ready]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) setSent(true);
      else console.error('Formspree:', res.status, await res.text());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#0d0d0d', width: '100%' }}>
      <section id="calendly-section" aria-label="Contact" style={s.section}>

        {/* HEADER */}
        <div style={s.header}>
          <p style={s.eyebrow}>PRENDRE CONTACT</p>
          <h2 style={s.title}>
            Travaillons <span style={s.accent}>ensemble</span>
          </h2>
          <p style={s.subtitle}>
            Réserve un appel ou envoie-moi un message directement.
          </p>
        </div>

        {/* SPLIT */}
        <div style={s.grid}>

          {/* GAUCHE — Formulaire */}
          <div style={s.card}>
            <p style={s.cardEyebrow}>✉ Envoyer un message</p>
            {sent ? (
              <div style={s.success}>
                <span style={{ fontSize: '2rem' }}>✅</span>
                <p style={{ color: '#fff', marginTop: '12px', fontWeight: '600' }}>Message envoyé !</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '8px' }}>
                  Je reviens vers toi sous 24h.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={s.form}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Nom complet</label>
                  <input
                    style={s.input}
                    type="text"
                    required
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Email</label>
                  <input
                    style={s.input}
                    type="email"
                    required
                    placeholder="jean@exemple.fr"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Ton projet</label>
                  <textarea
                    style={{ ...s.input, height: '120px', resize: 'vertical' }}
                    required
                    placeholder="Décris ton projet en quelques lignes…"
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  />
                </div>
                <button type="submit" style={s.btn}>
                  Envoyer le message →
                </button>
                <p style={s.noRisk}>✓ Sans engagement · ✓ Réponse sous 24h</p>
              </form>
            )}
          </div>

          {/* DROITE — Calendly */}
          <div style={s.card}>
            <p style={s.cardEyebrow}>📅 Réserver un appel découverte</p>
            <div style={{ position: 'relative', flex: 1 }}>
              {!ready && (
                <div style={s.skeleton}>
                  <div style={s.spinner} />
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                    Chargement…
                  </p>
                </div>
              )}
              <div
                id="calendly-embed"
                style={{
                  width: '100%',
                  height: '600px',
                  opacity: ready ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

// ── STYLES ──────────────────────────────────────────
const s = {
  section: {
    padding: '80px 5vw',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.15em',
    color: '#F97316',
    marginBottom: '12px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: '700',
    color: '#fff',
    lineHeight: '1.15',
    marginBottom: '12px',
  },
  accent: { color: '#F97316' },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.5)',
    maxWidth: '420px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardEyebrow: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  btn: {
    background: '#F97316',
    color: '#000',
    fontWeight: '700',
    fontSize: '15px',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 24px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '4px',
    transition: 'opacity 0.2s',
  },
  noRisk: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  success: {
    textAlign: 'center',
    padding: '40px 0',
  },
  skeleton: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: 'transparent',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '2px solid rgba(249,115,22,0.2)',
    borderTop: '2px solid #F97316',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
