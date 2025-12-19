import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, RefreshCw, User, MoreVertical } from "lucide-react";

export default function ReceiverOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
      requests: 0,
      approved: 0,
      verified: false
  });
  const { socket } = useSocket();

  const fetchStats = async () => {
      try {
          const res = await api.get("/requests");
          const data = Array.isArray(res.data) ? res.data : [];
          
          setStats({
              requests: data.length,
              approved: data.filter(r => ['approved', 'assigned', 'on_the_way', 'picked_up', 'delivered', 'completed'].includes(r.status)).length,
              verified: user?.status === 'verified'
          });
      } catch (error) {
          console.error("Failed to fetch receiver stats", error);
      }
  };

  useEffect(() => {
      fetchStats();
      if (socket) {
          socket.on("requestUpdated", fetchStats);
          socket.on("requestAdded", fetchStats);
          return () => {
              socket.off("requestUpdated", fetchStats);
              socket.off("requestAdded", fetchStats);
          };
      }
  }, [socket, user]); // Re-run if user status updates

  const isVerified = user?.status === 'verified';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Jirani Eats Receiver</h1>
            <p className="text-gray-500">Manage your food requests and view upcoming deliveries.</p>
        </div>
        <div className="flex items-center gap-4">
            <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/dashboard/receiver/request">Request Food</Link>
            </Button>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Requests</CardTitle>
                <div className="p-2 bg-orange-50 rounded-lg">
                   <Calendar className="h-4 w-4 text-orange-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.requests}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Approved Meals</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                    <UtensilsCrossed className="h-4 w-4 text-green-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Compliant Status</CardTitle>
                 <div className={`p-2 rounded-lg ${isVerified ? "bg-blue-50" : "bg-yellow-50"}`}>
                    {isVerified ? <CheckCircle className="h-4 w-4 text-blue-500" /> : <AlertCircle className="h-4 w-4 text-yellow-500" />}
                </div>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${isVerified ? "text-green-600" : "text-yellow-600"}`}>
                    {isVerified ? "Verified" : user?.status === "rejected" ? "Rejected" : "Pending"}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
