import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, AlertCircle, User, Calendar, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: {
    id: string;
    contributor: string;
    location: string;
    date: string;
    ndviDelta: number;
    beforeImage: string;
    afterImage: string;
  } | null;
  onApprove: () => void;
  onReject: () => void;
  onRequestMore: () => void;
}

const VerifierModal = ({
  isOpen,
  onClose,
  claim,
  onApprove,
  onReject,
  onRequestMore,
}: VerifierModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && claim && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-forest/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card rounded-3xl shadow-soft-lg z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-forest text-xl">
                  Verify Claim
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review satellite data and evidence
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-forest/10 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-forest" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Claim Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-forest/5">
                  <User className="w-5 h-5 text-forest" />
                  <div>
                    <div className="text-xs text-muted-foreground">Contributor</div>
                    <div className="font-medium text-forest">{claim.contributor}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-forest/5">
                  <MapPin className="w-5 h-5 text-forest" />
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="font-medium text-forest">{claim.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-forest/5">
                  <Calendar className="w-5 h-5 text-forest" />
                  <div>
                    <div className="text-xs text-muted-foreground">Submitted</div>
                    <div className="font-medium text-forest">{claim.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-teal/10">
                  <TrendingUp className="w-5 h-5 text-teal" />
                  <div>
                    <div className="text-xs text-muted-foreground">NDVI Change</div>
                    <div className="font-bold text-teal">+{claim.ndviDelta}%</div>
                  </div>
                </div>
              </div>

              {/* Satellite Images */}
              <div className="space-y-3">
                <h4 className="font-medium text-forest">Satellite Imagery</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="aspect-video rounded-xl bg-forest/10 overflow-hidden relative">
                      <img
                        src={claim.beforeImage}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/50 text-white text-xs">
                        Before
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="aspect-video rounded-xl bg-forest/10 overflow-hidden relative">
                      <img
                        src={claim.afterImage}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-teal/80 text-forest text-xs">
                        After
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div className="space-y-3">
                <h4 className="font-medium text-forest">Evidence Photos</h4>
                <div className="p-8 rounded-xl border-2 border-dashed border-border text-center">
                  <p className="text-muted-foreground">No evidence uploaded</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3">
              <Button onClick={onReject} variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button onClick={onRequestMore} variant="outline" className="flex-1">
                <AlertCircle className="w-4 h-4" />
                Request More
              </Button>
              <Button onClick={onApprove} variant="hero" className="flex-1">
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VerifierModal;
