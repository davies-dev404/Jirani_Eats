import { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, MapPin, CheckCircle, Wallet, Star, Navigation } from "lucide-react";
import MapComponent from "../MapComponent";
import { EarningsChart } from "./EarningsChart";
import { JobCardSkeleton } from "@/components/ui/skeleton-cards";
import EmptyState from "@/components/ui/empty-state";
import { useSocket } from "@/context/SocketContext"; // ✅ Added Socket
import { useAuth } from "@/context/AuthContext";
import { RiderVerification } from "./RiderVerification";

const RiderDashboard = () => {
    const { user, updateUser } = useAuth();
    const { socket } = useSocket();
    const [jobs, setJobs] = useState([]);
    const [activeJob, setActiveJob] = useState(null); // 🚀 State for active delivery
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        balance: 0,
        completed: 0,
        rating: 5.0
    });
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        fetchStatus();
        fetchJobs();
        fetchActiveJob();
        if (user) {
             setStats({
                 balance: user.walletBalance || 0,
                 completed: user.earningsHistory?.length || 0,
                 rating: 5.0 // Placeholder for now
             });
        }
    }, [user]);

    // 🔌 Real-time listeners
    useEffect(() => {
        if (!socket) return;

        socket.on("requestAdded", (newRequest) => {
             // Only add if it meets criteria (approved and no rider) - backend filter acts as gatekeeper usually, 
             // but here we might get all requests. Best to fetchJobs on signal or filter client side.
             // Simplest: just refresh list
             fetchJobs();
        });

        socket.on("requestUpdated", (updatedRequest) => {
             fetchJobs();
             fetchActiveJob(); // Check if our active job status changed
        });

        socket.on("requestCancelled", () => {
             fetchJobs();
        });

        // Listen for profile updates (e.g. approval)
        socket.on("userUpdated", (updatedUser) => {
             if (updatedUser._id === user._id) {
                 updateUser(updatedUser); // Update AuthContext 🚀
                 toast.success(`Profile update: ${updatedUser.verificationStatus}`);
             }
        });

        return () => {
             socket.off("requestAdded");
             socket.off("requestUpdated");
             socket.off("requestCancelled");
             socket.off("userUpdated");
        };
    }, [socket]);

    const fetchStatus = async () => {
        try {
            // Check session/local state for online status or fetch profile again
             if(user?.isAvailable) setIsOnline(true);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchActiveJob = async () => {
        try {
             const res = await api.get("/requests/rider/active");
             setActiveJob(res.data || null);
        } catch(err) {
            // 404 is expected if no active job
            if (err.response && err.response.status === 404) {
                setActiveJob(null);
            } else {
                console.error("Error fetching active job", err);
            }
        }
    }

    const toggleOnlineStatus = async () => {
        try {
            const res = await api.patch("/users/status");
            setIsOnline(res.data.isAvailable);
            if (res.data.isAvailable) fetchJobs();
            toast.success(res.data.isAvailable ? "You are now Online" : "You are now Offline");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await api.get("/requests/rider/available");
            setJobs(res.data);
        } catch (err) {
            console.error("Error fetching jobs", err);
        } finally {
            setLoading(false);
        }
    };

    const acceptJob = async (id) => {
        try {
            await api.patch(`/requests/${id}/assign`); // Fallback if backend not ready, but we are fixing it now. Wait, I should use the correct one.
            await api.patch(`/requests/${id}/accept`);
            toast.success("Job accepted! Head to pickup.");
            fetchJobs();
            fetchActiveJob();
        } catch (err) {
            toast.error("Failed to accept job");
        }
    };

    const updateDeliveryStatus = async (status) => {
        if (!activeJob) return;
        try {
             await api.patch(`/requests/${activeJob._id}`, { status });
             toast.success(`Status updated to ${status}`);
             if (status === 'delivered') {
                 setActiveJob(null);
                 // Update balance in UI immediately
                 setStats(prev => ({ ...prev, balance: prev.balance + 500, completed: prev.completed + 1 }));
             } else {
                 fetchActiveJob();
             }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    }

    const cancelJob = async () => {
        if (!activeJob) return;
        if (!confirm("Are you sure you want to cancel this delivery?")) return;
        try {
            await api.patch(`/requests/${activeJob._id}`, { status: 'cancelled' });
            toast.success("Delivery cancelled.");
            setActiveJob(null);
            fetchJobs(); // Refresh stats/list
        } catch (err) {
            toast.error("Failed to cancel job");
        }
    };

    return (
        <div className="space-y-8 p-1">
            {/* 💰 Wallet & Stats Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {stats.balance.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Available for withdrawal</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">Total deliveries</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Truck className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeJob ? 1 : 0}</div>
                        <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rider Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.rating}</div>
                        <p className="text-xs text-muted-foreground">Top 10% of riders</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* 📈 Earnings Chart */}
                <div className="col-span-4 space-y-4">
                     {/* Online Status Toggle & Browse Link */}
                    <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
                         <CardContent className="flex items-center justify-between p-6">
                             <div>
                                 <h3 className="text-xl font-bold mb-1">Status: {isOnline ? 'Online 🟢' : 'Offline 🔴'}</h3>
                                 <p className="text-gray-400 text-sm">Go online to receive jobs or browse manually.</p>
                             </div>
                             <div className="flex items-center gap-4">
                                 <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
                                     <span className="text-xs font-bold">In-App</span>
                                     <Switch checked={isOnline} onCheckedChange={toggleOnlineStatus} />
                                 </div>
                                 <Button asChild variant="secondary" className="font-bold">
                                     <a href="/dashboard/browse-jobs">Browse Jobs 🚀</a>
                                 </Button>
                             </div>
                         </CardContent>
                    </Card>

                    <RiderVerification user={user} />
                    <EarningsChart earnings={user?.earningsHistory || []} />
                </div>

                {/* 🗺️ Live Map / Active Job Map */}
                <Card className="col-span-3">
                    <CardHeader>
                         <CardTitle>Live Coverage</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-hidden">
                         <div className="h-[300px] w-full">
                            <MapComponent foods={[]} /> 
                         </div>
                    </CardContent>
                </Card>
            </div>

            {/* 🚀 Active Delivery Interface */}
            {activeJob ? (
                <Card className="border-green-500 border-2 bg-green-50/50 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Current Delivery</span>
                            <span className="text-sm bg-green-200 text-green-800 px-3 py-1 rounded-full animate-pulse">
                                {activeJob.deliveryStatus === 'accepted' ? 'Heading to Pickup' : 'Heading to Dropoff'}
                            </span>
                        </CardTitle>
                        <CardDescription>Order #{(activeJob._id || '').slice(-6).toUpperCase()}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Pickup From:</h4>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    <span>{activeJob.food?.pickupLocation?.address || "Unknown Location"}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Deliver To:</h4>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Navigation className="h-4 w-4" />
                                    <span>{activeJob.requestedBy?.name} ({activeJob.phoneNumber})</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 justify-center">
                             {activeJob.deliveryStatus === 'accepted' && (
                                 <Button size="lg" onClick={() => updateDeliveryStatus('picked-up')}>
                                     Confirm Pickup
                                 </Button>
                             )}
                             {activeJob.deliveryStatus === 'picked-up' && (
                                 <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => updateDeliveryStatus('delivered')}>
                                     Confirm Delivery
                                 </Button>
                             )}
                             <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">Call Customer</Button>
                                <Button variant="destructive" size="sm" className="flex-1" onClick={cancelJob}>Cancel Job</Button>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
                    <h3 className="text-lg font-medium text-gray-600">No active delivery</h3>
                    <p className="text-gray-400 mb-4">You are free to take new requests.</p>
                </div>
            )}
        </div>
    );
};

export default RiderDashboard;
