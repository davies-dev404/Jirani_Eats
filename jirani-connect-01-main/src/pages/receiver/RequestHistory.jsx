import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, MapPin, Eye, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/context/SocketContext";

export default function RequestHistory() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchRequests = async () => {
        try {
            const res = await api.get("/requests");  
            setRequests(res.data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };
    fetchRequests();

    if (socket) {
        socket.on("requestUpdated", fetchRequests);
        return () => socket.off("requestUpdated", fetchRequests);
    }
  }, [socket]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Request History</h1>
            <p className="text-gray-500">Track the status of your food requests.</p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700 gap-2">
            <Link to="/dashboard/receiver/browse">
                <Utensils className="h-4 w-4" /> Browse Food
            </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
            <p className="text-gray-500 mb-4">You haven't made any food requests yet.</p>
            <Button asChild variant="outline">
                <Link to="/dashboard/receiver/browse">Find Food Near You</Link>
            </Button>
        </div>
      ) : (
        <div className="space-y-4">
            {requests.map((request) => (
                <Card key={request._id} className="overflow-hidden hover:shadow-md transition-shadow">
                     <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                            <div className={`w-full sm:w-2 bg-gradient-to-b ${
                                request.status === 'approved' ? 'from-green-500 to-green-600' : 
                                request.status === 'delivered' ? 'from-blue-500 to-blue-600' :
                                request.status === 'requested' ? 'from-yellow-500 to-orange-500' : 
                                'from-gray-400 to-gray-500'
                            }`} />
                            
                            {request.food?.image && (
                                <div className="h-32 w-full sm:w-32 sm:h-auto relative">
                                    <img src={request.food.image} alt={request.food.title} className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                            )}
                            
                            <div className="flex-1 p-5">
                                <div className="flex justify-between items-start mb-2">
                                     <div className="flex gap-2 items-center">
                                         <Badge variant="outline" className="text-xs uppercase">
                                            {request.deliveryMethod || "Pickup"}
                                         </Badge>
                                         <span className="text-xs text-gray-500">ID: {request._id.slice(-6)}</span>
                                     </div>
                                     <Badge className={
                                         request.status === "approved" ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" :
                                         request.status === "requested" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none" :
                                         request.status === "delivered" ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none" :
                                         "bg-gray-100 text-gray-700 hover:bg-gray-100 border-none"
                                     }>
                                        {request.status}
                                     </Badge>
                                </div>
                                
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{request.food?.title || "Unknown Food Item"}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>{request.pickupLocation?.address || (typeof request.pickupLocation === 'string' ? request.pickupLocation : "Location N/A")}</span>
                                        </div>
                                    </div>
                                    
                                        <div className="flex flex-col gap-2">
                                            {request.status === 'delivered' && (
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => {
                                                    await api.patch(`/requests/${request._id}`, { status: 'completed' });
                                                    // Trigger refresh or update local state logic here
                                                    window.location.reload(); 
                                                }}>
                                                    Confirm Receipt
                                                </Button>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    <Eye className="h-4 w-4" /> Details
                                                </Button>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>
                     </CardContent>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}
