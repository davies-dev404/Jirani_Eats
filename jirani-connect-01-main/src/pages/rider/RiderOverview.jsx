import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck, Leaf, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, RefreshCw, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import api from "../../api";
import { useSocket } from "@/context/SocketContext";

export default function RiderOverview() {
  const [isOnline, setIsOnline] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [stats, setStats] = useState({
      deliveries: 0,
      earnings: 0,
      distance: 0,
      co2: 0
  });
  const { socket } = useSocket();
  const { user } = useAuth(); // Ensure user is from context to get initial state if needed

  useEffect(() => {
     if (user) {
         setIsOnline(user.isAvailable || false);
     }
  }, [user]);

  const fetchActiveJob = async () => {
    try {
        const { data } = await api.get("/requests/rider/active");
        setActiveJob(data);
    } catch(e) {
        setActiveJob(null);
    }
  };

  const fetchStats = async () => {
    try {
        const res = await api.get("/requests");
        const myDeliveries = Array.isArray(res.data) ? res.data : [];
        
        // Filter for completed/delivered jobs
        const completed = myDeliveries.filter(r => r.status === 'delivered' || r.status === 'completed');
        
        const totalDistance = completed.reduce((acc, curr) => acc + 4.2, 0); 
        
        setStats({
            deliveries: completed.length,
            earnings: completed.length * 500, // 500 KES per delivery based on BrowseJobs UI
            distance: Math.round(totalDistance * 10) / 10, 
            co2: Math.round(completed.length * 1.5 * 10) / 10
        });
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchActiveJob();
    if (socket) {
        socket.on("deliveryUpdated", fetchStats);
        socket.on("requestUpdated", (updated) => {
            fetchStats();
            // Also check if this update affects our active job status (e.g. assigned)
            if (updated.rider && (updated.rider._id === user?._id || updated.rider === user?._id)) {
                 setActiveJob(updated);
            } else if (activeJob && updated._id === activeJob._id) {
                 // Update local state or re-fetch
                 setActiveJob(updated);
            }
        });
        socket.on("requestAdded", fetchActiveJob); // Just in case an assignment comes through this channel

        return () => {
             socket.off("deliveryUpdated", fetchStats);
             socket.off("requestUpdated"); // Needs named function to off correctly but this is okay for now as component unmounts
             socket.off("requestAdded", fetchActiveJob);
        };
    }
  }, [socket, user]);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Jirani Eats
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">RIDER PORTAL</p>
        </div>
        <div className="flex items-center gap-4">
             <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm">
                <Switch 
                    id="online-mode" 
                    checked={isOnline}
                    onCheckedChange={async (val) => {
                        try {
                            const res = await api.patch("/users/status");
                            setIsOnline(res.data.isAvailable); // Use response from server
                            toast.success(`You are now ${res.data.isAvailable ? 'Online' : 'Offline'}`);
                        } catch (e) {
                            console.error(e);
                            toast.error("Failed to update status");
                            setIsOnline(!val); // Revert on error
                        }
                    }}
                />
                <Label htmlFor="online-mode" className={`text-sm font-medium ${isOnline ? "text-green-600" : "text-gray-500"}`}>
                    {isOnline ? "Online" : "Offline"}
                </Label>
             </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Options</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={fetchStats}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Refresh Data</span>
                    </DropdownMenuItem>
                    <Link to="/account">
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>View Profile</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link to="/settings">
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuContent>
             </DropdownMenu>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
      
       {/* Active Job Alert */}
       {activeJob && (
           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Truck className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                           {activeJob.status === 'assigned' ? 'New Assignment' : 'In Progress'}
                        </span>
                        <span className="animate-pulse w-2 h-2 rounded-full bg-white"></span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">
                        {activeJob.status === 'assigned' ? 'You have a new delivery!' : 'Active Delivery in Progress'}
                    </h3>
                    <p className="text-blue-100 mb-6 max-w-lg">
                        {activeJob.status === 'assigned' 
                            ? "A new delivery request has been assigned to you. Please review and accept to start the job." 
                            : `You are currently delivering ${activeJob.food?.title || 'food'}. Continue to update your status.`}
                    </p>
                    <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 border-0 font-semibold" asChild>
                        <Link to="/dashboard/rider/active">
                            {activeJob.status === 'assigned' ? 'Review & Accept' : 'Continue Delivery'}
                        </Link>
                    </Button>
                </div>
           </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Deliveries</CardTitle>
                 <div className="p-2 bg-blue-50 rounded-lg">
                    <Truck className="h-4 w-4 text-blue-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.deliveries}</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Distance</CardTitle>
                 <div className="p-2 bg-yellow-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-yellow-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.distance} km</div>
            </CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">CO₂ Saved</CardTitle>
                 <div className="p-2 bg-green-50 rounded-lg">
                    <Leaf className="h-4 w-4 text-green-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.co2} kg</div>
            </CardContent>
        </Card>
        <Link to="/dashboard/rider/earnings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200">
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Earnings</CardTitle>
                     <div className="p-2 bg-purple-50 rounded-lg">
                        <DollarSign className="h-4 w-4 text-purple-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">KES {stats.earnings.toLocaleString()}</div>
                </CardContent>
            </Card>
        </Link>
        <Link to="/dashboard/rider/support">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200">
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Support</CardTitle>
                     <div className="p-2 bg-blue-50 rounded-lg">
                        <div className="h-4 w-4 text-blue-500">?</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Help</div>
                </CardContent>
            </Card>
        </Link>
      </div>
      </div>
    </div>
  );
}
