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
    evidence?: {
      name: string;
      type: string;
      url: string;
      category?: 'before' | 'after';
    }[];
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
            className="fixed inset-0 w-full h-full bg-forest/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
            {/* Header with Info Cards */}
            <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
              {/* Title Section */}
              <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-gray-900 dark:text-white text-2xl mb-1">
                      Verify Claim
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Review satellite data and evidence
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Claim Info Cards - Fixed at Top */}
              <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  {/* Submitted Card */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Calendar className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide mb-1">Submitted</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{claim.date}</p>
                    </div>
                  </div>

                  {/* NDVI Change Card */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-950 dark:to-emerald-900 border border-teal-200 dark:border-teal-800">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-teal-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <TrendingUp className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wide mb-1">NDVI Change</p>
                      <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">+{claim.ndviDelta}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content - Scrollable (Evidence and Satellite Images Only) */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="space-y-6">{/* Evidence Section */}
                {(() => {
                  const beforeEvidence = claim.evidence?.filter(ev => ev.category === 'before') || [];
                  const afterEvidence = claim.evidence?.filter(ev => ev.category === 'after') || [];

                  return beforeEvidence.length > 0 || afterEvidence.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        Evidence Photos
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Before Evidence Photos */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Before Reforestation</h5>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {beforeEvidence.map((photo, index) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img
                                  src={photo.url}
                                  alt={photo.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* After Evidence Photos */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">After Reforestation</h5>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {afterEvidence.map((photo, index) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img
                                  src={photo.url}
                                  alt={photo.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Satellite Images */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Satellite Imagery</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Before Image */}
                    <div className="relative group">
                      <div className="aspect-video rounded-2xl bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 dark:from-amber-950 dark:via-orange-950 dark:to-amber-900 overflow-hidden relative border-2 border-amber-200 dark:border-amber-800 shadow-md hover:shadow-lg transition-all">
                        {claim.beforeImage ? (
                          <img
                            src={claim.beforeImage}
                            alt="Before"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="image-placeholder absolute inset-0 flex flex-col items-center justify-center"
                          style={{ display: claim.beforeImage ? 'none' : 'flex' }}
                        >
                          <div className="w-20 h-20 rounded-full bg-white dark:bg-amber-900/50 flex items-center justify-center mb-3 shadow-lg">
                            <MapPin className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                          </div>
                          <p className="text-sm text-amber-800 dark:text-amber-300 font-bold">Before Image</p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Satellite data pending</p>
                        </div>
                        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold shadow-lg">
                          Before
                        </div>
                      </div>
                    </div>
                    
                    {/* After Image */}
                    <div className="relative group">
                      <div className="aspect-video rounded-2xl bg-gradient-to-br from-teal-100 via-emerald-50 to-teal-100 dark:from-teal-950 dark:via-emerald-950 dark:to-teal-900 overflow-hidden relative border-2 border-teal-200 dark:border-teal-800 shadow-md hover:shadow-lg transition-all">
                        {claim.afterImage ? (
                          <img
                            src={claim.afterImage}
                            alt="After"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="image-placeholder absolute inset-0 flex flex-col items-center justify-center"
                          style={{ display: claim.afterImage ? 'none' : 'flex' }}
                        >
                          <div className="w-20 h-20 rounded-full bg-white dark:bg-teal-900/50 flex items-center justify-center mb-3 shadow-lg">
                            <TrendingUp className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                          </div>
                          <p className="text-sm text-teal-800 dark:text-teal-300 font-bold">After Image</p>
                          <p className="text-xs text-teal-700 dark:text-teal-400 mt-1">Satellite data pending</p>
                        </div>
                        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-teal-600/95 backdrop-blur-sm text-white text-xs font-bold shadow-lg">
                          After
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="flex-shrink-0 px-8 py-6 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
              <div className="flex gap-3">
                <Button 
                  onClick={onReject} 
                  variant="outline" 
                  size="lg"
                  className="flex-1 gap-2 border-2 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-600 dark:hover:bg-red-700 hover:text-white hover:border-red-600 transition-all font-bold h-12 rounded-xl"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </Button>
                <Button 
                  onClick={onRequestMore} 
                  variant="outline" 
                  size="lg"
                  className="flex-1 gap-2 border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 transition-all font-bold h-12 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5" />
                  Request More
                </Button>
                <Button 
                  onClick={onApprove} 
                  size="lg"
                  className="flex-1 gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all font-bold h-12 rounded-xl"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </Button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VerifierModal;
