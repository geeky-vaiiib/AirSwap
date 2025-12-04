import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Leaf, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import MapToolbar from "@/components/map/MapToolbar";
import RightPanel from "@/components/map/RightPanel";
import { toast } from "@/hooks/use-toast";

// Lazy load the map component (client-only)
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-sand">
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center mx-auto"
        >
          <Leaf className="w-6 h-6 text-forest" />
        </motion.div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

interface NDVIData {
  ndviDelta: number;
  beforeImage: string;
  afterImage: string;
}

// Stub API call - will be replaced with actual API call
const fetchNDVIData = async (): Promise<NDVIData> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    ndviDelta: 14.2,
    beforeImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1518173946687-a4c036bc8d7c?w=400&h=400&fit=crop",
  };
};

const MapPage = () => {
  const [activeTool, setActiveTool] = useState<"select" | "polygon">("select");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [ndviData, setNdviData] = useState<NDVIData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPolygon, setHasPolygon] = useState(false);

  const handlePolygonComplete = async (coordinates: [number, number][]) => {
    setIsLoading(true);
    setIsPanelOpen(true);
    setHasPolygon(true);
    setActiveTool("select");

    try {
      const data = await fetchNDVIData();
      setNdviData(data);
      toast({
        title: "Analysis Complete",
        description: `NDVI change detected: +${data.ndviDelta}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze the selected area",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setNdviData(null);
    setIsPanelOpen(false);
    setHasPolygon(false);
    // Force re-render of map
    window.location.reload();
  };

  const handleIssueCredit = () => {
    toast({
      title: "Credit Issued! 🎉",
      description: "847 Oxygen Credits have been added to your account (Demo)",
    });
  };

  return (
    <div className="h-screen w-screen bg-sand overflow-hidden relative">
      {/* Top Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between"
      >
        <div className="glass rounded-2xl px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest to-emerald flex items-center justify-center">
              <Leaf className="w-5 h-5 text-teal" />
            </div>
            <span className="font-display text-lg font-bold text-forest">
              AirSwap
            </span>
          </Link>
          <div className="w-px h-8 bg-border" />
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {activeTool === "polygon"
              ? "Click to draw points, double-click to complete"
              : "Select 'Draw Polygon' to start"}
          </span>
        </div>
      </motion.div>

      {/* Map Container */}
      <div className="h-full w-full relative">
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center bg-sand">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center mx-auto"
                >
                  <Leaf className="w-6 h-6 text-forest" />
                </motion.div>
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </div>
          }
        >
          <LeafletMap
            onPolygonComplete={handlePolygonComplete}
            drawEnabled={activeTool === "polygon"}
          />
        </Suspense>

        {/* Loading overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-forest/20 backdrop-blur-sm flex items-center justify-center z-30"
          >
            <div className="glass rounded-2xl p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-xl bg-teal/20 flex items-center justify-center mx-auto mb-4"
              >
                <Leaf className="w-8 h-8 text-teal" />
              </motion.div>
              <p className="font-medium text-forest">Analyzing satellite data...</p>
            </div>
          </motion.div>
        )}

        {/* Right Panel */}
        <RightPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          ndviData={ndviData}
          onIssueCredit={handleIssueCredit}
        />
      </div>

      {/* Toolbar */}
      <MapToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onClear={handleClear}
        canClear={hasPolygon}
      />
    </div>
  );
};

export default MapPage;

