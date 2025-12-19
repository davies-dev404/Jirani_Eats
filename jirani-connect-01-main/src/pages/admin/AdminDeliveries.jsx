import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Filter, Download, Plus, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../api";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [selectedRider, setSelectedRider] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDeliveries = async () => {
    try {
      const { data } = await api.get("/requests");
      setDeliveries(data);
    } catch (error) {
      console.error("Failed to fetch deliveries", error);
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const fetchDataForModal = async () => {
      try {
          const [reqRes, usersRes] = await Promise.all([
              api.get("/requests"),
              api.get("/users") // Using generic users endpoint to avoid 403 issues temporarily
          ]);

          // Filter for approved requests (by Donor) that don't have a rider yet
          // The workflow is: Requested -> Approved (Donor) -> Assigned (Admin)
          const pending = reqRes.data.filter(r => r.status === 'approved' && !r.rider);
          setPendingRequests(pending);

          // Filter for verified riders
          // Filter for verified and ONLINE riders
          const riders = usersRes.data.filter(u => u.role === 'rider' && u.verificationStatus === 'approved' && u.isAvailable);
          
          setAvailableRiders(riders);
      } catch (error) {
          console.error("Failed to load modal data", error);
          toast.error("Could not load requests or riders");
      }
  };

  useEffect(() => {
    fetchDeliveries();
    
    if (socket) {
        socket.on("requestUpdated", fetchDeliveries);
        socket.on("requestAdded", fetchDeliveries); // If admin sees new ones
        return () => {
             socket.off("requestUpdated", fetchDeliveries);
             socket.off("requestAdded", fetchDeliveries);
        };
    }
  }, [socket]);

  useEffect(() => {
      if (isModalOpen) {
          fetchDataForModal();
      }
  }, [isModalOpen]);

  // Socket Listener for Real-time Updates
  useEffect(() => {
      // Import socket from context if not already done (need to update imports)
      // Since I can't easily add the hook import in this block without context, I will do a multi-edit or assume imports are added. 
      // Wait, I need to add `useSocket` to imports and the hook call first. 
      // I'll do this in two steps or use multi_replace if imports needed.
      // Let's check imports first.
  }, []);

  const handleAssign = async () => {
      if (!selectedRequest || !selectedRider) {
          toast.error("Please select both a request and a rider");
          return;
      }

      try {
          setSubmitting(true);
          await api.patch(`/requests/${selectedRequest}/assign`, { riderId: selectedRider });
          toast.success("Delivery assigned successfully!");
          setIsModalOpen(false);
          fetchDeliveries(); // Refresh list
          setSelectedRequest("");
          setSelectedRider("");
      } catch (error) {
          console.error("Assignment failed", error);
          toast.error("Failed to assign delivery");
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Deliveries</h1>
           <p className="text-gray-500">Manage and track all system deliveries.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Delivery
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>All Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
             {loading ? (
                 <div className="text-center py-8">Loading...</div>
             ) : deliveries.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Food Item</TableHead>
                            <TableHead>Pickup</TableHead>
                            <TableHead>Rider</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {deliveries.map((delivery) => (
                             <TableRow key={delivery._id}>
                                 <TableCell className="font-mono text-xs">{delivery._id.substring(0, 8)}...</TableCell>
                                 <TableCell>
                                     <div className="flex items-center gap-2">
                                         {delivery.food?.image && (
                                             <img src={delivery.food.image} alt="" className="h-8 w-8 rounded object-cover border border-gray-200" />
                                         )}
                                         <span className="font-medium">{delivery.food?.title || "Unknown"}</span>
                                     </div>
                                 </TableCell>
                                 <TableCell className="max-w-[200px] truncate">
                                     {delivery.pickupLocation}
                                 </TableCell>
                                 <TableCell>
                                     {delivery.rider ? (
                                         <div className="flex items-center gap-2">
                                             <span className="font-medium">{delivery.rider.name}</span>
                                         </div>
                                     ) : (
                                         <Badge variant="outline" className="text-gray-500">Unassigned</Badge>
                                     )}
                                 </TableCell>
                                 <TableCell>
                                     <Badge className={
                                         delivery.status === 'delivered' ? "bg-green-100 text-green-700" :
                                         delivery.status === 'picked-up' ? "bg-blue-100 text-blue-700" :
                                         delivery.status === 'accepted' ? "bg-purple-100 text-purple-700" :
                                         "bg-yellow-100 text-yellow-700"
                                     }>
                                         {delivery.status}
                                     </Badge>
                                 </TableCell>
                                 <TableCell className="text-right">
                                     <Button variant="ghost" size="sm">View</Button>
                                 </TableCell>
                             </TableRow>
                         ))}
                    </TableBody>
                </Table>
             ) : (
                <div className="text-center py-12 text-gray-500">
                    <p>No deliveries found.</p>
                    <p className="text-xs mt-1">New deliveries will appear here once created.</p>
                </div>
             )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Delivery</DialogTitle>
            <DialogDescription>
              Assign a rider to a pending food request manually.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="request">Pending Request</Label>
              <Select onValueChange={setSelectedRequest} value={selectedRequest}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a request" />
                </SelectTrigger>
                <SelectContent>
                  {pendingRequests.length > 0 ? (
                      pendingRequests.map(req => (
                          <SelectItem key={req._id} value={req._id}>
                              {req.food?.title} - {req.requestedBy?.name} ({req.pickupLocation})
                          </SelectItem>
                      ))
                  ) : (
                      <div className="p-2 text-sm text-gray-500 text-center">No approved requests waiting for assignment</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rider">Assign Rider</Label>
              <Select onValueChange={setSelectedRider} value={selectedRider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a rider" />
                </SelectTrigger>
                <SelectContent>
                  {availableRiders.length > 0 ? (
                      availableRiders.map(rider => (
                          <SelectItem key={rider._id} value={rider._id}>
                              {rider.name} ({rider.isAvailable ? 'Online' : 'Offline'})
                          </SelectItem>
                      ))
                  ) : (
                      <div className="p-2 text-sm text-gray-500 text-center">No approved riders found</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={submitting || !selectedRequest || !selectedRider} className="bg-green-600 hover:bg-green-700">
                {submitting ? "Assigning..." : "Assign Delivery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
