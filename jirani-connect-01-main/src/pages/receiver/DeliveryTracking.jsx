import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import api from "../../api";

export default function DeliveryTracking() {
  const [activeDelivery, setActiveDelivery] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
      // Fetch initial active delivery
      const fetchDelivery = async () => {
          try {
              const { data } = await api.get("/requests"); // Get all my requests
              // Filter for active ones
              const active = data.find(r => ['on_the_way', 'picked_up', 'delivered'].includes(r.status));
              if(active) setActiveDelivery(active);
          } catch(e) { console.error(e); }
      };
      fetchDelivery();

      if(socket) {
          socket.on("requestUpdated", (updated) => {
              if (updated.status === 'delivered') {
                   // Keep showing it for a moment or show success
                   setActiveDelivery(updated); 
              } else if (['on_the_way', 'picked_up'].includes(updated.status)) {
                   setActiveDelivery(updated);
              }
          });
          return () => socket.off("requestUpdated");
      }
  }, [socket]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Delivery Tracking</h1>
        <p className="text-gray-500">Track your incoming food deliveries in real-time.</p>
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Active Deliveries</CardTitle>
           <CardDescription>View the live location of your rider.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Real-time Tracking Info */}
            {activeDelivery ? (
                 <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                         <div className="flex items-center gap-3">
                             <div className="bg-white p-2 rounded-full shadow-sm">
                                 <Clock className="h-5 w-5 text-blue-600" />
                             </div>
                             <div>
                                 <p className="font-semibold text-blue-900 capitalize">{activeDelivery.status.replace(/_/g, " ")}</p>
                                 <p className="text-xs text-blue-600">Updated just now</p>
                             </div>
                         </div>
                     </div>
                     <div className="h-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                         Map Visualization Coming Soon
                     </div>
                     {activeDelivery.proofOfDelivery && (
                         <div className="mt-4">
                             <p className="font-semibold mb-2">Proof of Delivery:</p>
                             <img src={activeDelivery.proofOfDelivery} alt="Proof" className="w-full h-48 object-cover rounded-lg border" />
                         </div>
                     )}
                 </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-dashed text-slate-500 space-y-3">
                    <MapPin className="h-10 w-10 opacity-20" />
                    <div>
                        <h3 className="font-medium text-slate-900">No active deliveries</h3>
                        <p className="text-sm">Once a rider picks up your request, tracking will appear here.</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
