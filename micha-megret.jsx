import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import HeroBackground from "./components/HeroBackground.jsx";
import HeroSplineLayer from "./components/HeroSplineLayer.jsx";
import { AnimatedButton } from "./components/AnimatedButton.jsx";
import Magnetic from "./components/Magnetic.jsx";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
/* Moins de travail pendant le scroll ; resize mobile iOS moins agressif */
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });

const navBarVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 220, damping: 28, mass: 0.85 },
  },
};

const navStaggerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const navBarItemVariants = {
  hidden: { y: -20, opacity: 0, filter: "blur(4px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 240, damping: 28, mass: 0.8 },
  },
};

// ─── CSS injected via style tag ───────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* Palette : Dark #000 · Orange accent #ED8223 · White 100% · White 80% */
  --orange: #ed8223;
  --black: #000000;
  --white: #ffffff;
  --bg: var(--black);
  --surface-dark: #0f0f0f;
  --surface-orange: var(--orange);
  --dark: var(--black);
  --accent: var(--orange);
  --text: var(--white);
  --text-muted: rgba(255, 255, 255, 0.8);
  --text-on-orange: var(--black);
  --border: rgba(255, 255, 255, 0.12);
  --neutral-300: rgba(255, 255, 255, 0.35);
  --neutral-950: var(--black);
  --orange-rgb: 237, 130, 35;
  /* Motion : courbes et durées cohérentes sur le site */
  --ease-fluid: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-soft: cubic-bezier(0.33, 1, 0.68, 1);
  --duration-reveal: 0.95s;
  --duration-reveal-lg: 1.1s;
  /* Typo type mockup (Inter / Geist / SF Pro) */
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  /* Dégradé vertical : noir → brun chocolat → ambre (réf. maquette) */
  --grad-page: linear-gradient(
    180deg,
    #000000 0%,
    #070504 14%,
    #110c09 30%,
    #1a120e 46%,
    #261a14 60%,
    #352218 72%,
    #4a2c14 84%,
    #5c3414 92%,
    #7e3f12 100%
  );
  /* Noir au centre → transparent : fait ressortir le texte (effet « spot » sur le dégradé) */
  --grad-center-dark: radial-gradient(
    ellipse 115% 90% at 50% 28%,
    rgba(0, 0, 0, 0.94) 0%,
    rgba(0, 0, 0, 0.78) 32%,
    rgba(0, 0, 0, 0.5) 52%,
    rgba(0, 0, 0, 0.22) 72%,
    rgba(0, 0, 0, 0) 100%
  );
}

html {
  min-height: 100%;
  min-height: -webkit-fill-available;
  background-color: #7e3f12;
}

@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}

body {
  font-family: var(--font-ui);
  color: var(--text);
  background-color: #000000;
  background-image: var(--grad-center-dark), var(--grad-page);
  background-attachment: scroll, scroll;
  background-repeat: no-repeat, no-repeat;
  background-size: 100% 100%, 100% 100%;
  overflow-x: hidden;
  letter-spacing: -0.02em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  min-height: 100dvh;
  min-height: -webkit-fill-available;
  -webkit-tap-highlight-color: rgba(237, 130, 35, 0.15);
}

/* ── MASKED TEXT EFFECT ── */
.text-mask-wrap { position: relative; display: block; }
.text-ghost { color: var(--neutral-300); display: block; }
.hero .text-ghost { color: rgba(255, 255, 255, 0.22); }
.hero .text-live { color: #fff; }
.text-live {
  position: absolute; inset: 0; display: block;
  -webkit-mask-image: linear-gradient(90deg, rgb(0,0,0) 102%, rgba(0,0,0,0) 110%);
  mask-image: linear-gradient(90deg, rgb(0,0,0) 102%, rgba(0,0,0,0) 110%);
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  -webkit-mask-clip: border-box; mask-clip: border-box;
  -webkit-mask-size: 100% 54px; mask-size: 100% 54px;
  -webkit-mask-position: 0px -1px; mask-position: 0px -1px;
}
/* Titres de section : le ghost ne doit pas se voir (sinon double ligne sur fond sombre) */
.section-title .text-ghost { opacity: 0; }

/* ── NAV (bandeau orange — effet magnetic + entrée motion sur la barre) ── */
.nav-wrap-outer {
  position: fixed;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  max-width: 1440px;
  z-index: 50;
  pointer-events: none;
}
.nav-wrap-outer .nav-wrap { pointer-events: auto; }
.nav-wrap {
  width: 100%;
  background: rgba(var(--orange-rgb), 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.2),
    0 8px 32px rgba(var(--orange-rgb), 0.18);
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.nav-inner {
  display: flex; justify-content: space-between; align-items: center;
  height: 72px; padding: 0 40px;
}
.nav-logo-slot, .nav-cta-slot { display: flex; align-items: center; }
.nav-logo {
  display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text-on-orange);
  position: relative; overflow: hidden; border-radius: 9999px;
}
.nav-logo::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent 55%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.nav-logo:hover::after { opacity: 1; }
.nav-logo svg { flex-shrink: 0; position: relative; z-index: 1; }
.nav-logo span { font-family: var(--font-ui); font-size: 17px; font-weight: 600; line-height: 1; letter-spacing: -0.03em; text-transform: lowercase; position: relative; z-index: 1; }
.nav-links { display: flex; align-items: center; gap: 4px; }
.nav-link-wrap { position: relative; border-radius: 9999px; }
.nav-link-pill {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.1);
  z-index: 0;
}
.nav-link-inner {
  position: relative;
  z-index: 1;
  display: block;
  font-weight: 500;
  font-size: 15px;
  text-decoration: none;
  color: var(--text-on-orange);
  padding: 8px 12px;
  border-radius: 9999px;
}
.nav-link-inner:focus-visible {
  outline: 2px solid rgba(0, 0, 0, 0.4);
  outline-offset: 2px;
}
.nav-cta {
  background: var(--black); color: var(--orange); text-decoration: none;
  font-weight: 600; font-size: 13px; padding: 10px 20px;
  border-radius: 9999px; transition: opacity .15s, transform .15s;
}
.nav-cta:hover { opacity: .92; }

/* ── HERO ── */
.hero {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding-top: 104px;
  display: flex;
  flex-direction: column;
}
.hero-background-wrap {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.hero-background-wrap canvas { display: block; width: 100%; height: 100%; }
/* Spline WebGL au-dessus du canvas 2D — pas d’interaction (évite de bloquer le hero) */
.hero-spline-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.hero-spline-layer canvas {
  pointer-events: none !important;
}
/* Espace réservé pendant le chargement async de @splinetool/react-spline (Suspense) */
.hero-placeholder {
  width: 100%;
  height: 100%;
  min-height: 100%;
}
.hero-stack {
  position: relative;
  z-index: 10;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px 16px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}
/* Carrousel circulaire sous le bloc titre (au-dessus du fond, sous le texte) */
.hero-carousel {
  flex: 1;
  min-height: 560px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.carousel-pivot-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(70px);
}
.carousel-pivot {
  position: relative;
  width: 1280px;
  height: 1280px;
  transform-origin: center center;
  will-change: transform;
}
.carousel-card { position: absolute; left: 50%; top: 50%; }
.carousel-card-inner {
  width: 480px;
  transform-origin: center center;
}
.carousel-card-img-wrap {
  background: var(--surface-dark);
  aspect-ratio: 3/2;
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.35),
    0 12px 40px rgba(0, 0, 0, 0.55),
    0 0 48px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(var(--orange-rgb), 0.22);
}
.carousel-card-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.06);
  transform-origin: center center;
}
.hero-title-main {
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: #fff;
}
.hero-title-sub {
  font-size: clamp(1.35rem, 4.5vw, 2.25rem);
  font-weight: 700;
  line-height: 1.2;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.2);
}
.hero-cta-page {
  margin-top: 32px;
  padding: 16px 32px;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 16px;
  color: var(--text-on-orange);
  background: #e8730a;
  border: none;
  cursor: pointer;
  font-family: var(--font-ui);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: opacity 0.15s, transform 0.15s;
}
.hero-cta-page:hover { opacity: 0.98; }
.hero-cta-page:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.95);
  outline-offset: 3px;
}
.hero-content { max-width: 896px; margin: 0 auto; text-align: center; padding: 88px 32px 0; position: relative; z-index: 10; }
.hero-h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 500; line-height: 1.12; letter-spacing: -0.035em; margin-bottom: 20px; color: #fff; }
.hero-p { color: var(--text-muted); font-weight: 400; line-height: 1.45; letter-spacing: -0.025em; margin-bottom: 28px; max-width: 700px; margin-left: auto; margin-right: auto; }
.hero-btns { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
.btn-dark { background: var(--surface-orange); color: var(--text-on-orange); text-decoration: none; font-weight: 600; padding: 14px 24px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 8px; transition: opacity .15s, transform .15s; }
.btn-dark:hover { opacity: .98; }
.btn-dark:focus-visible {
  outline: 2px solid rgba(var(--orange-rgb), 0.95);
  outline-offset: 3px;
}
.btn-ghost { font-weight: 500; text-decoration: none; color: #fff; padding: 14px 24px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255, 255, 255, 0.35); transition: background .15s, border-color .15s; }
.btn-ghost:hover { background: rgba(0, 0, 0, 0.25); border-color: rgba(255, 255, 255, 0.5); }
.btn-accent { background: var(--surface-dark); color: var(--accent); text-decoration: none; font-weight: 600; padding: 14px 24px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255, 255, 255, 0.12); }

/* ── SECTIONS ── */
section { width: 100%; }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.container-md { max-width: 960px; margin: 0 auto; padding: 0 24px; }

.section-label {
  display: inline-block; background: var(--surface-orange); color: var(--text-on-orange);
  font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 9999px;
  margin-bottom: 16px; line-height: 1.43; letter-spacing: 0.02em;
}
.section-label-white { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.88); }
.section-label-dark { background: rgba(255,255,255,.1); color: rgba(255,255,255,.7); }

