import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, AlertCircle, Calendar, TrendingUp, MapPin } from "lucide-react";
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
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-forest" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Submitted</div>
                    <div className="font-bold text-forest text-base truncate">{claim.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 border border-teal-200 dark:border-teal-800">
                  <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-teal" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-teal-700 dark:text-teal-300 font-medium uppercase tracking-wide mb-1">NDVI Change</div>
                    <div className="font-bold text-teal text-xl">+{claim.ndviDelta}%</div>
                  </div>
                </div>
              </div>

              {/* Satellite Images */}
              <div className="space-y-3">
                <h4 className="font-semibold text-forest text-base">Satellite Imagery</h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Before Image */}
                  <div className="space-y-2">
                    <div className="h-48 rounded-xl bg-muted overflow-hidden relative border border-border shadow-sm">
                      {claim.beforeImage ? (
                        <img
                          src={claim.beforeImage}
                          alt="Before"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 dark:from-amber-900 dark:via-orange-950 dark:to-amber-950"
                        style={{ display: claim.beforeImage ? 'none' : 'flex' }}
                      >
                        <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-amber-800/50 flex items-center justify-center mb-3 shadow-lg">
                          <MapPin className="w-10 h-10 text-amber-600 dark:text-amber-300" />
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300 font-semibold">Before Image</p>
                        <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Satellite data pending</p>
                      </div>
                      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-gray-900/80 backdrop-blur-sm text-white text-xs font-semibold shadow-md">
                        Before
                      </div>
                    </div>
                  </div>
                  
                  {/* After Image */}
                  <div className="space-y-2">
                    <div className="h-48 rounded-xl bg-muted overflow-hidden relative border border-border shadow-sm">
                      {claim.afterImage ? (
                        <img
                          src={claim.afterImage}
                          alt="After"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 via-emerald-50 to-teal-50 dark:from-teal-900 dark:via-emerald-950 dark:to-teal-950"
                        style={{ display: claim.afterImage ? 'none' : 'flex' }}
                      >
                        <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-teal-800/50 flex items-center justify-center mb-3 shadow-lg">
                          <TrendingUp className="w-10 h-10 text-teal-600 dark:text-teal-300" />
                        </div>
                        <p className="text-sm text-teal-700 dark:text-teal-300 font-semibold">After Image</p>
                        <p className="text-xs text-teal-600/70 dark:text-teal-400/70 mt-1">Satellite data pending</p>
                      </div>
                      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-teal-600/90 backdrop-blur-sm text-white text-xs font-semibold shadow-md">
                        After
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div className="space-y-3">
                <h4 className="font-semibold text-forest text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Evidence Photos
                </h4>
                <div className="p-8 rounded-xl border-2 border-dashed border-border bg-muted/50 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                      <AlertCircle className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">No additional evidence uploaded</p>
                      <p className="text-xs text-muted-foreground/70">Satellite imagery is the primary evidence for this claim</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-gradient-to-br from-muted/30 to-muted/50">
              <div className="flex gap-3">
                <Button 
                  onClick={onReject} 
                  variant="outline" 
                  className="flex-1 gap-2 border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all font-semibold"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button 
                  onClick={onRequestMore} 
                  variant="outline" 
                  className="flex-1 gap-2 border-2 hover:bg-muted hover:border-forest/30 transition-all font-semibold"
                >
                  <AlertCircle className="w-4 h-4" />
                  Request More
                </Button>
                <Button 
                  onClick={onApprove} 
                  className="flex-1 gap-2 bg-teal hover:bg-teal/90 text-white shadow-md hover:shadow-lg transition-all font-semibold"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VerifierModal;
