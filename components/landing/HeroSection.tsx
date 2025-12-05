"use client";

import { motion } from "framer-motion";
import { ArrowRight, Leaf, TreeDeciduous, Wind } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GradientBackground from "@/components/layout/GradientBackground";

const HeroSection = () => {
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
            >
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-sm text-white/90">
                Powered by Satellite Verification
              </span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight">
                Verify Green Growth.
                <br />
                <span className="text-teal">Earn Oxygen Credits.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed">
                AirSwap uses satellite NDVI data to verify vegetation growth and
                issue blockchain-backed Oxygen Credits to landowners worldwide.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/map">
                <Button variant="hero" size="xl">
                  Try Demo Map
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="glass" size="xl">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8">
              {[
                { value: "2.4M", label: "Credits Issued" },
                { value: "850K", label: "Hectares Verified" },
                { value: "12K", label: "Contributors" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-display font-bold text-teal">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - NDVI Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
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
                  {/* Grid pattern */}
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
                          <div className="text-2xl font-display font-bold text-forest">
                            Growing
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center">
                          <TreeDeciduous className="w-6 h-6 text-teal" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom info */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
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
              </motion.div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 w-20 h-20 rounded-2xl glass-dark flex items-center justify-center shadow-glow"
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