/* AnimatedButton : reflet + contenu au-dessus */
.animated-button {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  cursor: inherit;
}
button.animated-button:not(:disabled),
a.animated-button {
  cursor: pointer;
}
.animated-button__sheen {
  pointer-events: none;
  position: absolute;
  inset: -1px;
  z-index: 0;
  background: linear-gradient(
    105deg,
    transparent 36%,
    rgba(255, 255, 255, 0.42) 50%,
    transparent 64%
  );
  transform: translateX(-120%);
  opacity: 0;
  transition: opacity 0.35s ease, transform 0s 0.5s;
}
.animated-button:hover .animated-button__sheen,
.animated-button:focus-visible .animated-button__sheen {
  opacity: 1;
  transform: translateX(120%);
  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (prefers-reduced-motion: reduce) {
  .animated-button__sheen { display: none; }
}
.animated-button > :not(.animated-button__sheen) {
  position: relative;
  z-index: 1;
}
button.animated-button:focus-visible,
a.animated-button:focus-visible {
  outline: 2px solid rgba(var(--orange-rgb), 0.95);
  outline-offset: 3px;
}

/* ── Accessibilité : lien d’évitement + focus clavier visibles ── */
.skip-link {
  position: absolute;
  top: -120px;
  left: 16px;
  z-index: 100;
  padding: 12px 20px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  background: var(--surface-orange);
  color: var(--black);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  transition: top 0.2s var(--ease-fluid);
}
.skip-link:focus {
  outline: none;
}
.skip-link:focus-visible {
  top: max(12px, env(safe-area-inset-top, 0px));
  outline: 3px solid var(--white);
  outline-offset: 2px;
}
.main-content {
  outline: none;
}
.main-content:focus {
  outline: 3px solid var(--accent);
  outline-offset: 6px;
}
.nav-logo:focus-visible {
  outline: 2px solid rgba(0, 0, 0, 0.45);
  outline-offset: 3px;
  border-radius: 12px;
}
.contact-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}
.service-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}
.footer-links a:focus-visible,
.footer-social:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}

.section-title { font-size: 38px; font-weight: 500; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 18px; color: var(--text); }
.section-title-lg { font-size: 48px; }
.section-title-sm { font-size: 32px; }
.section-desc { font-weight: 400; line-height: 1.5; letter-spacing: -0.02em; color: var(--text-muted); }

