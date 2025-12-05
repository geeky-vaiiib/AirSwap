"use client";

import { motion } from "framer-motion";
import { Shield, Globe, BarChart3, Users, Zap, Lock, Satellite } from "lucide-react";

const features = [
  {
    icon: Satellite,
    title: "Satellite-Verified",
    description:
      "Real NDVI data from orbital satellites ensures accurate vegetation measurement.",
  },
  {
    icon: Shield,
    title: "Blockchain Secured",
    description:
      "Every credit is minted on-chain with full transparency and immutability.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description:
      "Monitor and verify land anywhere on Earth with our worldwide satellite network.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track vegetation changes and credit earnings with live dashboard updates.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Join thousands of contributors, companies, and verifiers in the ecosystem.",
  },
  {
    icon: Zap,
    title: "Instant Payouts",
    description:
      "Credits are issued immediately upon verification with no waiting periods.",
  },
];



const Features = () => {
  return (
    <section className="py-24 bg-forest relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-light rounded-full blur-[100px]"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Built for Trust & Scale
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            AirSwap combines cutting-edge satellite technology with blockchain
            to create the most reliable carbon credit ecosystem.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-teal/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center mb-4 group-hover:bg-teal/30 transition-colors">
                <feature.icon className="w-6 h-6 text-teal" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
