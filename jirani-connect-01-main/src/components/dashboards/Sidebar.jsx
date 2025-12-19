import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Truck,
  FileText,
  Settings,
  LogOut,
  MapPin,
  Gift,
  HeartHandshake,
  DollarSign,
  BarChart,
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  Menu,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function Sidebar({ className, setIsMobileOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Define navigation items per role
  const navConfigs = {
    admin: [
      {
        section: "",
        items: [
            { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/dashboard/admin/users", label: "User Management", icon: Users },
            { href: "/dashboard/admin/donations", label: "Donations", icon: Gift },
            { href: "/dashboard/admin/deliveries", label: "Deliveries", icon: Truck },
            { href: "/dashboard/admin/finance", label: "Finance", icon: DollarSign },
            { href: "/dashboard/admin/reports", label: "Reports & Impact", icon: BarChart },
            { href: "/dashboard/admin/communication", label: "Communication", icon: MessageSquare },
        ]
      }
    ],
    donor: [
      {
        section: "",
        items: [
            { href: "/dashboard/donor", label: "Dashboard", icon: LayoutDashboard },
            { href: "/dashboard/donor/donate", label: "My Donations", icon: Gift },
            { href: "/dashboard/donor/requests", label: "Incoming Requests", icon: Users },
            { href: "/dashboard/donor/tracking", label: "Pickup Tracking", icon: MapPin },
            { href: "/dashboard/donor/impact", label: "Impact Report", icon: PieChart },
            { href: "/dashboard/donor/support", label: "Support", icon: HelpCircle },
        ]
      }
    ],
    receiver: [
      {
         section: "",
         items: [
            { href: "/dashboard/receiver", label: "Dashboard", icon: LayoutDashboard },
            { href: "/dashboard/receiver/request", label: "Request Food", icon: UtensilsCrossed },
            { href: "/dashboard/receiver/history", label: "History", icon: FileText },
            { href: "/dashboard/receiver/tracking", label: "Delivery Tracking", icon: MapPin },
            { href: "/dashboard/receiver/support", label: "Support", icon: HelpCircle },
         ]
      }
    ],
    rider: [
        {
            section: "",
            items: [
                { href: "/dashboard/rider", label: "Dashboard", icon: LayoutDashboard },
                { href: "/dashboard/rider/jobs", label: "Available Jobs", icon: Truck },
                { href: "/dashboard/rider/active", label: "Active Delivery", icon: MapPin },
                { href: "/dashboard/rider/earnings", label: "Earnings", icon: DollarSign },
                { href: "/dashboard/rider/support", label: "Support", icon: HelpCircle },
            ]
        }
    ]
  };

  const currentNav = user ? navConfigs[user.role] || [] : [];

  return (
    <div className={cn("flex flex-col h-full bg-slate-900 text-slate-100", className)}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-500">
          Jirani Eats
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">{user?.role || "Guest"} Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
        {currentNav.map((group, idx) => (
            <div key={idx}>
                {group.section && (
                    <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                        {group.section}
                    </h3>
                )}
                <div className="space-y-1">
                    {group.items.map((item) => {
                    // Fix: Exact match for dashboard root to prevent double highlighting
                    const isActive = item.href === location.pathname || (item.href !== "/dashboard/rider" && item.href !== "/dashboard/donor" && item.href !== "/dashboard/receiver" && item.href !== "/dashboard/admin" && location.pathname.startsWith(item.href + "/"));
                    
                    return (
                        <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                            isActive 
                            ? "bg-green-600 text-white shadow-lg shadow-green-900/20 font-medium" 
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                        >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        </Link>
                    );
                    })}
                </div>
            </div>
        ))}

        {/* Shared Links for Everyone */}
         <div>
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Settings
            </h3>
            <div className="space-y-1">
                 <Link
                    to="/settings"
                    onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                    className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                        location.pathname === "/settings"
                        ? "bg-green-600 text-white shadow-lg shadow-green-900/20 font-medium"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                </Link>
            </div>
         </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/10 gap-2"
            onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
