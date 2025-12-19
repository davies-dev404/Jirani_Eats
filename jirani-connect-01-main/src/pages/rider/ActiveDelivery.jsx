import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, CheckCircle, Navigation, Camera, AlertTriangle, PackageOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

export default function ActiveDelivery() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { user } = useAuth();

  const fetchActiveJob = async () => {
      try {
          const { data } = await api.get("/requests/rider/active");
          setJob(data);
      } catch (error) {
          console.error("No active job", error);
          setJob(null);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchActiveJob();
      
      if(socket) {
          socket.on("requestUpdated", (updatedReq) => {
              // Case 1: Updating existing job
              if (job && updatedReq._id === job._id) {
                   setJob(prev => ({ ...prev, ...updatedReq }));
              }
              // Case 2: New assignment coming in (when we have no job)
              else if (!job && updatedReq.rider && (updatedReq.rider._id === user?._id || updatedReq.rider === user?._id) && ['assigned', 'on_the_way', 'picked_up'].includes(updatedReq.status)) {
                   setJob(updatedReq);
                   toast.info("You have a new delivery assignment!");
              }
          });
          return () => socket.off("requestUpdated");
      }
  }, [socket, job, user]);

  const [proofImage, setProofImage] = useState(null);

  const handleStatusUpdate = async () => {
    let nextStatus = "";
    let payload = {};

    if (job.status === "on_the_way" || job.status === "assigned") {
        nextStatus = "picked_up";
    } else if (job.status === "picked_up") {
        // Require proof for delivery
        if (!proofImage) {
            toast.error("Please upload proof of delivery first");
            return;
        }
        nextStatus = "delivered";
        payload.proofOfDelivery = proofImage;
    } else return;

    try {
        const { data } = await api.patch(`/requests/${job._id}`, { status: nextStatus, ...payload });
        setJob(data);
        toast.success(`Delivery status updated to ${nextStatus}`);
    } catch (error) {
        console.error("Update failed", error);
        toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  if (!job) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-6 text-center">
         <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <PackageOpen className="h-10 w-10 text-gray-400" />
         </div>
         <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">No Active Delivery</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
                You don't have any ongoing deliveries at the moment. Browse available jobs to start earning.
            </p>
         </div>
         <Link to="/dashboard/rider/jobs">
            <Button className="bg-green-600 hover:bg-green-700 h-11 px-8">
                Browse Available Jobs
            </Button>
         </Link>
      </div>
    );
  }

  const status = job.status; 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Active Delivery</h1>
           <p className="text-gray-500">Job ID: {job._id}</p>
        </div>
        <Badge variant={status === "delivered" ? "default" : "outline"} className="text-sm px-3 py-1 capitalize border-green-200 bg-green-50 text-green-700">
            Status: {status === 'assigned' ? 'New Assignment' : status === 'on_the_way' ? `Heading to Pickup` : status === 'picked_up' ? `In Transit` : 'Delivered'}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Map & Actions */}
        <div className="lg:col-span-2 space-y-6">
            {/* Map Placeholder */}
            <div className="w-full h-80 bg-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden border border-gray-100">
                <div className="absolute inset-0 bg-slate-200/50 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                         <Navigation className="h-10 w-10 mx-auto mb-2 opacity-50" />
                         <p>Live Map Integration</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                 {status === 'assigned' ? (
                     <>
                        <Button variant="outline" className="h-14 text-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={async () => {
                            try {
                                await api.patch(`/requests/${job._id}/decline`);
                                toast.success("Assignment declined.");
                                setJob(null); // Clear local job
                            } catch(e) {
                                console.error(e);
                                toast.error("Failed to decline job");
                            }
                        }}>
                             <AlertTriangle className="mr-2 h-5 w-5" /> Decline
                        </Button>
                        <Button className="h-14 text-lg bg-green-600 hover:bg-green-700 animate-pulse" onClick={async () => {
                            try {
                                await api.patch(`/requests/${job._id}/accept`);
                                toast.success("Job Accepted! Head to pickup.");
                            } catch(e) {
                                console.error(e);
                                toast.error("Failed to accept job");
                            }
                        }}>
                            Accept Assignment
                        </Button>
                     </>
                 ) : (
                     <>
                        <Button variant="outline" className="h-14 text-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                            <AlertTriangle className="mr-2 h-5 w-5" /> Report Issue
                        </Button>
                        
                        {status !== 'delivered' && status !== 'completed' ? (
                            <Button className="h-14 text-lg bg-green-600 hover:bg-green-700" onClick={handleStatusUpdate}>
                                {status === 'on_the_way' ? 'Confirm Pickup' : 'Confirm Delivery'}
                            </Button>
                        ) : (
                            <div className="col-span-1 flex items-center justify-center text-green-600 font-bold bg-green-50 rounded-lg border border-green-100">
                                <CheckCircle className="mr-2 h-6 w-6" /> Job Completed
                            </div>
                        )}
                     </>
                 )}
            </div>

            {/* Proof of Delivery Upload */}
            {(status === 'picked_up') && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-900">Proof of Delivery</h4>
                            <p className="text-sm text-blue-700">Please upload a photo of the delivered food to complete this job.</p>
                        </div>
                    </div>
                    
                    <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        id="proof-upload"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                                toast.info("Uploading photo...");
                                // Assuming typical upload endpoint
                                const res = await api.post("/upload", formData, {
                                    headers: { "Content-Type": "multipart/form-data" },
                                });
                                // Store the uploaded URL to use in status update
                                setProofImage(res.data);
                                toast.success("Photo uploaded!");
                            } catch (error) {
                                console.error("Upload failed", error);
                                toast.error("Failed to upload photo");
                            }
                        }}
                    />
                    <label htmlFor="proof-upload">
                        <Button variant="outline" size="sm" className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-100 w-full" asChild>
                            <span>{proofImage ? "Change Photo" : "Upload Photo"}</span>
                        </Button>
                    </label>
                    {proofImage && <p className="text-xs text-green-600 font-medium">Photo Attached</p>}
                </div>
            )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Delivery Details</CardTitle>
                    {job.food?.image && (
                        <div className="w-full h-40 mt-4 rounded-lg overflow-hidden border border-gray-100">
                             <img src={job.food.image} alt={job.food.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-2.5 top-2 bottom-8 w-0.5 bg-gray-200" />

                        {/* Status Steps Visualization */}
                        <div className={`relative pl-8 pb-6 ${status === 'assigned' || status === 'on_the_way' || status === 'picked_up' || status === 'delivered' ? 'opacity-100' : 'opacity-40'}`}>
                             <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 ${status === 'assigned' || status === 'on_the_way' ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`} />
                             <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Assigned</h4>
                             <p className="text-xs text-gray-500">Job received</p>
                        </div>

                        <div className={`relative pl-8 pb-6 ${(status === 'on_the_way' || status === 'picked_up' || status === 'delivered') ? 'opacity-100' : 'opacity-40'}`}>
                             <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 ${(status === 'on_the_way' || status === 'picked_up') ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white'}`} />
                             <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Pickup</h4>
                             <p className="font-medium text-gray-900">{job.food?.pickupLocation?.address || (typeof job.food?.pickupLocation === 'string' ? job.food.pickupLocation : (job.pickupLocation?.address || (typeof job.pickupLocation === 'string' ? job.pickupLocation : "Unknown")))}</p>
                        </div>
                         
                        <div className={`relative pl-8 ${status === 'picked_up' || status === 'delivered' ? 'opacity-100' : 'opacity-40'}`}>
                             <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 ${status === 'delivered' ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'}`} />
                             <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Dropoff</h4>
                             <p className="font-medium text-gray-900">{job.requestedBy?.address || "Customer Location"}</p>
                        </div>
                         
                        <div className={`relative pl-8 ${status === 'picked_up' || status === 'delivered' ? 'opacity-100' : 'opacity-40'}`}>
                             <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 ${status === 'delivered' ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'}`} />
                             <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Dropoff</h4>
                             <p className="font-medium text-gray-900">{job.requestedBy?.address || "Customer Location"}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Distance</span>
                            <span className="font-medium">4.2 km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Items</span>
                            <span className="font-medium">{job.items}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Est. Earnings</span>
                            <span className="font-medium text-green-600">{job.earnings}</span>
                        </div>
                    </div>

                    <Button variant="secondary" className="w-full">
                        <Phone className="mr-2 h-4 w-4" /> Call Contact
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
