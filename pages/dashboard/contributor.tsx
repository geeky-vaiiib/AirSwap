import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, TrendingUp, Coins, MapPin, ArrowRight } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ClaimCard from "@/components/dashboard/ClaimCard";
import { Button } from "@/components/ui/button";

const demoClaimsData = [
  {
    id: "CLM-001",
    location: "Amazon Basin, Brazil",
    date: "Dec 1, 2024",
    ndviDelta: 14.2,
    status: "verified" as const,
    credits: 847,
  },
  {
    id: "CLM-002",
    location: "Congo Rainforest",
    date: "Nov 28, 2024",
    ndviDelta: 11.8,
    status: "pending" as const,
  },
  {
    id: "CLM-003",
    location: "Borneo, Indonesia",
    date: "Nov 25, 2024",
    ndviDelta: 8.5,
    status: "verified" as const,
    credits: 523,
  },
];

const ContributorDashboard = () => {
  return (
    <div className="flex h-screen bg-sand">
      <DashboardSidebar role="contributor" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-forest mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground">
              Track your claims and earnings in one place.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-teal" />
                </div>
                <span className="text-xs text-teal font-medium">+12.5%</span>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                1,370
              </div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-forest" />
                </div>
                <span className="text-xs text-forest font-medium">3 active</span>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                5
              </div>
              <div className="text-sm text-muted-foreground">Total Claims</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald" />
                </div>
                <span className="text-xs text-emerald font-medium">Healthy</span>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                +11.5%
              </div>
              <div className="text-sm text-muted-foreground">Avg. NDVI Growth</div>
            </div>
          </motion.div>

          {/* Quick Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest to-emerald flex items-center justify-center">
                <Plus className="w-7 h-7 text-teal" />
              </div>
              <div>
                <h3 className="font-display font-bold text-forest text-lg">
                  Submit New Claim
                </h3>
                <p className="text-sm text-muted-foreground">
                  Draw your land on the map and get it verified
                </p>
              </div>
            </div>
            <Link href="/map">
              <Button variant="hero">
                Open Map
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Claims List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-forest">
                My Claims
              </h2>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoClaimsData.map((claim, index) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <ClaimCard {...claim} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ContributorDashboard;

