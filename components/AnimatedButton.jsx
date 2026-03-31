import { motion, useReducedMotion } from "motion/react";

/**
 * Pilule interactive : léger ressort au survol / clic + reflet animé.
 * - lien : passez `href`
 * - bouton : défaut ou `type="submit"`
 * - libellé de section (non cliquable) : `as="span"`
 */
export function AnimatedButton({
  as,
  href,
  type = "button",
  className = "",
  style,
  onClick,
  children,
  disabled,
  ...rest
}) {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion
    ? {}
    : {
        whileHover: { scale: 1.02, y: -1 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 280, damping: 32, mass: 0.65 },
      };

  const cls = `animated-button ${className}`.trim();
  const sheen = <span className="animated-button__sheen" aria-hidden />;

  if (as === "span") {
    return (
      <motion.span className={cls} style={style} {...motionProps} {...rest}>
        {sheen}
        {children}
      </motion.span>
    );
  }

  if (href != null && href !== "" && !disabled) {
    return (
      <motion.a
        href={href}
        className={cls}
        style={style}
        onClick={onClick}
        {...motionProps}
        {...rest}
      >
        {sheen}
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      className={cls}
      style={style}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
      {...rest}
    >
      {sheen}
      {children}
    </motion.button>
  );
}

export default AnimatedButton;
