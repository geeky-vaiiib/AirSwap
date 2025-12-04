import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, TrendingUp, Camera, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NDVIData {
  ndviDelta: number;
  beforeImage: string;
  afterImage: string;
}

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ndviData: NDVIData | null;
  onIssueCredit: () => void;
}

const RightPanel = ({ isOpen, onClose, ndviData, onIssueCredit }: RightPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md glass shadow-soft-lg z-20 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-forest text-lg">
                  NDVI Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vegetation growth verification
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {ndviData ? (
                <>
                  {/* NDVI Delta */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-teal/20 to-emerald/10 border border-teal/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-teal/20 flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-teal" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          NDVI Change
                        </div>
                        <div className="text-3xl font-display font-bold text-teal">
                          +{ndviData.ndviDelta}%
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Before/After Images */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-forest">
                      Satellite Imagery
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="aspect-square rounded-xl bg-forest/10 overflow-hidden relative">
                          <img
                            src={ndviData.beforeImage}
                            alt="Before"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/50 text-white text-xs">
                            Before
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="aspect-square rounded-xl bg-forest/10 overflow-hidden relative">
                          <img
                            src={ndviData.afterImage}
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

                  {/* Evidence Upload */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-forest">
                      Upload Evidence (Optional)
                    </h4>
                    <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-teal/50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-6 h-6 text-forest" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Drop photos or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG up to 10MB
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-forest/10 flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-forest/50" />
                    </div>
                    <div>
                      <p className="font-medium text-forest">No area selected</p>
                      <p className="text-sm text-muted-foreground">
                        Draw a polygon on the map to analyze
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {ndviData && (
              <div className="p-6 border-t border-border/50">
                <Button
                  onClick={onIssueCredit}
                  variant="hero"
                  className="w-full"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  Issue Oxygen Credit (Demo)
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightPanel;
