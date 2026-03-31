import { useEffect, useRef, useState } from 'react';

export default function CalendlySection() {
  const widgetRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initWidget = () => {
      if (window.Calendly) {
        window.Calendly.initInlineWidget({
          url: 'https://calendly.com/damienk06/30min?hide_gdpr_banner=1&background_color=0a0a0a&text_color=ffffff&primary_color=f97316',
          parentElement: document.querySelector('.calendly-inline-widget'),
          prefill: {},
          utm: {},
        });
        setLoaded(true);
      }
    };

    // Script déjà chargé ?
    if (window.Calendly) {
      initWidget();
      return;
    }

    // Sinon charger le script puis init
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => {
      // Petit délai pour que Calendly s'initialise
      setTimeout(initWidget, 300);
    };
    document.head.appendChild(script);
  }, []);

  // Écoute la confirmation de réservation Calendly
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.event === 'calendly.event_scheduled') {
        // Analytics tracking (optionnel)
        console.log('✅ RDV réservé via Calendly', e.data.payload);
        // Tu peux ajouter ici : gtag, plausible, etc.
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ background: '#0a0a0a', width: '100%' }}>
      <section id="calendly-section" style={styles.section}>
      {/* Header section */}
      <div style={styles.header}>
        <p style={styles.eyebrow}>PRENDRE CONTACT</p>
        <h2 style={styles.title}>
          Réservons un appel
          <span style={styles.titleAccent}> découverte</span>
        </h2>
        <p style={styles.subtitle}>
          30 minutes pour discuter de ton projet. Sans engagement, sans prise de tête.
        </p>

        {/* Réducteurs d'anxiété */}
        <div style={styles.trustRow}>
          {['✓ Gratuit & sans engagement', '✓ Réponse sous 24h', '✓ Premier appel offert'].map((item) => (
            <span key={item} style={styles.trustBadge}>{item}</span>
          ))}
        </div>
      </div>

      {/* Widget Calendly */}
      <div style={styles.widgetWrapper}>
        {!loaded && (
          <div style={styles.skeleton}>
            <div style={styles.skeletonSpinner} />
            <p style={styles.skeletonText}>Chargement du calendrier…</p>
          </div>
        )}
        <div
          ref={widgetRef}
          className="calendly-inline-widget"
          style={{
            ...styles.widget,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />
      </div>
    </section>
    </div>
  );
}

// ---- STYLES ----
const styles = {
  section: {
    padding: '100px 5vw',
    maxWidth: '900px',
    margin: '0 auto',
    background: 'transparent',
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
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: '1.15',
    marginBottom: '16px',
  },
  titleAccent: {
    color: '#F97316',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.55)',
    maxWidth: '480px',
    margin: '0 auto 28px',
    lineHeight: '1.6',
  },
  trustRow: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  trustBadge: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    background: 'rgba(249,115,22,0.08)',
    border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: '20px',
    padding: '6px 14px',
  },
  widgetWrapper: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#0a0a0a',
  },
  skeleton: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: '#0a0a0a',
    zIndex: 1,
  },
  skeletonSpinner: {
    width: '32px',
    height: '32px',
    border: '2px solid rgba(249,115,22,0.2)',
    borderTop: '2px solid #F97316',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  skeletonText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.35)',
  },
  widget: {
    minWidth: '320px',
    height: '700px',
    width: '100%',
    display: 'block',
  },
};