/* ── APPROACH ── */
.approach {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 96px 0 72px;
  margin-top: -720px;
  position: relative;
  z-index: 5;
}
.approach-grid { display: grid; grid-template-columns: 2fr 3fr; gap: 48px; align-items: start; }
.step { display: flex; gap: 16px; margin-bottom: 20px; }
.step-icon { width: 40px; height: 40px; min-width: 40px; background: var(--dark); border-radius: 9999px; display: flex; align-items: center; justify-content: center; }
.step-icon svg { color: white; }
.step h3 { font-size: 16px; font-weight: 500; margin-bottom: 4px; color: #fff; }
.step p { font-size: 14px; font-weight: 300; color: var(--text-muted); line-height: 1.625; }

/* ── SERVICES ── */
.services { background: transparent; padding: 160px 0 96px; }
.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 52px; }
.service-card {
  background: var(--surface-dark); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px;
  padding: 26px; display: flex; flex-direction: column;
}
.service-card-icon { width: 40px; height: 40px; background: rgba(var(--orange-rgb), 0.18); border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px solid rgba(var(--orange-rgb), 0.4); }
.service-card h3 { font-size: 20px; font-weight: 500; margin-bottom: 12px; line-height: 1.4; color: #fff; }
.service-card p { font-size: 15px; font-weight: 300; color: var(--text-muted); line-height: 1.625; margin-bottom: 20px; }
.service-list { list-style: none; margin-bottom: 24px; flex: 1; }
.service-list li { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 300; margin-bottom: 8px; }
.service-list li::before { content: ''; width: 4px; height: 4px; background: var(--orange); border-radius: 50%; flex-shrink: 0; }
.service-link { color: var(--accent); font-size: 14px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
.service-link:hover { text-decoration: underline; }

/* ── ABOUT ── */
.about { background: transparent; padding: 96px 0; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
.about-img-wrap { position: relative; }
/* Dégradé du site derrière le portrait ; lighten = fond noir « mat » laisse passer le dégradé si le PNG n’a pas d’alpha */
.about-img {
  aspect-ratio: 9/11;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  isolation: isolate;
  background-color: #000000;
  background-image: var(--grad-center-dark), var(--grad-page);
  background-attachment: scroll, scroll;
  background-repeat: no-repeat, no-repeat;
  background-size: 100% 100%, 100% 100%;
}
.about-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  display: block;
  mix-blend-mode: lighten;
}
.about-deco { position: absolute; inset: 0; transform: rotate(-10deg); pointer-events: none; }
.about-deco-bar { position: absolute; background: rgba(var(--orange-rgb), 0.12); border-radius: 9999px; }
.tag { background: var(--surface-dark); color: var(--text); font-size: 14px; font-weight: 300; display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 9999px; margin: 4px; border: 1px solid rgba(255, 255, 255, 0.12); }
.tags-wrap { display: flex; flex-wrap: wrap; margin: 0 -4px 24px; }
.blockquote-wrap { max-width: 896px; margin: 56px auto 0; position: relative; }
.big-quote { position: absolute; top: -24px; left: -32px; font-family: Georgia, serif; font-size: 128px; color: var(--neutral-300); line-height: 1; pointer-events: none; user-select: none; }
.blockquote-inner { padding: 8px 0 8px 40px; }
blockquote { font-size: 20px; font-weight: 400; line-height: 1.45; letter-spacing: -0.02em; font-style: normal; color: var(--text); }

/* ── STATS ── */
.stats { background: transparent; padding: 72px 0; }
.stats-inner { display: flex; flex-wrap: wrap; justify-content: center; gap: 36px; }
.stat-item { text-align: center; padding: 24px 12px; }
.stat-num { font-family: var(--font-ui); font-size: 60px; font-weight: 600; line-height: 1; letter-spacing: -0.04em; color: #fff; }
.stat-label { font-weight: 300; color: var(--text-muted); margin-top: 8px; }

/* ── RESULTS DARK ── */
.results { background: transparent; padding: 96px 0; }
.results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 52px; }
.result-card { background: rgba(255,255,255,.05); border: .8px solid rgba(255,255,255,.1); border-radius: 24px; padding: 32px; }
.result-card h3 { color: white; font-size: 20px; font-weight: 300; margin-bottom: 12px; }
.result-card p { color: rgba(255,255,255,.6); font-weight: 300; line-height: 1.625; }

/* ── PROCESS ── */
.process { background: transparent; padding: 72px 0; }
.process-timeline { max-width: 896px; margin: 0 auto; position: relative; }
/* Rail gris + remplissage orange animé au scroll (scaleY piloté par JS) */
.process-line-track {
  position: absolute; left: 50%; top: 0;
  width: 6px;
  height: 432px;
  transform: translateX(-50%);
  border-radius: 6px;
  pointer-events: none;
}
.process-line-bg {
  position: absolute; inset: 0;
  background: rgba(255, 255, 255, 0.14);
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}
.process-line-fill {
  position: absolute; left: 0; right: 0; top: 0;
  height: 100%;
  width: 100%;
  border-radius: inherit;
  transform: scaleY(0);
  transform-origin: top center;
  will-change: transform;
  background: linear-gradient(180deg, #ff9a4a 0%, var(--orange) 35%, #c55a0a 100%);
  box-shadow:
    0 0 16px rgba(var(--orange-rgb), 0.75),
    0 0 36px rgba(var(--orange-rgb), 0.35);
}
.process-dot {
  position: absolute; left: 50%;
  width: 12px; height: 12px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.28);
  transform: translateX(-50%);
  transition:
    background 0.45s var(--ease-out-soft),
    border-color 0.45s var(--ease-out-soft),
    box-shadow 0.45s var(--ease-out-soft),
    transform 0.45s var(--ease-fluid);
  z-index: 2;
}
.process-dot.process-dot--lit {
  background: var(--orange);
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2), 0 0 18px rgba(var(--orange-rgb), 0.85);
  transform: translateX(-50%) scale(1.2);
}
.process-row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: -16px; }
.process-slot-col1 { display: flex; justify-content: flex-end; padding-right: 32px; }
.process-slot-col2 { display: flex; padding-left: 32px; }
.process-card-head { display: flex; gap: 8px; margin-bottom: 12px; }
.process-card-head--end { justify-content: flex-end; }
.process-card-head--start { justify-content: flex-start; }
.process-card { background: var(--surface-dark); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 24px; max-width: 448px; }
.process-card.dark { background: var(--surface-orange); border: none; }
/* Orange qui « descend » : intensité croissante 01 → 04 */
.process-card-step--1 {
  background: rgba(var(--orange-rgb), 0.1);
  border: 1px solid rgba(var(--orange-rgb), 0.22);
}
.process-card-step--2 {
  background: rgba(var(--orange-rgb), 0.18);
  border: 1px solid rgba(var(--orange-rgb), 0.32);
}
.process-card-step--3 {
  background: rgba(var(--orange-rgb), 0.28);
  border: 1px solid rgba(var(--orange-rgb), 0.48);
}
.process-card-step--4 {
  background: var(--surface-orange);
  border: none;
}
.process-card .num { font-size: 14px; font-weight: 600; color: var(--accent); }
.process-card-step--4 .num { color: rgba(0, 0, 0, 0.55); }
.process-card.dark .num { color: rgba(0, 0, 0, 0.55); }
.process-card h3 { font-weight: 500; margin-bottom: 4px; color: #fff; }
.process-card.dark h3 { color: var(--black); }
.process-card-step--4 h3 { color: var(--black); }
.process-card p { font-size: 14px; font-weight: 300; color: var(--text-muted); line-height: 1.43; }
.process-card.dark p { color: rgba(0, 0, 0, 0.72); }
.process-card-step--4 p { color: rgba(0, 0, 0, 0.72); }
.process-card-step--4 .process-step-title { color: var(--black); }
.process-card[class*="process-card-step--"] {
  transition:
    filter 0.55s var(--ease-out-soft),
    box-shadow 0.55s var(--ease-out-soft),
    border-color 0.55s var(--ease-out-soft);
}
.process-card.process-card--scroll-lit {
  filter: brightness(1.12) saturate(1.08);
  box-shadow: 0 0 0 1px rgba(var(--orange-rgb), 0.45), 0 12px 40px rgba(var(--orange-rgb), 0.12);
}

/* ── PROPOSITION ── */
.proposition { background: transparent; padding: 112px 0 0; }
.proposition-grid { display: grid; grid-template-columns: 2fr 3fr; gap: 48px; }

/* ── VIDÉO PROPOSITION (scroll = scrub) ── */
.video-proposition-section {
  position: relative;
  /* Même noir que le bloc sticky : pas de halo en début/fin de section */
  background: #000000;
}
.video-proposition-sticky {
  position: sticky; top: 0; min-height: 100vh; min-height: 100dvh; width: 100%; /* dvh = barre d’adresse mobile */
  display: flex; flex-direction: column; align-items: center;
  /* center coupait le bas (texte + bas de la vidéo) quand le bloc > viewport */
  justify-content: flex-start;
  overflow-x: hidden; overflow-y: visible;
  /* Noir opaque : évite le « liseré » où le blur laissait voir le fond / le carrousel */
  background: #000000;
  padding: 20px 24px calc(72px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}
.video-proposition-inner {
  width: 100%; max-width: 1152px; display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start; gap: 10px;
  flex-shrink: 0;
  padding-bottom: 8px;
}
.video-proposition-inner > h2 {
  width: 100%;
  max-width: 920px;
}
.video-proposition-label { margin-bottom: 4px; }
.video-proposition-inner .text-ghost { color: rgba(255, 255, 255, 0.2); }
.video-proposition-inner .text-live { color: #fff; }
.video-proposition-wrap {
  position: relative;
  width: 100%; max-width: 960px; border-radius: 16px; overflow: hidden;
  /* Pas d’ombre ni de teinte : le cadre se confond avec le fond noir */
  box-shadow: none;
  border: none;
  background: #000000;
  aspect-ratio: 16 / 9;
  min-height: min(52vw, 480px);
  min-width: 0;
  flex-shrink: 0;
  margin-top: -4px;
}
.video-proposition-wrap video.video-background {
  display: block; width: 100%; height: 100%;
  /* Vidéo en taille réduite comme avant */
  object-fit: contain;
  object-position: center center;
  background: transparent;
  opacity: 1;
  /* Léger zoom pour réduire les marges sans passer en cover */
  transform: scale(1.06);
  transform-origin: center center;
}
.video-proposition-hint {
  font-size: 14px; font-weight: 300; color: rgba(255, 255, 255, 0.62);
  text-align: center; max-width: 560px; line-height: 1.55;
  padding: 4px 12px 0;
  margin-bottom: 4px;
}
.video-proposition-progress {
  width: 100%; max-width: 320px; height: 3px; border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12); overflow: hidden;
}
.video-proposition-progress-bar {
  height: 100%; background: var(--accent); border-radius: inherit;
  transform-origin: left center;
}

/* ── PORTFOLIO ── */
.portfolio { background: transparent; padding: 24px 0 112px; }
.portfolio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; margin-bottom: 48px; }
.project-card {
  text-decoration: none; color: inherit; display: block; border-radius: 24px;
  cursor: pointer;
  transition: transform 0.5s var(--ease-fluid);
}
.project-card:hover { transform: translateY(-6px); }
.project-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
.project-thumb {
  background: rgba(0, 0, 0, 0.35); aspect-ratio: 16/10; min-height: 220px; border-radius: 24px; overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.project-thumb img { width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block; }
.project-info { padding: 16px 14px 20px; }
.project-info h3 { font-size: 16px; font-weight: 500; color: #fff; margin-bottom: 10px; }
.project-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.project-tag { background: rgba(0, 0, 0, 0.4); color: var(--text-muted); font-size: 12px; font-weight: 300; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.08); }

/* ── TESTIMONIALS ── */
.testimonials { background: transparent; padding: 88px 0 72px; overflow: hidden; }
.testimonials-carousel { position: relative; height: 416px; display: flex; justify-content: center; align-items: flex-end; }
.testi-card {
  background: var(--surface-dark); width: 480px; max-width: calc(100vw - 32px); border-radius: 24px; padding: 32px;
  position: absolute; bottom: 10%; left: 50%; will-change: transform, opacity;
  transition:
    transform 0.65s var(--ease-fluid),
    opacity 0.55s var(--ease-out-soft);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text);
}
.testi-stars { display: flex; gap: 4px; margin-bottom: 16px; color: oklch(.828 .189 84.429); }
.testi-quote { font-size: 18px; font-weight: 400; line-height: 1.45; letter-spacing: -0.02em; font-style: italic; margin-bottom: 24px; color: rgba(255, 255, 255, 0.9); }
.testi-meta { display: flex; justify-content: space-between; align-items: center; }
.testi-name { font-weight: 300; }
.testi-date { font-size: 14px; font-weight: 300; color: var(--text-muted); }
.carousel-btn {
  position: absolute; top: 50%; z-index: 30;
  width: 48px; height: 48px; background: var(--surface-orange); border: none; cursor: pointer;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35); transform: translateY(-50%);
  transition: box-shadow 0.35s var(--ease-fluid), transform 0.35s var(--ease-fluid);
  color: var(--black);
}
.carousel-btn:hover {
  box-shadow: rgba(0, 0, 0, 0.18) 0px 8px 24px;
  transform: translateY(-50%) scale(1.04);
}
.carousel-btn:focus-visible {
  outline: 2px solid var(--white);
  outline-offset: 2px;
}
.carousel-btn-prev { left: max(4px, calc(50% - 644px)); }
.carousel-btn-next { right: max(4px, calc(50% - 644px)); }

