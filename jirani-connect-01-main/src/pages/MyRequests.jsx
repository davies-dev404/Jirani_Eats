import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "../api";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // ✅ Fetch all requests for this user
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/requests");
        const data = res.data;

        setRequests(data);
      } catch (error) {
        console.error("❌ Error fetching requests:", error);
        toast.error("Failed to load your requests.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchRequests();
    else navigate("/auth");
  }, [token, navigate]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;

    try {
      await api.delete(`/requests/${id}`);

      setRequests(requests.filter((r) => r._id !== id));
      toast.success("Request cancelled successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error cancelling request.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-green-700">
          🍽️ My Food Requests
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Track your food requests — see what’s pending, approved, or completed.
        </p>

        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading your requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            You haven’t made any requests yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {requests.map((req) => (
              <Card
                key={req._id}
                className="shadow-md hover:shadow-lg transition border border-gray-200 rounded-2xl overflow-hidden"
              >
                {req.foodId?.image && (
                  <img
                    src={req.foodId.image}
                    alt={req.foodId.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle className="text-green-700">
                    {req.foodId?.title || "Food Item"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700 space-y-2">
                  <p className="text-sm">{req.foodId?.description || "No description."}</p>
                  <p className="text-sm">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${
                        req.status === "approved"
                          ? "text-green-600"
                          : req.status === "pending"
                          ? "text-yellow-600"
                          : "text-gray-500"
                      } font-medium`}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </p>

                  {req.foodId?.address && (
                    <p className="text-sm">
                      <strong>Pickup Location:</strong> {req.foodId.address}
                    </p>
                  )}

                  <p className="text-sm">
                    <strong>Requested On:</strong>{" "}
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>

                  {req.status === "pending" && (
                    <Button
                      onClick={() => handleCancel(req._id)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white mt-3"
                    >
                      Cancel Request
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyRequests;
