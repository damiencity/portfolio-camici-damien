import { lazy, Suspense, useEffect, useRef, useState } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

function useSplineAllowed(sceneUrl) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!sceneUrl || typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (window.innerWidth <= 768) return;

    const cores =
      typeof navigator.hardwareConcurrency === "number"
        ? navigator.hardwareConcurrency
        : 4;
    if (cores <= 2) return;

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return;

    setAllowed(true);
  }, [sceneUrl]);

  return allowed;
}

/**
 * Scène Spline 3D **optionnelle** par-dessus `HeroBackground` (canvas 2D).
 *
 * Configuration Vite : dans `.env` local
 *   VITE_SPLINE_SCENE_URL=https://prod.spline.design/XXXX/scene.splinecode
 *
 * Dans Spline → Export → Code → Play Settings recommandés :
 * - Hide Background ON (fond transparent → le canvas 2D reste visible)
 * - Page Scroll / Zoom / Pan OFF (évite le scroll hijacking)
 * - Geometry Quality : Performance
 * - Régénérer l’URL après changement des réglages
 */
export default function HeroSplineLayer() {
  const sceneUrl = (import.meta.env.VITE_SPLINE_SCENE_URL || "").trim();
  const allowed = useSplineAllowed(sceneUrl);
  const [shouldMount, setShouldMount] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!allowed || !sceneUrl || !wrapRef.current) return;
    const el = wrapRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldMount(true);
          io.disconnect();
        }
      },
      { root: null, rootMargin: "100px 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [allowed, sceneUrl]);

  if (!sceneUrl || !allowed) return null;

  return (
    <div ref={wrapRef} className="hero-spline-layer" aria-hidden="true">
      {shouldMount && (
        <Suspense fallback={<div className="hero-placeholder" />}>
          <Spline
            scene={sceneUrl}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              pointerEvents: "none",
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
