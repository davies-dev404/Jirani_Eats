import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";

// Components
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import RoleRoute from "@/components/RoleRoute";
import DashboardRedirect from "@/components/DashboardRedirect";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Gallery from "./pages/Gallery";
import Contacts from "./pages/Contacts";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Legal from "./pages/Legal";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import ComingSoon from "./pages/ComingSoon";

// Dashboard Overviews
import AdminOverview from "./pages/admin/AdminOverview";
import AdminDeliveries from "./pages/admin/AdminDeliveries";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminReports from "./pages/admin/AdminReports";
import AdminCommunication from "./pages/admin/AdminCommunication";
import UserManagement from "./pages/admin/UserManagement";
import DonationManagement from "./pages/admin/DonationManagement";
import DonorOverview from "./pages/donor/DonorOverview";
import DonorRequests from "./pages/donor/DonorRequests";
import MyDonations from "./pages/donor/MyDonations";
import AddDonation from "./pages/donor/AddDonation";
import Impact from "./pages/donor/Impact";
import DonorSupport from "./pages/donor/DonorSupport";
import PickupTracking from "./pages/donor/PickupTracking";
import ReceiverOverview from "./pages/receiver/ReceiverOverview";
import RequestHistory from "./pages/receiver/RequestHistory";
import DeliveryTracking from "./pages/receiver/DeliveryTracking";
import ReceiverSupport from "./pages/receiver/ReceiverSupport";
import ActiveDelivery from "./pages/rider/ActiveDelivery";
import Earnings from "./pages/rider/Earnings";
import RiderSupport from "./pages/rider/RiderSupport";
import RiderOverview from "./pages/rider/RiderOverview";

// Legacy Pages (to be refactored or moved)
import BrowseDonations from "@/pages/BrowseDonations";
import BrowseJobs from "@/pages/BrowseJobs";
import RequestFood from "@/pages/RequestFood";
import DonateFood from "@/pages/DonateFood";

// React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <SocketProvider>
              <Toaster position="top-right" />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/auth" element={<Auth />} />

                {/* Dashboard Root Redirection */}
                <Route path="/dashboard" element={<DashboardRedirect />} />

                {/* ADMIN ROUTES */}
                <Route element={<RoleRoute allowedRoles={['admin']} />}>
                   <Route path="/dashboard/admin" element={<DashboardLayout><AdminOverview /></DashboardLayout>} />
                   <Route path="/dashboard/admin/users" element={<DashboardLayout><UserManagement /></DashboardLayout>} />
                   <Route path="/dashboard/admin/donations" element={<DashboardLayout><DonationManagement /></DashboardLayout>} />
                   <Route path="/dashboard/admin/deliveries" element={<DashboardLayout><AdminDeliveries /></DashboardLayout>} />
                   <Route path="/dashboard/admin/finance" element={<DashboardLayout><AdminFinance /></DashboardLayout>} />
                   <Route path="/dashboard/admin/reports" element={<DashboardLayout><AdminReports /></DashboardLayout>} />
                   <Route path="/dashboard/admin/communication" element={<DashboardLayout><AdminCommunication /></DashboardLayout>} />
                   <Route path="/dashboard/admin/*" element={<DashboardLayout><ComingSoon /></DashboardLayout>} />
                </Route>

                {/* DONOR ROUTES */}
                <Route element={<RoleRoute allowedRoles={['donor']} />}>
                   <Route path="/dashboard/donor" element={<DashboardLayout><DonorOverview /></DashboardLayout>} />
                   <Route path="/dashboard/donor/requests" element={<DashboardLayout><DonorRequests /></DashboardLayout>} />
                   <Route path="/dashboard/donor/requests" element={<DashboardLayout><DonorRequests /></DashboardLayout>} />
                   <Route path="/dashboard/donor/donate" element={<DashboardLayout><MyDonations /></DashboardLayout>} />
                   <Route path="/dashboard/donor/donate/new" element={<DashboardLayout><AddDonation /></DashboardLayout>} />
                   <Route path="/dashboard/donor/impact" element={<DashboardLayout><Impact /></DashboardLayout>} />
                   <Route path="/dashboard/donor/support" element={<DashboardLayout><DonorSupport /></DashboardLayout>} />
                   <Route path="/dashboard/donor/tracking" element={<DashboardLayout><PickupTracking /></DashboardLayout>} />
                </Route>

                {/* RECEIVER ROUTES */}
                <Route element={<RoleRoute allowedRoles={['receiver']} />}>
                   <Route path="/dashboard/receiver" element={<DashboardLayout><ReceiverOverview /></DashboardLayout>} />
                   <Route path="/dashboard/receiver/request" element={<DashboardLayout><BrowseDonations /></DashboardLayout>} />
                   <Route path="/dashboard/receiver/request/:id" element={<DashboardLayout><RequestFood /></DashboardLayout>} />
                   <Route path="/dashboard/receiver/history" element={<DashboardLayout><RequestHistory /></DashboardLayout>} />
                   <Route path="/dashboard/receiver/tracking" element={<DashboardLayout><DeliveryTracking /></DashboardLayout>} />
                   <Route path="/dashboard/receiver/support" element={<DashboardLayout><ReceiverSupport /></DashboardLayout>} />
                   <Route path="/dashboard/receiver/browse" element={<DashboardLayout><BrowseDonations /></DashboardLayout>} />
                   <Route path="/request-food/:id" element={<DashboardLayout><RequestFood /></DashboardLayout>} />
                </Route>

                {/* RIDER ROUTES */}
                <Route element={<RoleRoute allowedRoles={['rider']} />}>
                   <Route path="/dashboard/rider" element={<DashboardLayout><RiderOverview /></DashboardLayout>} />
                   <Route path="/dashboard/rider/jobs" element={<DashboardLayout><BrowseJobs /></DashboardLayout>} />
                   <Route path="/dashboard/rider/active" element={<DashboardLayout><ActiveDelivery /></DashboardLayout>} />
                   <Route path="/dashboard/rider/earnings" element={<DashboardLayout><Earnings /></DashboardLayout>} />
                   <Route path="/dashboard/rider/support" element={<DashboardLayout><RiderSupport /></DashboardLayout>} />
                   <Route path="/dashboard/rider/*" element={<DashboardLayout><ComingSoon /></DashboardLayout>} />
                </Route>

                {/* SHARED AUTHENTICATED ROUTES */}
                <Route element={<RoleRoute allowedRoles={['admin', 'donor', 'receiver', 'rider']} />}>
                  <Route path="/account" element={<DashboardLayout><Account /></DashboardLayout>} />
                  <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
                </Route>

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
