import { useLocation } from "react-router-dom";
import { 
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { NotificationDropdown } from "../notification-dropdown";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import { Sidebar } from "@/components/dashboards/Sidebar";

export function DashboardLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Helper to get current page title based on path (simple version)
  const getPageTitle = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
        <Sidebar className="h-full" />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 border-r-slate-800 bg-slate-900 w-64">
             <Sidebar setIsMobileOpen={setIsMobileOpen} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
                    <Menu className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
                    {getPageTitle()}
                </h2>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                {/* 🔔 Real-time Notifications */}
                <NotificationDropdown />
            </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
