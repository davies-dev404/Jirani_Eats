import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Package, Clock, CheckCircle } from "lucide-react";
import { ImpactCharts } from "./ImpactCharts";
import { FoodCardSkeleton } from "@/components/ui/skeleton-cards";
import EmptyState from "@/components/ui/empty-state";

import { useState } from "react";
import DonateFoodForm from "./DonateFoodForm";

const DonorDashboard = ({ foods, requests, loading, renderString, handleUpdateRequest }) => {
  const [view, setView] = useState("overview"); // 'overview' | 'donate'

  if (view === "donate") {
      return <DonateFoodForm onCancel={() => setView("overview")} onSuccess={() => setView("overview")} />;
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      {/* 🚀 Quick Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Make a Difference Today</h2>
          <p className="text-blue-700 mt-1">Share your surplus food with neighbors in need.</p>
        </div>
        <Button size="lg" className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 shadow-lg" onClick={() => setView("donate")}>
            <Plus className="mr-2 h-5 w-5" /> Donate Food Now
        </Button>
      </div>

      {/* 📊 Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white hover:shadow-lg transition-all border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700"><Package className="mr-2 h-5 w-5" /> Active Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-gray-800">{loading ? "..." : foods.length}</p>
            <p className="text-sm text-gray-500 mt-1">Items currently listed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-lg transition-all border-l-4 border-l-orange-500 cursor-pointer" onClick={() => window.location.href = '/dashboard/donor/requests'}>
          <CardHeader>
             <CardTitle className="flex items-center text-orange-700"><Clock className="mr-2 h-5 w-5" /> Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-gray-800">{loading ? "..." : requests.filter(r => r.status === 'pending').length}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting your approval</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-all border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700"><CheckCircle className="mr-2 h-5 w-5" /> Total Impact</CardTitle>
          </CardHeader>
           <CardContent>
            <p className="text-4xl font-extrabold text-gray-800">{loading ? "..." : requests.filter(r => r.status === 'completed' || r.status === 'approved').length}</p>
            <p className="text-sm text-gray-500 mt-1">Meals provided</p>
          </CardContent>
        </Card>
      </div>
      
      {/* 📈 Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-4">
             <ImpactCharts requests={requests} />
         </div>
      </div>

      {/* 📬 Pending Requests (Action Needed) */}
      {requests.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📬 Requests Requiring Action
          </h3>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <Card key={req._id} className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="text-lg">{req.food?.title}</CardTitle>
                  <CardDescription>Requested by <span className="font-semibold text-gray-900">{req.requestedBy?.name}</span></CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded border">Status: {req.status}</span>
                    <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  {req.status === "pending" && (
                    <div className="flex gap-2 w-full">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleUpdateRequest(req._id, "approved")}>Accept</Button>
                      <Button className="flex-1" variant="destructive" onClick={() => handleUpdateRequest(req._id, "declined")}>Decline</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 🥘 Active Listings */}
      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Active Listings</h3>
        {loading ? (
             <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <FoodCardSkeleton key={i} />)}
             </div>
        ) : foods.length === 0 ? (
          <EmptyState 
            type="food"
            title="No active listings"
            description="You don't have any active donations at the moment."
            actionLabel="Donate Food Now"
            onAction={() => setView("donate")}
          />
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {foods.map((food) => (
              <Card key={food._id} className="hover:shadow-md transition">
                {food.image && (
                  <img src={renderString(food.image)} alt={renderString(food.title)} className="w-full h-32 object-cover rounded-t-xl" />
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base truncate">{renderString(food.title)}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p><strong>Qty:</strong> {renderString(food.quantity)} {renderString(food.unit)}</p>
                  <p className="truncate"><strong>Pickup:</strong> {food.pickupLocation?.address || "N/A"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DonorDashboard;
