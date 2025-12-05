import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, User, ArrowRight, Building2, CheckCircle, TreeDeciduous } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GradientBackground from "@/components/layout/GradientBackground";
import { cn } from "@/lib/utils";

type Role = "contributor" | "company" | "verifier";

const roles = [
  {
    id: "contributor" as Role,
    icon: TreeDeciduous,
    title: "Contributor",
    description: "Submit land for verification and earn credits",
  },
  {
    id: "company" as Role,
    icon: Building2,
    title: "Company",
    description: "Purchase verified Oxygen Credits",
  },
  {
    id: "verifier" as Role,
    icon: CheckCircle,
    title: "Verifier",
    description: "Review and approve submitted claims",
  },
];

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("contributor");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/dashboard/${selectedRole}`);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Visual */}
      <div className="hidden lg:block flex-1 relative">
        <GradientBackground variant="hero" className="h-full">
          <div className="flex items-center justify-center h-full p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-lg text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-8"
              >
                <Leaf className="w-12 h-12 text-teal" />
              </motion.div>
              <h2 className="text-4xl font-display font-bold text-white mb-4">
                Join the Green Revolution
              </h2>
              <p className="text-white/80 text-lg">
                Be part of a global community verifying vegetation growth and
                creating a sustainable future.
              </p>
              <div className="mt-12 flex justify-center gap-8">
                {[
                  { value: "2.4M", label: "Credits" },
                  { value: "12K", label: "Members" },
                  { value: "50+", label: "Countries" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className="text-3xl font-display font-bold text-teal">
                      {stat.value}
                    </div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </GradientBackground>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest to-emerald flex items-center justify-center">
              <Leaf className="w-6 h-6 text-teal" />
            </div>
            <span className="font-display text-2xl font-bold text-forest">
              AirSwap
            </span>
          </Link>

          <div>
            <h1 className="text-3xl font-display font-bold text-forest mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Start your journey towards a greener future.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Select your role</Label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <motion.button
                    key={role.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-center transition-all duration-300",
                      selectedRole === role.id
                        ? "border-teal bg-teal/10"
                        : "border-border hover:border-teal/50"
                    )}
                  >
                    <role.icon
                      className={cn(
                        "w-6 h-6 mx-auto mb-2",
                        selectedRole === role.id
                          ? "text-teal"
                          : "text-muted-foreground"
                      )}
                    />
                    <div
                      className={cn(
                        "text-sm font-medium",
                        selectedRole === role.id
                          ? "text-forest"
                          : "text-muted-foreground"
                      )}
                    >
                      {role.title}
                    </div>
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {roles.find((r) => r.id === selectedRole)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-2 border-border focus:border-teal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-2 border-border focus:border-teal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-2 border-border focus:border-teal"
                />
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full" size="lg">
              Create Account
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-teal font-medium hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
