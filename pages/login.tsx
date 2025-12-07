"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GradientBackground from "@/components/layout/GradientBackground";
import { isDemo } from "@/lib/isDemo";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Demo mode - skip API call
    if (isDemo()) {
      toast({
        title: "Demo Mode",
        description: "Redirecting to dashboard...",
      });
      router.push("/dashboard/contributor");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      // Store session in localStorage
      if (data.user && data.access_token) {
        localStorage.setItem('airswap-session', JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          role: data.user.role,
          full_name: data.user.full_name,
          access_token: data.access_token,
        }));
      }

      toast({
        title: "Success!",
        description: "Logged in successfully",
      });

      // Redirect to appropriate dashboard based on role
      const role = data.user.role;
      router.push(`/dashboard/${role}`);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest to-emerald flex items-center justify-center">
              <Leaf className="w-6 h-6 text-teal" />
            </div>
            <span className="font-display text-2xl font-bold text-forest">
              AirSwap
            </span>
          </Link>

          <div>
            <h1 className="text-3xl font-display font-bold text-forest mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Log in to access your dashboard and credits.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-teal hover:underline">
                  Forgot password?
                </a>
              </div>
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

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-teal font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:block flex-1 relative">
        <GradientBackground variant="hero" className="h-full">
          <div className="flex items-center justify-center h-full p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass rounded-3xl p-8 max-w-lg"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-teal/20 flex items-center justify-center mx-auto">
                  <Leaf className="w-10 h-10 text-teal" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-forest mb-2">
                    Track Your Impact
                  </h2>
                  <p className="text-forest/70">
                    Monitor your vegetation growth and see your Oxygen Credits
                    accumulate in real-time.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <div className="text-2xl font-display font-bold text-forest">
                      847
                    </div>
                    <div className="text-sm text-forest/60">Credits Earned</div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-2xl font-display font-bold text-teal">
                      Active
                    </div>
                    <div className="text-sm text-forest/60">Growth Status</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </GradientBackground>
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  return {
    props: {}
  };
};

export default Login;

