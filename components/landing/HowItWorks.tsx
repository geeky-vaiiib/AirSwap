"use client";

import { motion } from "framer-motion";
import { MapPin, Satellite, Coins } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Draw Your Land",
    description:
      "Use our interactive map to draw polygon boundaries around your land or forest area.",
    color: "from-forest to-emerald",
  },
  {
    icon: Satellite,
    title: "Satellite Verification",
    description:
      "Our system analyzes NDVI data from satellites to measure vegetation growth over time.",
    color: "from-emerald to-teal",
  },
  {
    icon: Coins,
    title: "Earn Credits",
    description:
      "Verified growth translates to Oxygen Credits that can be traded or held.",
    color: "from-teal to-teal-glow",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-sand relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-20 left-10 w-72 h-72 bg-forest/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-forest mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to start earning Oxygen Credits from your
            verified green growth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-forest/20 to-transparent" />
              )}

              <div className="glass rounded-3xl p-8 h-full hover:shadow-soft-lg transition-all duration-500 group-hover:-translate-y-2">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-sand flex items-center justify-center border-2 border-forest/20">
                  <span className="font-display font-bold text-forest">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-soft`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-xl font-display font-bold text-forest mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
