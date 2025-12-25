import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import api from "../api";

const MyRequests = () => {
  const { user } = useAuth();
  const token = sessionStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.get("/requests");
        const data = res.data;
        setRequests(data.filter(req => req.requestedBy?._id === user._id));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [token, user]);

  if (loading) return <p className="text-center py-8">Loading requests...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      <main className="container mx-auto py-16">
        <h1 className="text-3xl font-bold mb-8">My Food Requests</h1>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(req => (
            <Card key={req._id} className="shadow-md hover:shadow-lg transition border border-gray-200 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>{req.food?.title}</CardTitle>
                <CardDescription>Status: {req.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <p><strong>Quantity:</strong> {req.food?.quantity} {req.food?.unit}</p>
                <p><strong>Pickup:</strong> {typeof req.food?.pickupLocation === "object" ? req.food.pickupLocation.address : req.food?.pickupLocation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyRequests;
