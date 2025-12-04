import { motion } from "framer-motion";

interface GradientBackgroundProps {
  variant?: "hero" | "subtle" | "dark";
  children?: React.ReactNode;
  className?: string;
}

const GradientBackground = ({
  variant = "hero",
  children,
  className = "",
}: GradientBackgroundProps) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div
        className={`absolute inset-0 ${
          variant === "hero"
            ? "bg-gradient-to-br from-forest via-emerald to-forest-light"
            : variant === "dark"
            ? "bg-forest-dark"
            : "bg-gradient-to-b from-sand to-sand-dark"
        }`}
      />

      {/* Animated gradient orbs */}
      {variant === "hero" && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-light/40 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-glow/20 rounded-full blur-3xl"
          />
        </>
      )}

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GradientBackground;
