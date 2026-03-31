import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Déplace légèrement le bloc vers le curseur (effet aimant).
 */
export default function Magnetic({ children, strength = 0.2 }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();

  const handleMouse = (e) => {
    if (reduceMotion || !ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * strength, y: middleY * strength });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: reduceMotion ? 0 : position.x, y: reduceMotion ? 0 : position.y }}
      transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.12 }}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}
