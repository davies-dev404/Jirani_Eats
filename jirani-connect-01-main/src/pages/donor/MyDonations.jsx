import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, Calendar, MapPin, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/context/SocketContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const { socket } = useSocket();

  useEffect(() => {
    const fetchDonations = async () => {
        try {
            const res = await api.get("/foods/my-foods");  
            setDonations(res.data);
        } catch (error) {
            console.error("Failed to fetch donations", error);
        } finally {
            setLoading(false);
        }
    };
    fetchDonations();

    if (socket) {
        socket.on("foodUpdated", (updatedFood) => {
            setDonations(prev => prev.map(d => d._id === updatedFood._id ? updatedFood : d));
        });
        return () => {
            socket.off("foodUpdated");
        };
    }
  }, [socket]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Donations</h1>
            <p className="text-gray-500">View and manage your food contributions.</p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700 gap-2">
            <Link to="/dashboard/donor/donate/new">
                <Plus className="h-4 w-4" /> Add Donation
            </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : donations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No donations yet</h3>
            <p className="text-gray-500 mb-4">Start sharing food with your community today.</p>
            <Link to="/dashboard/donor/donate/new">
                <Button variant="outline">Make First Donation</Button>
            </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {donations.map((donation) => (
                <Card key={donation._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 w-full bg-slate-100 relative group">
                    {donation.imageUrl ? (
                        <img 
                            src={`${import.meta.env.VITE_API_URL}${donation.imageUrl}`} 
                            alt={donation.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://placehold.co/600x400?text=No+Image"; 
                            }}
                        />
                    ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400 bg-green-50">
                            <span className="text-4xl">🍲</span>
                         </div>
                    )}
                 </div>
                     <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                             <Badge variant="outline" className="text-xs uppercase">
                                {donation.unit}
                             </Badge>
                             <Badge className={
                                 donation.approvalStatus === "pending" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                                 donation.approvalStatus === "approved" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                 "bg-red-100 text-red-700 hover:bg-red-100"
                             }>
                                {donation.approvalStatus || "Pending"}
                             </Badge>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{donation.title}</h3>
                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                             <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{donation.quantity}</span> {donation.unit}
                             </div>
                             <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">{donation.pickupLocation?.address || (typeof donation.pickupLocation === 'string' ? donation.pickupLocation : 'N/A')}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(donation.createdAt).toLocaleDateString()}</span>
                             </div>
                        </div>
                        <Button variant="outline" className="w-full gap-2 text-xs h-9" onClick={() => setSelectedDonation(donation)}>
                            <Eye className="h-3.5 w-3.5" /> View Details
                        </Button>
                     </CardContent>
                </Card>
            ))}
        </div>
      )}

      <Dialog open={!!selectedDonation} onOpenChange={(open) => !open && setSelectedDonation(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
            <DialogDescription>
                Full details about this food donation.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDonation && (
            <div className="space-y-4">
                <div className="h-48 w-full bg-slate-100 rounded-md overflow-hidden relative">
                    {selectedDonation.imageUrl ? (
                        <img 
                            src={`${import.meta.env.VITE_API_URL}${selectedDonation.imageUrl}`} 
                            alt={selectedDonation.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => { 
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/600x400?text=No+Image"; 
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <span className="text-4xl">🍲</span>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedDonation.title}</h3>
                    <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{selectedDonation.category || "General"}</Badge>
                        <Badge className={
                             selectedDonation.approvalStatus === "pending" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                             selectedDonation.approvalStatus === "approved" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                             "bg-red-100 text-red-700 hover:bg-red-100"
                        }>
                            {selectedDonation.approvalStatus}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-semibold text-gray-500 block">Quantity</span>
                        <span>{selectedDonation.quantity} {selectedDonation.unit}</span>
                    </div>
                     <div>
                        <span className="font-semibold text-gray-500 block">Expiry</span>
                        <span>{selectedDonation.expiryDate ? new Date(selectedDonation.expiryDate).toLocaleString() : "N/A"}</span>
                    </div>
                     <div className="col-span-2">
                        <span className="font-semibold text-gray-500 block">Pickup Location</span>
                        <span>{selectedDonation.pickupLocation?.address || (typeof selectedDonation.pickupLocation === 'string' ? selectedDonation.pickupLocation : 'N/A')}</span>
                    </div>
                </div>

                {selectedDonation.description && (
                    <div className="bg-slate-50 p-3 rounded-md text-sm">
                        <span className="font-semibold text-gray-500 block mb-1">Description</span>
                        <p>{selectedDonation.description}</p>
                    </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
