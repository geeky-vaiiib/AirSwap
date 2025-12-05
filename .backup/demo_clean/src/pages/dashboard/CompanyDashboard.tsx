import { motion } from "framer-motion";
import { Briefcase, TrendingUp, ShoppingCart, Coins, ArrowRight } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MarketplaceCard from "@/components/dashboard/MarketplaceCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const marketplaceData = [
  {
    id: "MKT-001",
    contributor: "Amazon Conservation",
    ndviDelta: 14.2,
    credits: 847,
    date: "Dec 1, 2024",
    price: 12.50,
  },
  {
    id: "MKT-002",
    contributor: "Green Earth Fund",
    ndviDelta: 11.8,
    credits: 523,
    date: "Nov 28, 2024",
    price: 8.75,
  },
  {
    id: "MKT-003",
    contributor: "Rainforest Alliance",
    ndviDelta: 16.5,
    credits: 1024,
    date: "Nov 25, 2024",
    price: 15.00,
  },
  {
    id: "MKT-004",
    contributor: "EcoTrust",
    ndviDelta: 9.3,
    credits: 412,
    date: "Nov 22, 2024",
    price: 6.25,
  },
];

const CompanyDashboard = () => {
  const handleBuy = (id: string) => {
    toast({
      title: "Purchase Initiated",
      description: `Starting purchase for listing ${id} (Demo)`,
    });
  };

  return (
    <div className="flex h-screen bg-sand">
      <DashboardSidebar role="company" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-forest mb-2">
              Company Dashboard
            </h1>
            <p className="text-muted-foreground">
              Browse and purchase verified Oxygen Credits.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-teal" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                2,450
              </div>
              <div className="text-sm text-muted-foreground">Portfolio Credits</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-forest" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                12
              </div>
              <div className="text-sm text-muted-foreground">Purchases</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                +8.3%
              </div>
              <div className="text-sm text-muted-foreground">Portfolio Growth</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                $28,450
              </div>
              <div className="text-sm text-muted-foreground">Total Invested</div>
            </div>
          </motion.div>

          {/* Marketplace */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-forest">
                Marketplace
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  Filters
                </Button>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {marketplaceData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <MarketplaceCard
                    {...item}
                    onBuy={() => handleBuy(item.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Portfolio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-forest">
                My Portfolio
              </h2>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-6">
                {[
                  { name: "Amazon Credits", credits: 1200, growth: "+12%" },
                  { name: "Congo Credits", credits: 850, growth: "+8%" },
                  { name: "Indonesia Credits", credits: 400, growth: "+5%" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-forest/5">
                    <div className="text-sm text-muted-foreground mb-1">
                      {item.name}
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-display font-bold text-forest">
                        {item.credits}
                      </span>
                      <span className="text-sm text-teal font-medium">
                        {item.growth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
