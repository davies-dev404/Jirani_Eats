import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";
import { useSocket } from "@/context/SocketContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, RefreshCw, User, MoreVertical } from "lucide-react";

export default function DonorOverview() {
  const [stats, setStats] = useState({
      donated: 0,
      pickups: 0,
      impact: 0
  });
  const { socket } = useSocket();

  const fetchStats = async () => {
      try {
          // Fetch foods and requests to calculate stats
          // In a real optimized app, this would be a single /stats/donor endpoint
          const foodsRes = await api.get("/foods/my-foods");
          const requestsRes = await api.get("/requests"); // Assuming this returns requests relevant to the donor or all requests if filtered client side

          // Simplified logic: Count all foods (assuming backend filters for "my foods" or we use the result length)
          const donatedCount = Array.isArray(foodsRes.data) ? foodsRes.data.length : 0;
          
          // Count completed pickups (completed flow involves 'picked_up', 'delivered', 'completed')
          const pickupsCount = Array.isArray(requestsRes.data) 
              ? requestsRes.data.filter(r => ['picked_up', 'delivered', 'completed'].includes(r.status)).length 
              : 0;

          setStats({
              donated: donatedCount,
              pickups: pickupsCount,
              impact: pickupsCount * 5 // Impact based on actual delivered meals
          });
      } catch (error) {
          console.error("Failed to fetch donor stats", error);
      }
  };

  useEffect(() => {
      fetchStats();

      if (socket) {
          socket.on("foodAdded", fetchStats);
          socket.on("requestUpdated", fetchStats);

          return () => {
              socket.off("foodAdded", fetchStats);
              socket.off("requestUpdated", fetchStats);
          };
      }
  }, [socket]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Jirani Eats Donor</h1>
            <p className="text-gray-500">Track your impact and manage donations.</p>
        </div>
        <div className="flex items-center gap-4">
             <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/dashboard/donor/donate/new">Make a Donation</Link>
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
                <CardTitle className="text-sm font-medium text-gray-500">Meals Donated</CardTitle>
                <div className="p-2 bg-orange-50 rounded-lg">
                    <Gift className="h-4 w-4 text-orange-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.donated}</div>
                <p className="text-xs text-muted-foreground">Lifetime contributions</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pickups Completed</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.pickups}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Impact Score</CardTitle>
                <div className="p-2 bg-yellow-50 rounded-lg">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.impact}</div>
                <p className="text-xs text-muted-foreground">Community Points</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
