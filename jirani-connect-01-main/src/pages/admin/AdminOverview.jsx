import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Package, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api";
import { useSocket } from "@/context/SocketContext";

export default function AdminOverview() {
  const [counts, setCounts] = useState({
      users: 0,
      donations: 0,
      finance: 0
  });
  const { socket } = useSocket();

  const fetchStats = async () => {
    try {
        const [usersRes, foodRes] = await Promise.all([
            api.get("/users"), 
            api.get("/foods/admin") // Use admin endpoint to see ALL foods including pending
        ]);

        setCounts({
            users: Array.isArray(usersRes.data) ? usersRes.data.filter(u => ['donor', 'receiver', 'rider'].includes(u.role)).length : 0,
            donations: Array.isArray(foodRes.data) ? foodRes.data.length : 0,
            finance: 0 
        });
    } catch (err) {
        console.error("Admin stats error", err);
    }
  };

  useEffect(() => {
    fetchStats();
    if (socket) {
        socket.on("userRegistered", fetchStats);
        socket.on("foodAdded", fetchStats);
        return () => {
            socket.off("userRegistered", fetchStats);
            socket.off("foodAdded", fetchStats);
        };
    }
  }, [socket]);

  const stats = [
    { label: "Total Users", value: counts.users.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Donations", value: counts.donations.toString(), icon: Package, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Financing", value: `KES ${counts.finance.toLocaleString()}`, icon: DollarSign, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Impact Growth", value: "0%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Jirani Eats Admin</h1>
        <p className="text-gray-500">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-sm text-gray-500">
                Listening for real-time updates...
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
