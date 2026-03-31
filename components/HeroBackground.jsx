/**
 * HeroBackground — Canvas 2D. DPR + coords entières pour limiter bandes / coutures.
 */
import { useEffect, useRef } from "react";

export default function HeroBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const root = canvas.closest(".hero") || parent;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let animId = 0;

    let mx = 0.5;
    let my = 0.5;
    let smx = 0.5;
    let smy = 0.5;
    let isHover = false;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const lw = Math.max(1, Math.floor(parent.clientWidth));
      const lh = Math.max(1, Math.floor(parent.clientHeight));
      canvas.width = Math.floor(lw * dpr);
      canvas.height = Math.floor(lh * dpr);
      canvas.style.width = `${lw}px`;
      canvas.style.height = `${lh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = lw;
      H = lh;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    function onMove(e) {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / Math.max(r.width, 1);
      my = (e.clientY - r.top) / Math.max(r.height, 1);
    }
    function onEnter() {
      isHover = true;
    }
    function onLeave() {
      isHover = false;
    }

    root.addEventListener("mousemove", onMove, { passive: true, capture: true });
    root.addEventListener("mouseenter", onEnter, true);
    root.addEventListener("mouseleave", onLeave, true);

    const COUNT = 65;
    const filaments = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0006,
      life: Math.random(),
      speed: 0.0003 + Math.random() * 0.0005,
      size: 0.8 + Math.random() * 2.5,
      orange: Math.random() > 0.65,
      len: 40 + Math.random() * 60,
    }));

    let t = 0;

    function draw() {
      t += 0.01;

      smx += (mx - smx) * 0.048;
      smy += (my - smy) * 0.048;

      /* Trail un peu plus « mou » : moins de strates visibles / coutures */
      ctx.fillStyle = "rgba(10,10,10,0.19)";
      ctx.fillRect(0, 0, W, H);

      const cx = W * 0.5;
      const cy = H * 0.45;

      if (isHover) {
        const gx = smx * W;
        const gy = smy * H;
        const rHalo = Math.min(W, H) * 0.42;
        const halo = ctx.createRadialGradient(gx, gy, 0, gx, gy, rHalo);
        halo.addColorStop(0, "rgba(232,115,10,0.18)");
        halo.addColorStop(0.45, "rgba(180,55,0,0.06)");
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, W, H);
      }

      const rCore = Math.min(W, H) * 0.55;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rCore);
      cg.addColorStop(0, "rgba(100,30,0,0.085)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);

      for (const f of filaments) {
        f.life += f.speed;
        if (f.life > 1) {
          f.life = 0;
          f.x = Math.random();
          f.y = Math.random();
        }

        if (isHover) {
          const dx = smx - f.x;
          const dy = smy - f.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 0.38) {
            f.x += dx * 0.0018;
            f.y += dy * 0.0018;
          }
        }

        f.x += f.vx + Math.sin(t * 0.8 + f.y * 9) * 0.00025;
        f.y += f.vy + Math.cos(t * 0.6 + f.x * 7) * 0.0002;

        if (f.x < 0) f.x = 1;
        if (f.x > 1) f.x = 0;
        if (f.y < 0) f.y = 1;
        if (f.y > 1) f.y = 0;

        const alpha = Math.sin(f.life * Math.PI) * 0.9;
        const px = f.x * W;
        const py = f.y * H;

        const angle = Math.atan2(
          f.vy + Math.cos(t + f.x * 5) * 0.001,
          f.vx + Math.sin(t + f.y * 4) * 0.001
        );

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);

        const lg = ctx.createLinearGradient(-f.len / 2, 0, f.len / 2, 0);
        if (f.orange) {
          lg.addColorStop(0, "rgba(232,115,10,0)");
          lg.addColorStop(0.5, `rgba(232,115,10,${alpha})`);
          lg.addColorStop(1, "rgba(232,115,10,0)");
        } else {
          lg.addColorStop(0, "rgba(80,28,4,0)");
          lg.addColorStop(0.5, `rgba(150,55,8,${alpha * 0.45})`);
          lg.addColorStop(1, "rgba(80,28,4,0)");
        }

        ctx.strokeStyle = lg;
        ctx.lineWidth = f.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-f.len / 2, 0);
        ctx.lineTo(f.len / 2, 0);
        ctx.stroke();
        ctx.restore();
      }

      const vigR = Math.hypot(W, H) * 0.48;
      const vg = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.2, cx, cy, vigR);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.78)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      root.removeEventListener("mousemove", onMove, { capture: true });
      root.removeEventListener("mouseenter", onEnter, true);
      root.removeEventListener("mouseleave", onLeave, true);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
