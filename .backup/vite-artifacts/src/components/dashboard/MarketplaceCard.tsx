import { motion } from "framer-motion";
import { User, TrendingUp, Coins, Calendar, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketplaceCardProps {
  id: string;
  contributor: string;
  ndviDelta: number;
  credits: number;
  date: string;
  price: number;
  onBuy?: () => void;
}

const MarketplaceCard = ({
  id,
  contributor,
  ndviDelta,
  credits,
  date,
  price,
  onBuy,
}: MarketplaceCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-2xl overflow-hidden hover:shadow-soft-lg transition-all duration-300"
    >
      {/* Visual header */}
      <div className="h-24 bg-gradient-to-br from-forest to-emerald relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-6 gap-1 p-4 w-full">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm"
                style={{
                  backgroundColor: `hsl(${150 + Math.random() * 20}, ${
                    60 + Math.random() * 30
                  }%, ${40 + Math.random() * 30}%)`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-teal/90 text-forest text-xs font-medium">
          +{ndviDelta}%
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Contributor */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center">
            <User className="w-4 h-4 text-forest" />
          </div>
          <div>
            <div className="text-sm font-medium text-forest">{contributor}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {date}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex-1 p-2 rounded-lg bg-forest/5 text-center">
            <Coins className="w-4 h-4 text-forest mx-auto mb-1" />
            <div className="text-lg font-display font-bold text-forest">
              {credits}
            </div>
            <div className="text-xs text-muted-foreground">Credits</div>
          </div>
          <div className="flex-1 p-2 rounded-lg bg-teal/10 text-center">
            <TrendingUp className="w-4 h-4 text-teal mx-auto mb-1" />
            <div className="text-lg font-display font-bold text-teal">
              ${price}
            </div>
            <div className="text-xs text-muted-foreground">Price</div>
          </div>
        </div>

        {/* Buy Button */}
        <Button onClick={onBuy} variant="hero" className="w-full" size="sm">
          <ShoppingCart className="w-4 h-4" />
          Buy Credits
        </Button>
      </div>
    </motion.div>
  );
};

export default MarketplaceCard;
