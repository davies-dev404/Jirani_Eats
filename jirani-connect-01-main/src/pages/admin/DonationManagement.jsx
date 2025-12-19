import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, MapPin, Eye, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DonationManagement() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchDonations = async () => {
    try {
        const { data } = await api.get("/foods/admin");
        setDonations(data);
    } catch (error) {
        console.error("Failed to fetch donations", error);
        toast.error("Failed to load donations");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchDonations();

      if (socket) {
          socket.on("adminFoodPending", (newFood) => {
              toast.info("New donation received!");
              setDonations(prev => [newFood, ...prev]);
          });
          
          socket.on("foodUpdated", (updatedFood) => {
               setDonations(prev => prev.map(d => d._id === updatedFood._id ? updatedFood : d));
          });

          return () => {
              socket.off("adminFoodPending");
              socket.off("foodUpdated");
          };
      }
  }, [socket]);

  const handleAction = async (id, status) => {
      try {
          await api.put(`/foods/${id}`, { approvalStatus: status });
          toast.success(`Donation ${status}!`);
          // Socket will handle the update via foodUpdated event
      } catch (error) {
          console.error("Update failed", error);
          toast.error("Failed to update status");
      }
  };

  return (
    <div className="space-y-6">
      <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Donation Management</h1>
           <p className="text-gray-500">Monitor, approve, and track incoming food donations.</p>
      </div>

       {loading ? (
           <div>Loading...</div>
       ) : (
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {donations.length > 0 ? (
                donations.map((donation) => (
                <Card key={donation._id} className="overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${donation.approvalStatus === 'approved' ? 'from-green-500 to-emerald-400' : 'from-yellow-500 to-orange-400'}`} />
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-2">
                             <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-wider">
                                {donation.unit}
                             </Badge>
                             <Badge className={
                                 donation.approvalStatus === "pending_approval" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                                 donation.approvalStatus === "available" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                 "bg-red-100 text-red-700 hover:bg-red-100"
                             }>
                                {donation.approvalStatus === "pending_approval" ? "Pending Approval" : 
                                 donation.approvalStatus === "available" ? "Available" : donation.approvalStatus}
                             </Badge>
                        </div>
                        {donation.image && (
                            <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                                <img src={donation.image} alt={donation.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <CardTitle className="text-lg">{donation.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                            <span className="font-medium text-gray-900">{donation.postedBy?.name || "Unknown Donor"}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm text-gray-500">
                             <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{donation.createdAt ? format(new Date(donation.createdAt), 'PPP') : 'N/A'}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>{donation.pickupLocation?.address || (typeof donation.pickupLocation === 'string' ? donation.pickupLocation : 'N/A')}</span>
                             </div>
                        </div>
                        {donation.approvalStatus === 'pending_approval' && (
                        <div className="flex gap-2 pt-2">
                             <Button 
                                variant="outline" 
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" 
                                size="icon"
                                onClick={() => handleAction(donation._id, 'rejected')}
                             >
                                <X className="h-4 w-4" />
                             </Button>
                             <Button 
                                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                                size="icon"
                                onClick={() => handleAction(donation._id, 'available')}
                             >
                                <Check className="h-4 w-4" />
                             </Button>
                        </div>
                        )}
                    </CardContent>
                </Card>
            ))
            ) : (
                <div className="col-span-full py-12 text-center bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500">No active donations found.</p>
                </div>
            )}
       </div>
       )}
    </div>
  );
}
