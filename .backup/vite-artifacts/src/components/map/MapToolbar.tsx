import { motion } from "framer-motion";
import { MousePointer, Pentagon, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapToolbarProps {
  activeTool: "select" | "polygon";
  onToolChange: (tool: "select" | "polygon") => void;
  onClear: () => void;
  canClear: boolean;
}

const MapToolbar = ({ activeTool, onToolChange, onClear, canClear }: MapToolbarProps) => {
  const tools = [
    { id: "select" as const, icon: MousePointer, label: "Select" },
    { id: "polygon" as const, icon: Pentagon, label: "Draw Polygon" },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
    >
      <div className="glass rounded-2xl p-2 shadow-soft flex items-center gap-1">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300",
              activeTool === tool.id
                ? "bg-forest text-primary-foreground"
                : "hover:bg-forest/10 text-forest"
            )}
          >
            <tool.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{tool.label}</span>
          </motion.button>
        ))}
        
        <div className="w-px h-8 bg-border mx-1" />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          disabled={!canClear}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300",
            canClear
              ? "hover:bg-destructive/10 text-destructive"
              : "opacity-50 cursor-not-allowed text-muted-foreground"
          )}
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-sm font-medium">Clear</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MapToolbar;
