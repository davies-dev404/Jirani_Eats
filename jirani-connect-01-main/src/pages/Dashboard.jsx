import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { io } from "socket.io-client";
import api from "../api";

import AdminDashboard from "@/components/dashboards/AdminDashboard";
import DonorDashboard from "@/components/dashboards/DonorDashboard";
import ReceiverDashboard from "@/components/dashboards/ReceiverDashboard";
import RiderDashboard from "@/components/dashboards/RiderDashboard";

const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [foods, setFoods] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  if (authLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Data fetching logic (Skip for Admin as it fetches internally)
  const fetchDashboardData = useCallback(async () => {
    if (!user || !token || user.role === 'admin') return;
    try {
      setLoading(true);

      const foodRes = await api.get("/foods");
      let foodData = foodRes.data || [];

      const requestRes = await api.get("/requests");
      let requestData = requestRes.data || [];

      let myFoods = [];
      if (user.role === "donor") {
          const myFoodRes = await api.get("/foods/my-foods");
          myFoods = myFoodRes.data || [];
      } else if (user.role === "receiver") {
           // Receivers see filtered list from public endpoint
           // But we already fetched public foods into `foodData`
           myFoods = foodData; 
      }

      let myRequests = [];
      if (user.role === "receiver") {
        myRequests = requestData.filter(
          (req) => req.requestedBy?._id === user._id || req.requestedBy === user._id
        );
      } else if (user.role === "donor") {
        myRequests = requestData.filter(
          (req) => req.food?.postedBy?._id === user._id || req.food?.postedBy === user._id
        );
      }

      setFoods(myFoods);
      setRequests(myRequests);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (err.response && err.response.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        navigate("/auth");
      } else {
        toast.error("Error loading dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchDashboardData();

    if (user?.role !== 'admin') {
      const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
        auth: { token },
      });

      socket.on("connect", () => console.log("✅ Socket connected"));
      
      socket.on("foodAdded", (food) => {
        const postedById = food.postedBy?._id || food.postedBy;
        if (user.role === "receiver") setFoods(prev => [food, ...prev]);
        if (user.role === "donor" && postedById === user._id) setFoods(prev => [food, ...prev]);
      });

      socket.on("requestAdded", (request) => {
        const foodPosterId = request.food?.postedBy?._id || request.food?.postedBy;
        const requesterId = request.requestedBy?._id || request.requestedBy;
        
        if (user.role === "donor" && foodPosterId === user._id) setRequests(prev => [request, ...prev]);
        if (user.role === "receiver" && requesterId === user._id) setRequests(prev => [request, ...prev]);
      });

      socket.on("requestUpdated", (updated) => {
        setRequests(prev => prev.map(r => (r._id === updated._id ? updated : r)));
      });

      return () => socket.disconnect();
    }
  }, [fetchDashboardData, token, user]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleUpdateRequest = async (id, status) => {
    try {
      await api.patch(`/requests/${id}`, { status });
      toast.success(`Request ${status}!`);
      fetchDashboardData();
    } catch (err) {
      toast.error("Error updating request");
    }
  };

  const renderString = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  // Normalize role for robustness
  const userRole = user?.role?.toLowerCase();

  return (
    <DashboardLayout>
      {/* Search / Context Header (Optional, mostly handled by Layout now) */}
      
      {/* Dynamic Dashboard Content */}
      {userRole === "admin" ? (
        <AdminDashboard user={user} />
      ) : userRole === "rider" ? (
        <RiderDashboard user={user} />
      ) : userRole === "donor" ? (
        <DonorDashboard 
          user={user}
          foods={foods} 
          requests={requests} 
          loading={loading} 
          renderString={renderString} 
          handleUpdateRequest={handleUpdateRequest}
        />
      ) : userRole === "receiver" ? (
        <ReceiverDashboard 
          user={user}
          foods={foods} 
          requests={requests} 
          loading={loading} 
          renderString={renderString} 
        />
      ) : (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-red-50 text-red-900 rounded-xl m-4 border border-red-200">
            <h2 className="text-2xl font-bold mb-2">Account Role Error</h2>
            <p className="text-lg">Your account has an unrecognized role: <span className="font-mono bg-white px-2 py-1 rounded border border-red-300">{user?.role || "undefined"}</span></p>
            <p className="mt-2 text-sm opacity-80">Please logout and try logging in again. If this persists, contact an admin.</p>
            <Button onClick={handleLogout} variant="destructive" className="mt-6">Logout and Fix</Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
