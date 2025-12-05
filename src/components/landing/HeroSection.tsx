import { motion } from "framer-motion";
import { ArrowRight, Leaf, TreeDeciduous, Wind, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GradientBackground from "@/components/layout/GradientBackground";
import { toast } from "@/hooks/use-toast";

interface HeroSectionProps {
  ndvi?: number;
}

const HeroSection = ({ ndvi = 14.2 }: HeroSectionProps) => {
  const handleDemoCredit = () => {
    toast({
      title: "Oxygen Credit Issued! 🎉",
      description: "847 Oxygen Credits have been added to your account (Demo)",
    });
  };

  return (
    <GradientBackground variant="hero" className="min-h-screen">
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark"
              role="status"
              aria-label="Powered by Satellite Verification"
            >
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" aria-hidden="true" />
              <span className="text-sm text-white/90">
                Powered by Satellite Verification
              </span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight"
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Verify Green Growth.
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-teal"
                >
                  Earn Oxygen Credits.
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed"
              >
                AirSwap uses satellite NDVI data to verify vegetation growth and
                issue blockchain-backed Oxygen Credits to landowners worldwide.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/map" aria-label="Try Demo Map - Navigate to interactive map">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button variant="hero" size="xl" className="focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2">
                    Try Demo Map
                    <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/signup" aria-label="Get Started - Create an account">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button variant="glass" size="xl" className="focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex gap-8 pt-8"
              role="region"
              aria-label="Platform statistics"
            >
              {[
                { value: "2.4M", label: "Credits Issued" },
                { value: "850K", label: "Hectares Verified" },
                { value: "12K", label: "Contributors" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-display font-bold text-teal" aria-label={`${stat.value} ${stat.label}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - NDVI Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="glass rounded-3xl p-8 shadow-glow"
              >
                {/* NDVI Heatmap Visualization */}
                <div className="aspect-square rounded-2xl overflow-hidden relative bg-gradient-to-br from-forest-dark to-emerald">
                  {/* Grid pattern using SVG */}
                  <div className="absolute inset-0 opacity-60">
                    <img
                      src="/hero/ndvi-grid.svg"
                      alt="NDVI heatmap visualization"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to generated grid if SVG doesn't load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  {/* Fallback grid pattern */}
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-1 p-4">
                    {Array.from({ length: 64 }).map((_, i) => {
                      const intensity = Math.random();
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="rounded-lg"
                          style={{
                            backgroundColor: `hsl(${140 + intensity * 30}, ${
                              60 + intensity * 30
                            }%, ${30 + intensity * 40}%)`,
                          }}
                          aria-hidden="true"
                        />
                      );
                    })}
                  </div>

                  {/* Overlay info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-forest/60 uppercase tracking-wider">
                            NDVI Index
                          </div>
                          <div className="text-2xl font-display font-bold text-forest" aria-label={`NDVI change: +${ndvi}%`}>
                            +{ndvi}%
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center" aria-hidden="true">
                          <TreeDeciduous className="w-6 h-6 text-teal" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom info */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center" aria-hidden="true">
                      <Leaf className="w-5 h-5 text-forest" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-forest">
                        Amazon Basin
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last verified 2 hours ago
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-teal/20 text-teal text-sm font-medium">
                    Verified
                  </div>
                </div>

                {/* Demo CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-4"
                >
                  <Button
                    onClick={handleDemoCredit}
                    variant="outline"
                    size="sm"
                    className="w-full border-teal/30 text-teal hover:bg-teal/10 focus-visible:ring-2 focus-visible:ring-teal"
                    aria-label="Issue Oxygen Credit (Demo)"
                  >
                    <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                    Issue Oxygen Credit (demo)
                  </Button>
                </motion.div>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 w-20 h-20 rounded-2xl glass-dark flex items-center justify-center shadow-glow"
                aria-hidden="true"
              >
                <Wind className="w-8 h-8 text-teal" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-4 -left-8 px-6 py-3 rounded-2xl glass shadow-soft"
                aria-hidden="true"
              >
                <div className="text-sm font-medium text-forest">
                  +847 O₂ Credits
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </GradientBackground>
  );
};

export default HeroSection;
