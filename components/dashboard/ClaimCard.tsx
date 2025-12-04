import { motion } from "framer-motion";
import { MapPin, Calendar, TrendingUp, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaimCardProps {
  id: string;
  location: string;
  date: string;
  ndviDelta: number;
  status: "pending" | "verified" | "rejected";
  credits?: number;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
  },
  verified: {
    label: "Verified",
    className: "bg-teal/20 text-teal",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/20 text-destructive",
  },
};

const ClaimCard = ({ id, location, date, ndviDelta, status, credits }: ClaimCardProps) => {
  const statusStyle = statusConfig[status];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-5 space-y-4 hover:shadow-soft-lg transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-forest" />
          </div>
          <div>
            <h4 className="font-medium text-forest">{location}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {date}
            </div>
          </div>
        </div>
        <button className="w-8 h-8 rounded-lg hover:bg-forest/10 flex items-center justify-center transition-colors">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex-1 p-3 rounded-xl bg-teal/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal" />
            <span className="text-sm text-muted-foreground">NDVI</span>
          </div>
          <div className="text-lg font-display font-bold text-teal">
            +{ndviDelta}%
          </div>
        </div>
        {credits && (
          <div className="flex-1 p-3 rounded-xl bg-forest/10">
            <div className="text-sm text-muted-foreground">Credits</div>
            <div className="text-lg font-display font-bold text-forest">
              {credits}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">ID: {id}</span>
        <span className={cn("px-2 py-1 rounded-lg text-xs font-medium", statusStyle.className)}>
          {statusStyle.label}
        </span>
      </div>
    </motion.div>
  );
};

export default ClaimCard;
