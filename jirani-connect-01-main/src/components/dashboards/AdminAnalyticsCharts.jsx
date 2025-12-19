import { useState, useEffect } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import api from "../../api";
import { useSocket } from "@/context/SocketContext";

export function AdminAnalyticsCharts() {
  const [activityData, setActivityData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const { socket } = useSocket();

  const fetchAnalytics = async () => {
      try {
          const res = await api.get("/admin/analytics");
          setActivityData(res.data.activityData || []);
          setUserGrowthData(res.data.userGrowthData || []);
      } catch (error) {
          console.error("Error fetching analytics:", error);
      }
  };

  useEffect(() => {
      fetchAnalytics();

      if (socket) {
          socket.on("foodAdded", fetchAnalytics);
          socket.on("requestAdded", fetchAnalytics);
          socket.on("userRegistered", fetchAnalytics); // Assuming we emit this
      }

      return () => {
          if (socket) {
              socket.off("foodAdded");
              socket.off("requestAdded");
              socket.off("userRegistered");
          }
      }
  }, [socket]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
          <CardDescription>
            Weekly comparison of donations vs. requests (Last 7 Days).
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="donations" name="Donations" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="requests" name="Requests" fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>
            New user registrations over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