/* ── FAQ ── */
.faq { background: transparent; padding: 0 0 88px; }
.faq-item {
  background: rgba(15, 15, 15, 0.42);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.faq-btn {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  gap: 16px;
  border-radius: 12px;
}
.faq-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
.faq-btn h3 { font-weight: 500; font-size: 16px; flex: 1; color: #fff; }
.faq-btn svg { flex-shrink: 0; color: var(--text-muted); transition: transform 0.45s var(--ease-fluid); }
.faq-btn.open svg { transform: rotate(180deg); }
.faq-answer { padding: 0 20px 18px; font-size: 14px; font-weight: 300; color: var(--text-muted); line-height: 1.625; display: none; }
.faq-answer.is-open { display: block; }

/* ── CONTACT ── */
.contact { background: transparent; padding: 96px 0; text-align: center; position: relative; overflow: hidden; }
.contact-form-wrap { background: var(--surface-dark); border-radius: 24px; padding: 36px; max-width: 896px; margin: 0 auto 48px; border: 1px solid rgba(var(--orange-rgb), 0.28); }
.contact-form-wrap h3 { font-size: 20px; font-weight: 500; margin-bottom: 24px; color: #fff; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.form-group { text-align: left; }
.form-group label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; padding-left: 4px; color: rgba(255, 255, 255, 0.88); }
.form-group label span { color: var(--accent); }
.form-input {
  width: 100%; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px;
  padding: 12px 16px; font-size: 16px; font-family: inherit;
  outline: none; transition: border-color .15s; background: rgba(0, 0, 0, 0.45); color: #fff;
}
.form-input:focus { border-color: var(--accent); }
.form-input:focus-visible {
  outline: 2px solid rgba(var(--orange-rgb), 0.9);
  outline-offset: 2px;
}
.form-textarea { width: 100%; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 12px 16px; font-size: 16px; font-family: inherit; outline: none; resize: none; transition: border-color .15s; background: rgba(0, 0, 0, 0.45); color: #fff; }
.form-textarea:focus { border-color: var(--accent); }
.form-textarea:focus-visible {
  outline: 2px solid rgba(var(--orange-rgb), 0.9);
  outline-offset: 2px;
}
.form-input::placeholder, .form-textarea::placeholder { color: rgba(255, 255, 255, 0.38); }
.trust-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.trust-badge { background: rgba(0, 0, 0, 0.35); font-size: 14px; font-weight: 300; padding: 10px 20px; border-radius: 9999px; display: flex; align-items: center; gap: 10px; color: var(--text); border: 1px solid rgba(255, 255, 255, 0.1); }
.trust-badge svg { color: var(--accent); }
.divider { display: flex; align-items: center; gap: 16px; justify-content: center; margin: 32px 0; }
.divider-line { width: 64px; height: 1px; background: var(--border); }
.divider-text { font-size: 14px; font-weight: 300; color: var(--text-muted); }
.contact-link { display: inline-flex; align-items: center; gap: 8px; font-weight: 300; color: #fff; text-decoration: none; }
.contact-link:hover { text-decoration: underline; }

/* ── FOOTER ── */
.footer { background: var(--neutral-950); color: white; padding: 40px 0 32px; }
.footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 28px; }
.footer-heading { font-size: 14px; font-weight: 500; letter-spacing: .7px; text-transform: uppercase; margin-bottom: 16px; }
.footer-links { list-style: none; }
.footer-links li { margin-bottom: 12px; }
.footer-links a { color: oklch(.708 0 0); font-size: 14px; text-decoration: none; transition: color .15s; }
.footer-links a:hover { color: white; }
.footer-socials { display: flex; gap: 16px; margin-top: 8px; }
.footer-social { color: oklch(.708 0 0); text-decoration: none; transition: color .15s; }
.footer-social:hover { color: white; }
.footer-zones { border-top: .8px solid oklch(.269 0 0); padding: 24px 0; margin-top: 24px; text-align: center; }
.footer-zones h4 { font-size: 14px; font-weight: 500; letter-spacing: .7px; text-transform: uppercase; margin-bottom: 16px; }
.footer-zone-national {
  margin-top: 12px;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: oklch(.85 0 0);
  letter-spacing: 0.02em;
}
.footer-bottom { border-top: .8px solid oklch(.269 0 0); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.footer-copy { color: oklch(.556 0 0); font-size: 14px; }
.footer-legal { display: flex; gap: 24px; }
.footer-legal a { color: oklch(.556 0 0); font-size: 14px; text-decoration: none; }

/* ── SCROLL ANIMATIONS ── */
.fade-up {
  opacity: 0;
  transform: translate3d(0, 22px, 0);
  transition:
    opacity var(--duration-reveal) var(--ease-fluid),
    transform var(--duration-reveal) var(--ease-fluid);
}
.fade-up.visible { opacity: 1; transform: translate3d(0, 0, 0); }
.fade-up-lg {
  opacity: 0;
  transform: translate3d(0, 56px, 0);
  transition:
    opacity var(--duration-reveal-lg) var(--ease-fluid),
    transform var(--duration-reveal-lg) var(--ease-fluid);
}
.fade-up-lg.visible { opacity: 1; transform: translate3d(0, 0, 0); }
.delay-1 { transition-delay: .1s !important; }
.delay-2 { transition-delay: .2s !important; }
.delay-3 { transition-delay: .3s !important; }

@media (max-width: 900px) {
  .nav-links, .nav-cta { display: none; }
  .nav-wrap-outer {
    top: max(6px, env(safe-area-inset-top, 0px));
    left: max(10px, env(safe-area-inset-left, 0px));
    right: max(10px, env(safe-area-inset-right, 0px));
    width: auto;
    max-width: none;
    transform: none;
  }
  .nav-wrap { border-radius: 20px; }
  .nav-inner {
    height: 56px;
    padding-left: max(14px, env(safe-area-inset-left, 0px));
    padding-right: max(14px, env(safe-area-inset-right, 0px));
  }
  .nav-logo span { font-size: 15px; }
  .nav-logo svg { width: 32px; height: 32px; }

  .container, .container-md {
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px));
  }

  .hero {
    min-height: 100dvh;
    padding-top: 96px;
  }
  .hero-content {
    padding: 72px 12px 0;
  }
  .hero-h1 {
    font-size: clamp(28px, 8.5vw, 44px);
  }
  .hero-p {
    font-size: 15px;
    line-height: 1.5;
  }
  .hero-btns {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .btn-dark, .btn-ghost {
    justify-content: center;
    min-height: 48px;
    padding: 14px 20px;
  }

  .section-title { font-size: clamp(26px, 7.5vw, 34px); margin-bottom: 16px; }
  .section-title-lg { font-size: clamp(30px, 8vw, 40px); }
  .section-desc { font-size: 15px; }
  .section-label { font-size: 12px; padding: 6px 14px; }

  .approach-grid, .services-grid, .about-grid, .results-grid, .portfolio-grid,
  .proposition-grid, .footer-grid { grid-template-columns: 1fr; gap: 40px; }
  .process-row { grid-template-columns: 1fr; gap: 0; }
  .approach { padding-top: 96px; margin-top: -120px; }

  .hero-carousel { min-height: 300px; }
  .carousel-pivot-wrap { transform: translateY(40px); }
  .carousel-pivot { width: 920px; height: 920px; }
  .carousel-card-inner { width: min(300px, 78vw); }

  /* Timeline : ligne à gauche, cartes lisibles pleine largeur */
  .process-timeline {
    padding-left: 4px;
    padding-right: 0;
  }
  .process-line-track {
    left: 18px;
    transform: translateX(-50%);
    width: 5px;
    height: 432px;
  }
  .process-dot {
    left: 18px;
  }
  .process-slot-col1,
  .process-slot-col2 {
    justify-content: flex-start !important;
    padding-left: 40px !important;
    padding-right: 0 !important;
  }
  .process-card {
    max-width: none;
    width: 100%;
    padding: 20px;
  }
  .process-card-head--end {
    justify-content: flex-start !important;
  }

  .testimonials-carousel {
    height: min(520px, 85vh);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .testi-card {
    width: min(340px, calc(100vw - 28px));
    padding: 22px 18px;
    bottom: 8%;
  }
  .testi-quote {
    font-size: 16px;
    line-height: 1.5;
  }
  .carousel-btn {
    width: 44px;
    height: 44px;
    top: auto;
    bottom: 12px;
    transform: none;
  }
  .carousel-btn:hover {
    transform: scale(1.04);
  }
  .carousel-btn-prev { left: max(8px, env(safe-area-inset-left, 0px)); }
  .carousel-btn-next { right: max(8px, env(safe-area-inset-right, 0px)); }

  .form-grid { grid-template-columns: 1fr; }
  .contact-form-wrap { padding: 28px 18px; }

  .video-proposition-sticky {
    padding-left: max(12px, env(safe-area-inset-left, 0px));
    padding-right: max(12px, env(safe-area-inset-right, 0px));
    padding-top: max(16px, env(safe-area-inset-top, 0px));
  }
  .video-proposition-hint {
    font-size: 13px;
    padding-left: 8px;
    padding-right: 8px;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}

@media (max-width: 900px) and (prefers-reduced-motion: reduce) {
  .fade-up, .fade-up-lg {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skip-link {
    transition: none;
  }
}
`;

// ─── DATA ──────────────────────────────────────────────────────────────────────
const PROJECTS = [
  { title: "Chouchoute-toi by Amande", tags: ["Site vitrine","Beauté","SEO local"], img: "/chouchoute-toi-alt.png" },
  { title: "Devigny Peinture", tags: ["Site vitrine","Artisan","SEO local"], img: "/devigny-peinture-alt.png" },
  { title: "L'Écrin Doré", tags: ["Restaurant","Gastronomie","Réservation"], img: "/ecrin-dore-alt.png" },
  { title: "SOS Punaises 73", tags: ["Site vitrine","SEO local","Génération leads"], img: "https://micha-megret.fr/images/projects/sospunaises/hero.webp" },
];

const CAROUSEL_IMGS = [
  { alt: "Devigny Peinture", src: "https://micha-megret.fr/images/projects/devigny-peinture/hero.webp" },
  { alt: "Airspace Atlas", src: "https://micha-megret.fr/images/projects/airspaceatlas/homepage.webp" },
  { alt: "Yonko Street Food", src: "https://micha-megret.fr/images/projects/yonko/hero.webp" },
  { alt: "Loyal Agency", src: "https://micha-megret.fr/images/projects/loyal-agency/solution.webp" },
  { alt: "EEG AG Suisse", src: "https://micha-megret.fr/images/projects/eeg-ag/hero.webp" },
  { alt: "SOS Punaises 73", src: "https://micha-megret.fr/images/projects/sospunaises/hero.webp" },
  { alt: "App Stone", src: "https://micha-megret.fr/images/projects/app-stone/dashboard.webp" },
  { alt: "Batisur BTP", src: "https://micha-megret.fr/images/projects/batisur/hero.webp" },
  { alt: "Qui Dit Vrai", src: "https://micha-megret.fr/images/projects/quiditvrai/hero.webp" },
  { alt: "App Stone 2", src: "https://micha-megret.fr/images/projects/app-stone/hero.webp" },
  { alt: "L'Écrin Doré", src: "https://micha-megret.fr/images/projects/ecrin-dore/hero.webp" },
  { alt: "Chouchoute-toi", src: "https://micha-megret.fr/images/projects/chouchoute-toi/hero.webp" },
];
/** Triple tour : angles encore plus serrés, boucle visuelle moins « découpée » */
const HERO_CAROUSEL_RING = [...CAROUSEL_IMGS, ...CAROUSEL_IMGS, ...CAROUSEL_IMGS];

const NAV_LINKS = [
  { label: "Services", href: "#" },
  { label: "Réalisations", href: "#portfolio" },
  { label: "Méthode IA", href: "#" },
  { label: "À propos", href: "#" },
];

const TESTIMONIALS = [
  { name: "Jérémie ROUSSEL", date: "novembre 2025", text: "J'ai confié à Damien la création d'un site web techniquement exigeant, intégrant de nombreuses fonctionnalités modernes. Tout a été réalisé dans les délais, conformément à mes attentes. Sa rigueur a permis de construire un site solide, et sa compréhension des enjeux a véritablement aidé à transformer mes idées en un concept fonctionnel. À plusieurs niveaux, il a même dépassé largement mes attentes. Je recommande ses services sans la moindre réserve." },
  { name: "Thomas DECORS", date: "août 2025", text: "Je suis pas du tout à l'aise avec le digital mais Damien a su m'expliquer les choses simplement. Ma boutique en ligne tourne bien maintenant, les commandes arrivent et je gère tout facilement depuis mon téléphone. Merci encore." },
  { name: "Marie KERMON", date: "juillet 2025", text: "Très content du travail réalisé sur notre appli de gestion. L'équipe l'a prise en main rapidement, c'est fluide et ça nous fait gagner un temps fou au quotidien. Damien est dispo et à l'écoute, je recommande." },
  { name: "Pierre LEMOZY", date: "décembre 2024", text: "Avant je galérais avec 3 prestataires différents pour mon site, mon logo et le référencement... Maintenant j'ai qu'un seul interlocuteur et tout avance beaucoup plus vite. Ça change la vie franchement." },
  { name: "Camille SALTO", date: "septembre 2024", text: "Super collab ! Damien a refait notre identité visuelle et créé un site qui nous ressemble enfin. On a eu plein de retours positifs de nos clients depuis. Hâte de continuer à bosser ensemble sur la suite." },
];

const FAQS = [
  { q: "Combien coûte la création d'un site internet ?", a: "Le prix dépend de la complexité du projet. Un site vitrine démarre à partir de 500 €, un e-commerce à partir de 1 500 € et une application web sur mesure à partir de 2 000 €. Chaque projet fait l'objet d'un devis gratuit et personnalisé après un premier échange." },
  { q: "Quel est le délai moyen pour un projet web ?", a: "Comptez en moyenne 2 à 4 semaines pour un site vitrine, 4 à 8 semaines pour un e-commerce et 6 à 12 semaines pour une application sur mesure. Mon approche augmentée par l'IA permet de réduire significativement ces délais." },
  { q: "Travaillez-vous avec des clients en Suisse ?", a: "Oui, j'accompagne régulièrement des entreprises en Suisse romande, notamment à Genève et Lausanne. Basé à Évian-les-Bains, je suis à la frontière franco-suisse et peux me déplacer facilement." },
  { q: "Que signifie « développeur augmenté par l'IA » ?", a: "J'utilise l'intelligence artificielle comme un outil de productivité pour accélérer certaines tâches (analyse, vérification, optimisation) tout en gardant un contrôle humain total sur chaque décision. Ce n'est pas du « vibe coding » : c'est une méthode rigoureuse." },
  { q: "Proposez-vous un suivi après la mise en ligne ?", a: "Absolument. Chaque projet inclut une période de garantie pour les corrections. Je propose également des forfaits de maintenance pour les mises à jour, la sécurité et l'évolution de votre site dans le temps." },
  { q: "Comment se déroule un premier échange ?", a: "Tout commence par un appel découverte gratuit de 30 minutes. On discute de votre projet, vos objectifs et vos contraintes. Je vous propose ensuite un devis détaillé avec un planning clair. Aucun engagement avant validation." },
];

// ─── ICONS ─────────────────────────────────────────────────────────────────────
const ArrowRight = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd"/></svg>;
const ArrowDown = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd"/></svg>;
const Star = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="oklch(0.828 0.189 84.429)"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd"/></svg>;
const ChevronDown = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/></svg>;
const ChevLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>;
const ChevRight = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>;

// ─── MASKED TITLE ──────────────────────────────────────────────────────────────
const MaskedTitle = ({ children, className = "", maskH = "54px" }) => (
  <div className={`text-mask-wrap ${className}`} style={{ position: "relative" }}>
    <span className="text-ghost" aria-hidden="true">{children}</span>
    <span className="text-live" style={{
      WebkitMaskSize: `100% ${maskH}`, maskSize: `100% ${maskH}`
    }}>{children}</span>
  </div>
);

// ─── SERVICE ICONS ─────────────────────────────────────────────────────────────
const SERVICES_DATA = [
  { title: "Sites Web", desc: "Sites vitrines, professionnels et landing pages sur mesure.", items: ["Sites vitrine & corporate", "Landing pages conversion", "Blog & CMS complet"],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"/></svg> },
  { title: "Applications Web", desc: "Des outils sur mesure pour digitaliser votre métier.", items: ["SaaS & MVP", "Outils métier", "Portails clients"],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/></svg> },
  { title: "E-Commerce", desc: "Vendez en ligne avec une boutique optimisée conversion.", items: ["Boutiques sur mesure", "Tunnel de vente optimisé", "Intégrations paiement"],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg> },
  { title: "Identité & Design", desc: "Une image qui vous ressemble et qui marque les esprits.", items: ["Logo et charte graphique", "UI/UX Design (Figma)", "Supports print & digitaux"],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"/></svg> },
  { title: "SEO & Croissance", desc: "Soyez trouvé par vos clients idéaux sur Google.", items: ["Audit & optimisation SEO", "Google Ads & Social Ads", "Analytics & suivi"],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg> },
  { title: "Automatisation", desc: "Gagnez du temps, éliminez les tâches répétitives.", items: ["Workflows n8n & Make", "Intégrations API", "Chatbots & assistants IA"],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg> },
];

const VIDEO_PROPOSITION_SRC = "/video-proposition.mp4";
/** Pixels de défilement par seconde de vidéo : crée la « zone » où le scroll pilote la timeline */
const VIDEO_SCROLL_PX_PER_SECOND = 920;

// ─── HOOKS ─────────────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-up, .fade-up-lg");
    const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
      {
        threshold: narrow ? 0.04 : 0.08,
        /* Marge positive en bas : la révélation démarre un peu avant l’entrée dans le viewport */
        rootMargin: narrow ? "0px 0px 14% 0px" : "0px 0px 11% 0px",
      }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Technique scroll-scrub (GSAP + ScrollTrigger + blob), adaptée de Nicolai Palmkvist — sans jQuery */
function VideoPropositionSection() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const timelineRef = useRef(null);
  const [sectionHeight, setSectionHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight + 2400 : 2400
  );
  const [videoMetaVersion, setVideoMetaVersion] = useState(0);

  /* iOS : « activer » la vidéo pour que currentTime / scrub fonctionne */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const unlock = () => {
      video.play().catch(() => {}).then(() => {
        video.pause();
      });
    };
    const onTouchStart = () => {
      document.documentElement.removeEventListener("touchstart", onTouchStart);
      unlock();
    };
    document.documentElement.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => document.documentElement.removeEventListener("touchstart", onTouchStart);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onMeta = () => {
      const d = video.duration;
      if (!Number.isFinite(d) || d <= 0 || d === Infinity) return;
      const scrollPx = d * VIDEO_SCROLL_PX_PER_SECOND;
      const h = window.innerHeight + scrollPx;
      setSectionHeight(Number.isFinite(h) ? h : window.innerHeight + 8000);
      setVideoMetaVersion((v) => v + 1);
    };
    video.addEventListener("loadedmetadata", onMeta);
    if (video.readyState >= 1) onMeta();
    return () => video.removeEventListener("loadedmetadata", onMeta);
  }, []);

  /* ScrollTrigger : debounce des events vidéo pour éviter kill/recreate en boucle */
  useEffect(() => {
    const container = sectionRef.current;
    const video = videoRef.current;
    const progressEl = progressBarRef.current;
    if (!container || !video) return;

    let st = null;
    let debounceTimer = 0;
    let vidRaf = 0;
    let pendingP = 0;

    const killSt = () => {
      cancelAnimationFrame(vidRaf);
      vidRaf = 0;
      if (st) {
        st.kill();
        st = null;
      }
      timelineRef.current = null;
    };

    const attach = () => {
      const dur = video.duration;
      if (!Number.isFinite(dur) || dur <= 0 || dur === Infinity) return;

      killSt();

      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
      if (progressEl) progressEl.style.transform = "scaleX(0)";

      st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.15,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          pendingP = self.progress;
          if (vidRaf) return;
          vidRaf = requestAnimationFrame(() => {
            vidRaf = 0;
            const p = pendingP;
            if (video.readyState < 1) return;
            if (progressEl) progressEl.style.transform = `scaleX(${p})`;
            const target = p * dur;
            if (Math.abs(video.currentTime - target) > 0.035) {
              try {
                video.currentTime = target;
              } catch {
                /* ignore */
              }
            }
          });
        },
      });

      timelineRef.current = st;
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const tryAttach = () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        if (Number.isFinite(video.duration) && video.duration > 0 && video.duration !== Infinity) {
          attach();
        }
      }, 80);
    };

    tryAttach();
    const onVideoReady = () => tryAttach();
    video.addEventListener("loadedmetadata", onVideoReady);
    video.addEventListener("durationchange", onVideoReady);

    let resizeVidTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeVidTimer);
      resizeVidTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.clearTimeout(debounceTimer);
      window.clearTimeout(resizeVidTimer);
      cancelAnimationFrame(vidRaf);
      video.removeEventListener("loadedmetadata", onVideoReady);
      video.removeEventListener("durationchange", onVideoReady);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      killSt();
    };
  }, [sectionHeight, videoMetaVersion]);

  const sectionHeightSafe =
    Number.isFinite(sectionHeight) && sectionHeight > 400 ? sectionHeight : 7200;

  return (
    <section
      ref={sectionRef}
      id="proposition"
      className="video-proposition-section"
      style={{ height: sectionHeightSafe, minHeight: "120vh" }}
      aria-label="Présentation vidéo — faites défiler pour avancer"
    >
      <div className="video-proposition-sticky">
        <div className="video-proposition-inner">
          <AnimatedButton as="span" className="section-label video-proposition-label">
            Mon avantage concurrentiel
          </AnimatedButton>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 500, lineHeight: 1.12, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 0 }}>
            <MaskedTitle maskH="54px">
              L&apos;IA ne me remplace pas.<br />
              <span style={{ color: "var(--accent)" }}>Elle fait de moi une équipe.</span>
            </MaskedTitle>
          </h2>
          <div className="video-proposition-wrap">
            <video
              ref={videoRef}
              className="video-background"
              src={VIDEO_PROPOSITION_SRC}
              muted
              playsInline
              preload="metadata"
              aria-label="Animation présentant l&apos;approche IA"
            />
          </div>
          <div className="video-proposition-progress" aria-hidden>
            <div
              ref={progressBarRef}
              className="video-proposition-progress-bar"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <p className="video-proposition-hint">
            Faites défiler la page : la vidéo avance avec votre scroll. Une fois terminée, le défilement continue vers le bas.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MichaMegret() {
  const [faqOpen, setFaqOpen] = useState(null);
  const [testitIdx, setTestiIdx] = useState(3);
  const [isNarrow, setIsNarrow] = useState(false);
  const [navHoveredLink, setNavHoveredLink] = useState(null);
  const reduceUiMotion = useReducedMotion();
  const carouselPivotRef = useRef(null);
  const processTimelineRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const upd = () => setIsNarrow(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  useScrollReveal();

  /* Timeline processus : ligne orange remplie au scroll + pastilles / cartes synchronisées */
  useEffect(() => {
    const root = processTimelineRef.current;
    if (!root) return;
    const fill = root.querySelector(".process-line-fill");
    const dots = root.querySelectorAll(".process-dot");
    const cards = root.querySelectorAll(".process-card");
    if (!fill) return;

    const LINE_H = 432;
    const tops = [63, 182, 302, 427];

    fill.style.transformOrigin = "top center";
    fill.style.transform = "scaleY(0)";

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 78%",
      end: "bottom 18%",
      scrub: 1.1,
      onUpdate: (self) => {
        const p = self.progress;
        /* Pas de gsap.set ici : moins de travail sur le fil principal */
        fill.style.transform = `scaleY(${p})`;
        const track = root.querySelector(".process-line-track");
        const lineH = track?.offsetHeight || LINE_H;
        const filledPx = p * lineH;
        dots.forEach((dot, i) => {
          dot.classList.toggle("process-dot--lit", filledPx >= tops[i] - 10);
        });
        cards.forEach((card, i) => {
          card.classList.toggle("process-card--scroll-lit", filledPx >= tops[i] - 28);
        });
      },
    });

    let resizeDebounce = 0;
    const refreshProcess = () => {
      window.clearTimeout(resizeDebounce);
      resizeDebounce = window.setTimeout(() => ScrollTrigger.refresh(), 100);
    };
    window.addEventListener("resize", refreshProcess);
    window.addEventListener("orientationchange", refreshProcess);
    requestAnimationFrame(refreshProcess);

    return () => {
      window.clearTimeout(resizeDebounce);
      window.removeEventListener("resize", refreshProcess);
      window.removeEventListener("orientationchange", refreshProcess);
      st.kill();
    };
  }, []);

  /* Carrousel hero : rotation légère, pause hors viewport / onglet / reduced-motion */
  useEffect(() => {
    const el = carouselPivotRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.transform = "rotate(47deg)";
      return;
    }

    let angle = 47;
    let lastTs = 0;
    let rafId = 0;
    let running = false;

    const step = (ts) => {
      if (!running) return;
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;
      angle += (dt / 40000) * 360;
      el.style.transform = `rotate(${angle}deg)`;
      rafId = requestAnimationFrame(step);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    };

    const stop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const wrap = el.closest(".hero-carousel");
    let io = null;

    const onVis = () => {
      if (document.hidden) {
        stop();
        return;
      }
      if (!wrap) return;
      requestAnimationFrame(() => {
        const r = wrap.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) start();
      });
    };

    if (wrap && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          const vis = entries[0]?.isIntersecting;
          if (vis && !document.hidden) start();
          else stop();
        },
        { root: null, rootMargin: "120px 0px", threshold: 0 }
      );
      io.observe(wrap);
      if (!document.hidden) start();
    } else if (!document.hidden) {
      start();
    }

    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (io && wrap) io.disconnect();
      stop();
    };
  }, []);

  // Testimonials
  const tLen = TESTIMONIALS.length;
  const getPos = (i) => {
    const diff = ((i - testitIdx) % tLen + tLen) % tLen;
    const adj = diff > tLen/2 ? diff - tLen : diff;
    return adj;
  };
  const getStyle = (i) => {
    const slideW = isNarrow ? Math.min(320, typeof window !== "undefined" ? window.innerWidth * 0.82 : 300) : 416;
    const offScreenY = isNarrow ? -260 : -384;
    const sideY = isNarrow ? -130 : -192;
    const pos = getPos(i);
    const abs = Math.abs(pos);
    if (abs > 2) {
      return {
        opacity: 0,
        pointerEvents: "none",
        transform: `translate(calc(-50% + ${pos * slideW}px), 0) translate(0, ${offScreenY}px) scale(.8,.8)`,
      };
    }
    const scale = abs === 0 ? 1 : 0.85;
    const y = abs === 0 ? 0 : sideY;
    const o = abs === 0 ? 1 : abs === 1 ? 0.6 : 0;
    const z = abs === 0 ? 10 : abs === 1 ? 5 : 1;
    return {
      transform: `translate(calc(-50% + ${pos * slideW}px), 0) translate(0, ${y}px) scale(${scale},${scale})`,
      opacity: o,
      zIndex: z,
      pointerEvents: abs > 1 ? "none" : "auto",
    };
  };

  return (
    <>
      <style>{css}</style>
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      {/* ── NAV ── */}
      <div className="nav-wrap-outer">
        <motion.nav
          className="nav-wrap"
          variants={navBarVariants}
          initial="hidden"
          animate="visible"
          aria-label="Navigation principale"
        >
          <motion.div
            className="nav-inner"
            variants={navStaggerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="nav-logo-slot" variants={navBarItemVariants}>
              <Magnetic strength={0.15}>
                <motion.a
                  className="nav-logo"
                  href="#"
                  whileHover={reduceUiMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceUiMotion ? undefined : { scale: 0.95 }}
                >
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect width="36" height="36" rx="10" fill="#000000"/>
                    <text x="50%" y="54%" dominantBaseline="central" textAnchor="middle" fill="#ed8223" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="19">dc</text>
                  </svg>
                  <span>damien camici<span style={{ color: "#ed8223" }}>.</span></span>
                </motion.a>
              </Magnetic>
            </motion.div>
            <motion.div
              className="nav-links"
              variants={navBarItemVariants}
              onMouseLeave={() => setNavHoveredLink(null)}
            >
              {NAV_LINKS.map((link, index) => (
                <div
                  key={link.label}
                  className="nav-link-wrap"
                  onMouseEnter={() => setNavHoveredLink(index)}
                >
                  <AnimatePresence>
                    {navHoveredLink === index && (
                      <motion.div
                        key="pill"
                        layoutId="nav-hover-pill"
                        className="nav-link-pill"
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.75 }}
                      />
                    )}
                  </AnimatePresence>
                  <a className="nav-link-inner" href={link.href}>
                    {link.label}
                  </a>
                </div>
              ))}
            </motion.div>
            <motion.div className="nav-cta-slot" variants={navBarItemVariants}>
              <Magnetic strength={0.2}>
                <AnimatedButton className="nav-cta" href="#contact">
                  Discutons de votre projet
                </AnimatedButton>
              </Magnetic>
            </motion.div>
          </motion.div>
        </motion.nav>
      </div>

      <main id="main-content" className="main-content" tabIndex={-1}>
      {/* ── HERO (shader + bloc type app/page Next — adapté Vite) ── */}
      <section className="hero" id="hero" style={{ background: "#0a0a0a" }}>
        <div className="hero-background-wrap" aria-hidden="true">
          <HeroBackground />
          <HeroSplineLayer />
        </div>
        <div className="hero-stack">
          <h1 className="hero-title-main">Créer, automatiser, grandir.</h1>
          <p className="hero-title-sub">
            Un site qui travaille{" "}
            <span style={{ color: "#E8730A" }}>pour vous.</span>
          </p>
          <AnimatedButton className="hero-cta-page" href="#contact">
            Demander un devis gratuit →
          </AnimatedButton>
        </div>

        <div className="hero-carousel" aria-hidden="true">
          <div className="carousel-pivot-wrap">
            <div
              ref={carouselPivotRef}
              className="carousel-pivot"
              style={{ transform: "rotate(47deg)" }}
            >
              {HERO_CAROUSEL_RING.map((img, i) => {
                const n = HERO_CAROUSEL_RING.length;
                const angle = (i / n) * 360;
                const radius = isNarrow ? 360 : 520;
                return (
                  <div
                    key={`${img.src}-${i}`}
                    className="carousel-card"
                    style={{
                      transform: `rotate(${angle}deg) translate(0, ${-radius}px) rotate(${-angle}deg)`,
                    }}
                  >
                    <div
                      className="carousel-card-inner"
                      style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) scale(1.09)` }}
                    >
                      <div className="carousel-card-img-wrap">
                        <img src={img.src} alt="" loading={i < 3 ? "eager" : "lazy"} decoding="async" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── APPROACH ── */}
      <section className="approach" id="approach">
        <div className="container">
          <div className="approach-grid">
            <div>
              <AnimatedButton as="span" className="section-label">
                Mon approche
              </AnimatedButton>
              <h2 className="section-title" style={{fontSize:38}}>
                <MaskedTitle maskH="42px">
                  Pas juste livrer un site. Construire <span style={{color:"var(--accent)"}}>le vôtre</span>.
                </MaskedTitle>
              </h2>
              <p className="section-desc">
                Le code est une passion, pas un simple métier. Ce qui m'anime au quotidien, c'est de voir mes clients fiers de leur site. Tant que vous n'êtes pas pleinement satisfait, je ne le suis pas non plus.
              </p>
            </div>
            <div>
              {[
                { delay:"0ms", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193A48.424 48.424 0 0 1 18 18.75v3l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/></svg>, title: "On construit ensemble", text: "Je prends le temps de comprendre ce que vous voulez vraiment — le besoin, mais aussi l'envie. Votre site doit vous ressembler, pas ressembler à un template." },
                { delay:"100ms", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/></svg>, title: "L'excellence dans les détails", text: "Données structurées, accessibilité, performances, SEO technique — je mets en place ce que la plupart des développeurs négligent." },
                { delay:"200ms", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>, title: "Adapté à vous, dans la durée", text: "Stack, tarifs, délais — tout s'ajuste pour que vous ne payiez que ce qui est nécessaire. Je prends le temps de vous connaître pour vous accompagner sur le long terme." },
              ].map(({ delay, icon, title, text }, i) => (
                <div className="step fade-up" key={i} style={{ transitionDelay: delay }}>
                  <div className="step-icon">{icon}</div>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="services" id="services">
        <div className="container">
          <div style={{textAlign:"center", maxWidth:768, margin:"0 auto"}}>
            <AnimatedButton as="span" className="section-label">
              Un accompagnement complet
            </AnimatedButton>
            <h2 className="section-title fade-up">
              <MaskedTitle maskH="42px">
                Tout ce dont vous avez besoin,<br/><span style={{color:"var(--accent)"}}>au même endroit.</span>
              </MaskedTitle>
            </h2>
            <p className="section-desc fade-up">
              Création de site internet, e-commerce, identité visuelle, référencement SEO, automatisation — un interlocuteur unique pour tout votre projet digital.
            </p>
          </div>
          <div className="services-grid">
            {SERVICES_DATA.map((s, i) => (
              <div className="service-card fade-up" key={i} style={{ transitionDelay: `${i*50}ms` }}>
                <div className="service-card-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <ul className="service-list">
                  {s.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
                <a className="service-link" href="#">En savoir plus <ArrowRight/></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-img-wrap fade-up">
              <div className="about-deco">
                {[
                  {top:"-2%",left:"8%",w:"40%",h:"20px"},{top:"3%",right:"6%",w:"11%",h:"12px"},
                  {top:"19%",left:"-3%",w:"16%",h:"10px"},{top:"23%",left:"38%",w:"37%",h:"22px"},
                  {top:"42%",left:"4%",w:"30%",h:"16px"},{top:"46%",right:"-1%",w:"22%",h:"20px"},
                  {top:"62%",left:"10%",w:"46%",h:"24px"},{top:"77%",left:"-2%",w:"18%",h:"14px"},
                  {top:"80%",left:"60%",w:"34%",h:"22px"},
                ].map((d, i) => (
                  <div key={i} className="about-deco-bar" style={{ ...d, background:"rgba(237,130,35,.12)" }}/>
                ))}
              </div>
              <div className="about-img">
                <img src="/damien-portrait.png" alt="Damien Camici" />
              </div>
            </div>
            <div className="fade-up delay-1">
              <span className="section-label section-label-white">Derrière l'écran</span>
              <h2 className="section-title" style={{fontSize:42}}>
                <MaskedTitle maskH="47px">
                  Enchanté, moi c'est <span style={{color:"var(--accent)"}}>Damien</span>.
                </MaskedTitle>
              </h2>
              <div style={{color:"var(--text-muted)",fontWeight:300,lineHeight:1.625,marginBottom:24}}>
                <p style={{marginBottom:16}}>Développeur web de formation, j'ai rapidement compris que créer des sites internet ne suffisait pas. Mes clients avaient besoin d'un logo, d'une stratégie SEO, d'outils pour automatiser leur quotidien...</p>
                <p style={{marginBottom:16}}>Plutôt que de les renvoyer vers d'autres prestataires, j'ai élargi mes compétences. Et avec les outils d'IA que je maîtrise aujourd'hui, je peux vous offrir un service complet, réactif et abordable.</p>
                <p>Mon objectif ? Devenir votre partenaire digital de confiance sur le long terme.</p>
              </div>
              <div className="tags-wrap">
                {["Licence Informatique","Titre Pro Développeur Web","Augmenté par l'IA"].map((t,i) => <span key={i} className="tag">{t}</span>)}
              </div>
              <a href="#contact" className="service-link" style={{fontSize:18,fontWeight:500,padding:"14px 24px",border:"0.8px solid var(--accent)",borderRadius:"9999px",gap:8}}>
                Contactez moi <ArrowRight/>
              </a>
            </div>
          </div>
          {/* Quote */}
          <div className="blockquote-wrap fade-up" style={{marginTop:88}}>
            <span className="big-quote">"</span>
            <div className="blockquote-inner">
              <blockquote>
                Votre présence en ligne attire, vos outils métier optimisent, vos automatisations libèrent du temps, votre référencement génère des opportunités. Chaque brique renforce les autres.
                <span style={{color:"var(--text-muted)",display:"block",marginTop:16}}>Je construis cet écosystème digital pour qu'il travaille pour vous.</span>
              </blockquote>
              <div style={{display:"flex",alignItems:"center",gap:16,marginTop:24}}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "9999px",
                    flexShrink: 0,
                    background: "var(--surface-orange)",
                    color: "var(--text-on-orange)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: "-0.04em",
                    fontFamily: "var(--font-ui)",
                  }}
                  aria-hidden="true"
                >
                  dc
                </div>
                <div>
                  <cite style={{fontStyle:"normal",fontWeight:300}}>Damien Camici</cite>
                  <p style={{fontSize:14,fontWeight:300,color:"var(--text-muted)",margin:0}}>Partenaire Digital Augmenté</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats">
        <div className="container">
          <div className="stats-inner">
            {[{n:"3+",l:"Années d'expérience"},{n:"30+",l:"Projets livrés"},{n:"100%",l:"Satisfaction client"}].map((s,i) => (
              <div className="stat-item fade-up" key={i} style={{transitionDelay:`${i*100}ms`}}>
                <div className="stat-num">{s.n}</div>
                <div className="stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTS (dark) ── */}
      <section className="results" id="resultats">
        <div className="container">
          <div style={{textAlign:"center",maxWidth:768,margin:"0 auto"}}>
            <span className="section-label section-label-dark">Vos résultats</span>
            <h2 className="section-title fade-up" style={{color:"white"}}>
              Ce que ça change pour <span style={{color:"var(--accent)"}}>votre business</span>
            </h2>
            <p className="section-desc fade-up" style={{color:"rgba(255,255,255,.6)",fontWeight:500}}>
              Au-delà de la technique, chaque projet est pensé pour générer un impact réel et mesurable sur votre activité.
            </p>
          </div>
          <div className="results-grid">
            {[
              {t:"Un site qui convertit",d:"Pas juste un site joli : une vitrine digitale conçue pour générer des contacts, des demandes de devis et des ventes. Chaque page est pensée pour guider vos visiteurs vers l'action."},
              {t:"Visible sur Google",d:"Un référencement local optimisé pour que vos clients vous trouvent quand ils cherchent vos services. Fiche Google Business, SEO technique et contenu ciblé pour votre zone."},
              {t:"Du temps retrouvé",d:"Automatisation des tâches qui vous prennent du temps : relances, facturation, synchronisation d'outils. Vous vous concentrez sur votre métier, votre site et vos outils travaillent pour vous."},
              {t:"Une image professionnelle",d:"Une identité visuelle cohérente qui inspire confiance dès le premier regard. Logo, charte graphique et supports coordonnés pour vous démarquer de la concurrence."},
            ].map((r,i) => (
              <div className="result-card fade-up" key={i} style={{transitionDelay:`${i*100}ms`}}>
                <h3>{r.t}</h3>
                <p>{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="process" id="process">
        <div className="container">
          <div style={{textAlign:"center",maxWidth:768,margin:"0 auto 56px"}}>
            <AnimatedButton as="span" className="section-label">
              Un processus clair
            </AnimatedButton>
            <h2 className="section-title fade-up">
              <MaskedTitle maskH="42px">
                De notre premier échange à la <span style={{color:"var(--accent)"}}>mise en ligne.</span>
              </MaskedTitle>
            </h2>
            <p className="section-desc fade-up" style={{fontWeight:500}}>
              Que ce soit pour créer un site internet, lancer votre boutique en ligne ou automatiser vos processus, un accompagnement structuré de la première idée à la mise en ligne.
            </p>
          </div>
          <div className="process-timeline" ref={processTimelineRef}>
            <div className="process-line-track" aria-hidden="true">
              <div className="process-line-bg" />
              <div className="process-line-fill" />
            </div>
            {[63, 182, 302, 427].map((top) => (
              <div className="process-dot" key={top} style={{ top }} />
            ))}
            {[
              {right:<div className="process-card process-card-step--1 fade-up-lg"><div className="process-card-head process-card-head--end"><span className="num">01</span><span className="process-step-title" style={{fontWeight:300,color:"#fff"}}>Découverte</span></div><p>Appel gratuit de 30 minutes pour échanger sur votre projet, vos objectifs et vos contraintes.</p></div>,left:null},
              {left:<div className="process-card process-card-step--2 fade-up-lg"><div className="process-card-head process-card-head--start"><span className="num">02</span><span className="process-step-title" style={{fontWeight:300,color:"#fff"}}>Proposition</span></div><p>Devis détaillé, planning clair et transparent. Pas de mauvaise surprise, vous savez exactement où vous allez.</p></div>,right:null},
              {right:<div className="process-card process-card-step--3 fade-up-lg"><div className="process-card-head process-card-head--end"><span className="num">03</span><span className="process-step-title" style={{fontWeight:300,color:"#fff"}}>Création</span></div><p>Développement itératif avec points réguliers. Vous validez chaque étape avant de passer à la suivante.</p></div>,left:null},
              {left:<div className="process-card process-card-step--4 fade-up-lg"><div className="process-card-head process-card-head--start"><span className="num">04</span><span className="process-step-title" style={{fontWeight:300}}>Livraison</span></div><p>Mise en ligne, formation à la prise en main et support inclus. Vous êtes accompagné même après.</p></div>,right:null},
            ].map(({right, left}, i) => (
              <div className="process-row" key={i} style={{marginBottom:i<3?"-16px":"0",marginTop:i===3?"16px":"0"}}>
                <div className="process-slot-col1">{right}</div>
                <div className="process-slot-col2">{left}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:56}} className="fade-up">
            <p style={{color:"var(--text-muted)",marginBottom:16,fontWeight:300}}>Prêt à démarrer ?</p>
            <AnimatedButton className="btn-dark" href="#contact">
              Réserver un appel découverte <ArrowRight />
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* ── VIDÉO PROPOSITION (scroll scrub) ── */}
      <VideoPropositionSection />

      {/* ── PORTFOLIO ── */}
      <section className="portfolio" id="portfolio">
        <div className="container">
          <div style={{textAlign:"center",maxWidth:768,margin:"0 auto 96px"}}>
            <span className="section-label section-label-white">Portfolio</span>
            <h2 className="section-title fade-up">
              Quelques <span style={{color:"var(--accent)"}}>projets</span> récents
            </h2>
            <p className="section-desc fade-up">
              Découvrez une sélection de réalisations qui illustrent mon approche et mon savoir-faire.
            </p>
          </div>
          <div className="portfolio-grid">
            {PROJECTS.map((p, i) => (
              <a
                className="project-card fade-up"
                key={i}
                href="#"
                style={{ transitionDelay: `${i * 80}ms` }}
                aria-label={`Voir le projet : ${p.title}`}
              >
                <div className="project-thumb">
                  <img src={p.img} alt={`Aperçu — ${p.title}`} loading="lazy" style={p.imgStyle} />
                </div>
                <div className="project-info">
                  <h3>{p.title}</h3>
                  <div className="project-tags">{p.tags.map((t,j) => <span key={j} className="project-tag">{t}</span>)}</div>
                </div>
              </a>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:0}} className="fade-up">
            <AnimatedButton className="btn-dark" href="#">
              Voir plus de projets <ArrowRight />
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials" id="temoignages">
        <div className="container">
          <div style={{textAlign:"center",maxWidth:768,margin:"0 auto 48px"}} className="fade-up">
            <AnimatedButton as="span" className="section-label">
              Témoignages
            </AnimatedButton>
            <h2 className="section-title">Ce que disent mes <span style={{color:"var(--accent)"}}>clients</span></h2>
          </div>
        </div>
        <div className="testimonials-carousel" style={{marginTop:32}}>
          {TESTIMONIALS.map((t, i) => (
            <div className="testi-card" key={i} style={getStyle(i)}>
              <div className="testi-stars">{[...Array(5)].map((_,k) => <Star key={k}/>)}</div>
              <p className="testi-quote">"{t.text}"</p>
              <div className="testi-meta">
                <span className="testi-name">{t.name}</span>
                <time className="testi-date">{t.date}</time>
              </div>
            </div>
          ))}
          <button className="carousel-btn carousel-btn-prev" onClick={() => setTestiIdx((testitIdx - 1 + tLen) % tLen)} aria-label="Précédent"><ChevLeft/></button>
          <button className="carousel-btn carousel-btn-next" onClick={() => setTestiIdx((testitIdx + 1) % tLen)} aria-label="Suivant"><ChevRight/></button>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq" id="faq">
        <div className="container-md">
          <div style={{textAlign:"center",marginBottom:32}} className="fade-up">
            <h2 className="section-title" style={{marginBottom:40}}>Vos <span style={{color:"var(--accent)"}}>questions</span> les plus fréquentes</h2>
          </div>
          {FAQS.map((f, i) => (
            <div className="faq-item fade-up" key={i} style={{transitionDelay:`${i*60}ms`}}>
              <button
                type="button"
                className={`faq-btn ${faqOpen === i ? "open" : ""}`}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                aria-expanded={faqOpen === i}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
              >
                <h3>{f.q}</h3>
                <ChevronDown/>
              </button>
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-trigger-${i}`}
                className={`faq-answer ${faqOpen === i ? "is-open" : ""}`}
                hidden={faqOpen !== i}
              >
                {f.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="contact" id="contact">
        <div className="container">
          <h2 className="section-title section-title-lg fade-up">
            Prêt à donner vie à <span style={{color:"var(--accent)"}}>votre projet ?</span>
          </h2>
          <p className="section-desc fade-up" style={{maxWidth:700,margin:"0 auto 28px"}}>
            Que vous ayez besoin d'un site internet, d'une boutique en ligne ou d'une stratégie digitale complète, commençons par un appel découverte de 30 minutes.<br/>
            <span>Gratuit, sans engagement.</span>
          </p>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:28}} className="fade-up">
            <AnimatedButton className="btn-dark" href="#" style={{ padding: "16px 32px", fontSize: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
              Réserver un appel découverte
            </AnimatedButton>
          </div>
          <p className="section-desc" style={{fontSize:14,marginBottom:8}}>Ou contactez-moi directement :</p>
          <a href="mailto:contact@micha-megret.fr" className="contact-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
            contact@micha-megret.fr
          </a>
          <div className="divider"><div className="divider-line"/><span className="divider-text">ou</span><div className="divider-line"/></div>
          <div className="contact-form-wrap fade-up">
            <h3>Envoyez-moi un message</h3>
            <form style={{maxWidth:672,margin:"0 auto"}} onSubmit={e=>e.preventDefault()}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="contact-name">Nom complet <span>*</span></label>
                  <input id="contact-name" name="name" type="text" autoComplete="name" className="form-input" placeholder="Jean Dupont" />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email <span>*</span></label>
                  <input id="contact-email" name="email" type="email" autoComplete="email" className="form-input" placeholder="jean@example.fr" />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="contact-phone">Téléphone <span style={{ color: "var(--accent)", fontWeight: 300 }}>(optionnel)</span></label>
                  <input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className="form-input" placeholder="+33 6 00 00 00 00" />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-subject">Sujet <span>*</span></label>
                  <input id="contact-subject" name="subject" type="text" className="form-input" placeholder="Création site vitrine" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label htmlFor="contact-message">Votre message <span>*</span></label>
                <textarea id="contact-message" name="message" className="form-textarea" rows={4} placeholder="Décrivez votre projet..." />
              </div>
              <div style={{paddingTop:8,display:"flex",justifyContent:"center"}}>
                <AnimatedButton type="submit" className="btn-dark" style={{ padding: "16px 32px", fontSize: 16 }}>
                  Envoyer mon message
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12zm0 0h7.5"/></svg>
                </AnimatedButton>
              </div>
            </form>
          </div>
          <div className="trust-badges fade-up">
            {["Réponse sous 24h","Sans engagement","Devis gratuit"].map((b,i) => (
              <div key={i} className="trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={i===0?"M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z":i===1?"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z":"M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"}/>
                </svg>
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div style={{maxWidth:1536,margin:"0 auto",padding:"0 48px"}}>
          <div className="footer-grid">
            <div>
              <h4 className="footer-heading">Navigation</h4>
              <ul className="footer-links">
                {["Accueil","Réalisations","À propos","Méthode IA","Contact"].map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="footer-heading">Services</h4>
              <ul className="footer-links">
                {["Identité & Design","Sites Web","Applications Web","E-Commerce","SEO & Croissance","Automatisation"].map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="footer-heading">Contact</h4>
              <ul className="footer-links">
                <li><a href="mailto:contact@micha-megret.fr">contact@micha-megret.fr</a></li>
                <li><a href="tel:+33687934647">+33 6 87 93 46 47</a></li>
              </ul>
              <div className="footer-socials" style={{marginTop:16}}>
                {["linkedin","x","github","facebook","instagram"].map(s => (
                  <a key={s} href="#" className="footer-social" aria-label={s}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      {s==="linkedin" && <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>}
                      {s==="x" && <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>}
                      {s==="github" && <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>}
                      {s==="facebook" && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>}
                      {s==="instagram" && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-zones">
            <h4>Zones d'intervention</h4>
            <p className="footer-zone-national">Toute la France</p>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 Damien Camici. Tous droits réservés.</p>
            <div className="footer-legal">
              <a href="#">Mentions légales</a>
              <a href="#">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>

    </>
  );
}

