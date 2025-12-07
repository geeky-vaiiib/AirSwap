import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Leaf,
  Home,
  LayoutDashboard,
  Coins,
  FileCheck,
  Settings,
  LogOut,
  ShoppingCart,
  Briefcase,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/authHelpers";
import { useToast } from "@/hooks/use-toast";

type Role = "contributor" | "company" | "verifier";

interface DashboardSidebarProps {
  role: Role;
}

const roleConfig = {
  contributor: {
    title: "Contributor",
    links: [
      { href: "/dashboard/contributor", icon: LayoutDashboard, label: "Overview" },
      { href: "/dashboard/claims/create", icon: FileCheck, label: "Submit Claim" },
      { href: "/dashboard/claims", icon: FileCheck, label: "My Claims" },
      { href: "#", icon: Coins, label: "My Credits" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { href: "/dashboard/company", icon: LayoutDashboard, label: "Overview" },
      { href: "#", icon: ShoppingCart, label: "Marketplace" },
      { href: "#", icon: Briefcase, label: "Portfolio" },
      { href: "#", icon: FileCheck, label: "Transactions" },
    ],
  },
  verifier: {
    title: "Verifier",
    links: [
      { href: "/dashboard/verifier", icon: LayoutDashboard, label: "Overview" },
      { href: "#", icon: FileCheck, label: "Pending Claims" },
      { href: "#", icon: Users, label: "Contributors" },
      { href: "#", icon: Coins, label: "Verified Credits" },
    ],
  },
};

const DashboardSidebar = ({ role }: DashboardSidebarProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const location = { pathname: router.pathname };
  const config = roleConfig[role];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-forest h-screen flex flex-col"
    >
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-teal" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            AirSwap
          </span>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-6 pb-6">
        <div className="px-3 py-2 rounded-xl bg-white/10 text-center">
          <span className="text-sm font-medium text-teal">{config.title}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {config.links.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive
                  ? "bg-teal/20 text-teal"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Links */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
