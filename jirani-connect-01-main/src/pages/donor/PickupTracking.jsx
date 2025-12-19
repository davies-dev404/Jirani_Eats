import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, MapPin, Clock, CheckCircle } from "lucide-react";

export default function PickupTracking() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pickup Tracking</h1>
        <p className="text-gray-500">Track the status of your donation pickups in real-time.</p>
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Active Pickups</CardTitle>
           <CardDescription>Track riders assigned to collect your donations.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-dashed text-slate-500 space-y-3">
                <Package className="h-10 w-10 opacity-20" />
                <div>
                    <h3 className="font-medium text-slate-900">No active pickups</h3>
                    <p className="text-sm">When a rider accepts your donation, you can track them here.</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-sm text-gray-500 text-center py-4">
                  No recent pickup history.
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
