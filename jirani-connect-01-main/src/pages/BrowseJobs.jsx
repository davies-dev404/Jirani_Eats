import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { MapPin, Truck, Navigation, Package, ArrowLeft, Loader2 } from "lucide-react";
import api from "../api";

const BrowseJobs = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'rider') {
            navigate("/dashboard");
            return;
        }
        fetchJobs();
    }, [user, navigate]);

    // 🔌 Real-time listeners
    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
             fetchJobs();
        };

        socket.on("requestAdded", handleUpdate);
        socket.on("requestUpdated", handleUpdate);
        socket.on("requestCancelled", handleUpdate);

        return () => {
             socket.off("requestAdded", handleUpdate);
             socket.off("requestUpdated", handleUpdate);
             socket.off("requestCancelled", handleUpdate);
        };
    }, [socket]);

    const fetchJobs = async () => {
        try {
            // setLoading(true); // Don't show loading on background refresh
            const res = await api.get("/requests/rider/available");
            setJobs(res.data);
        } catch (err) {
            console.error("Error fetching jobs", err);
            // toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const acceptJob = async (id) => {
        setAccepting(id);
        try {
            await api.patch(`/requests/${id}/accept`);
            toast.success("Job accepted! Redirecting to active delivery...");
            navigate("/dashboard/rider/active"); // Go to active job page
        } catch (err) {
            console.error(err);
            toast.error("Failed to accept job");
        } finally {
            setAccepting(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Browse Available Jobs</h1>
                        <p className="text-gray-500">Pick up a delivery request near you.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold">No Jobs Available</h3>
                        <p className="text-muted-foreground">Check back later for new delivery requests.</p>
                        <Button onClick={() => { setLoading(true); fetchJobs(); }} variant="outline" className="mt-4">Refresh List</Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <Card key={job._id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500Group hover:scale-[1.02] cursor-pointer">
                                <CardHeader>
                                    {job.food?.image && (
                                        <div className="w-full h-32 mb-4 rounded-lg overflow-hidden">
                                            <img src={job.food.image} alt={job.food.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{job.food?.title || "Food Delivery"}</CardTitle>
                                            <CardDescription>Wait time: 5 mins</CardDescription>
                                        </div>
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                                            KES 500
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Pickup</p>
                                                <p className="text-gray-500 line-clamp-1">{job.food?.pickupLocation?.address || (typeof job.food?.pickupLocation === 'string' ? job.food.pickupLocation : (job.pickupLocation?.address || (typeof job.pickupLocation === 'string' ? job.pickupLocation : "Unknown")))}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Navigation className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Dropoff</p>
                                                <p className="text-gray-500">Customer: {job.requestedBy?.name || "User"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button 
                                        className="w-full bg-green-600 hover:bg-green-700 h-10 text-base" 
                                        onClick={() => acceptJob(job._id)}
                                        disabled={accepting === job._id}
                                    >
                                        {accepting === job._id ? <Loader2 className="animate-spin h-4 w-4" /> : "Accept Delivery"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

    );
};

export default BrowseJobs;
