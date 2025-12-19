import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { RatingModal } from "../RatingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, MapPin, Calendar, ArrowRight, Truck } from "lucide-react";
import { ProfileProgress } from "./ProfileProgress";
import MapComponent from "../MapComponent";
import { useSocket } from "@/context/SocketContext";

/**
 * Professional Dashboard for Receivers
 */

const ReceiverDashboard = ({ user, foods: initialFoods, requests: initialRequests, loading, renderString }) => {
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState(null);
  const [foods, setFoods] = useState(initialFoods);
  const [requestsList, setRequestsList] = useState(initialRequests);
  const { socket } = useSocket();

  useEffect(() => {
      setFoods(initialFoods);
      setRequestsList(initialRequests);
  }, [initialFoods, initialRequests]);

  useEffect(() => {
      if (!socket) return;

      socket.on("foodUpdated", (updatedFood) => {
          setFoods(prev => prev.map(f => f._id === updatedFood._id ? updatedFood : f));
      });

      socket.on("requestUpdated", (updatedRequest) => {
          setRequestsList(prev => prev.map(r => r._id === updatedRequest._id ? updatedRequest : r));
      });

      return () => {
          socket.off("foodUpdated");
          socket.off("requestUpdated");
      };
  }, [socket]);

  const handleRateClick = (riderId) => {
      setSelectedRiderId(riderId);
      setRatingModalOpen(true);
  };

  const getProgressStep = (status, deliveryStatus) => {
      if (status === 'delivered' || deliveryStatus === 'delivered') return 4;
      if (deliveryStatus === 'picked-up') return 3;
      if (status === 'accepted' || deliveryStatus === 'accepted') return 2;
      if (status === 'approved') return 1;
      return 0; // pending
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <RatingModal 
          isOpen={ratingModalOpen} 
          onClose={() => setRatingModalOpen(false)} 
          riderId={selectedRiderId}
      />
      
      {/* ... (rest of the component) ... */}


      <div className="transform hover:scale-[1.01] transition-transform duration-300">
          <ProfileProgress user={user} />
      </div>

      {/* 🟢 Modern Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-sm font-medium text-green-50">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    Live Donations Available
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                    Good Food Should <br/> Never Go To Waste.
                </h2>
                <p className="text-lg text-green-100 font-medium leading-relaxed">
                    Connect with generous neighbors and local businesses sharing surplus food. 
                    Claim a meal today and help build a stronger community.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                    <Button asChild size="lg" className="bg-white text-green-700 hover:bg-green-50 font-bold shadow-lg h-12 px-8 rounded-full border-2 border-transparent transition-all hover:scale-105">
                        <Link to="/dashboard/browse-donations">
                            Browse Food <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 font-semibold h-12 px-8 rounded-full transition-all">
                        <Link to="/how-it-works">How it Works</Link>
                    </Button>
                </div>
            </div>
            {/* Illustration/Icon */}
            <div className="hidden md:block opacity-90 transform rotate-3 hover:rotate-6 transition-transform duration-700">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl">
                    <Inbox className="h-32 w-32 text-white" />
                </div>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section - Takes 2 cols */}
          <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" /> Live Map View
                  </h3>
                  <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md">
                      Real-time
                  </span>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 ring-4 ring-white">
                  <MapComponent foods={foods} />
              </div>
          </div>

          {/* Activity / Requests - Takes 1 col */}
          <div className="space-y-4">
               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-blue-600" /> Your Activity
               </h3>
               
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px] overflow-y-auto max-h-[600px]">
                   {requestsList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10 opacity-60">
                            <div className="bg-gray-50 p-4 rounded-full">
                                <Inbox className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No active requests</p>
                            <Button variant="link" asChild className="text-green-600">
                                <Link to="/dashboard/browse-donations">Start claiming food</Link>
                            </Button>
                        </div>
                   ) : (
                       <div className="space-y-6">
                           {requestsList.slice(0, 5).map((req, i) => {
                               const progress = getProgressStep(req.status, req.deliveryStatus);
                               
                               return (
                               <div key={req._id} className="relative pl-6 pb-2 border-l-2 border-gray-100 last:border-0 hover:border-green-200 transition-colors group">
                                   <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-sm transition-colors ${
                                       req.status === 'approved' ? 'bg-green-500' :
                                       req.status === 'pending' ? 'bg-orange-400' : 
                                       req.status === 'completed' ? 'bg-blue-500' : 
                                       req.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
                                   }`}></div>
                                   
                                   <div className="mb-2">
                                       <span className="text-sm font-bold text-gray-800 group-hover:text-green-700 transition-colors block">
                                            {req.food?.title || "Food Item"}
                                       </span>
                                       {/* Progress Bar for Active Deliveries */}
                                       {(req.deliveryMethod === 'rider' && req.status !== 'cancelled' && req.status !== 'completed' && req.status !== 'pending') && (
                                           <div className="mt-2 space-y-1">
                                               <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                   <span className={progress >= 2 ? "text-green-600" : ""}>Accepted</span>
                                                   <span className={progress >= 3 ? "text-green-600" : ""}>On Way</span>
                                                   <span className={progress >= 4 ? "text-green-600" : ""}>Delivered</span>
                                               </div>
                                               <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                                   <div className={`h-full bg-green-500 transition-all duration-500 ${
                                                       progress === 2 ? "w-1/3" :
                                                       progress === 3 ? "w-2/3" :
                                                       progress === 4 ? "w-full" : "w-0"
                                                   }`}></div>
                                               </div>
                                           </div>
                                       )}
                                       {/* Rider Info if assigned */}
                                       {req.rider && (
                                           <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-md flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                                    {req.rider.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-700">{req.rider.name}</p>
                                                    {req.deliveryStatus === 'picked-up' && <p className="text-green-600 font-medium">Coming to you...</p>}
                                                </div>
                                           </div>
                                       )}
                                   </div>

                                   <div className="flex justify-between items-center text-xs text-gray-400">
                                       <span>{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                       <span className={`px-2 py-0.5 rounded-full uppercase font-bold text-[10px] ${
                                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                                            req.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                                            req.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                       }`}>
                                           {req.deliveryStatus && req.deliveryStatus !== 'pending' ? req.deliveryStatus.replace('-', ' ') : req.status}
                                       </span>
                                   </div>

                                   {/* View Proof & Rate Button */}
                                   {(req.status === 'completed' || req.deliveryStatus === 'delivered') && (
                                       <div className="mt-2 flex gap-2">
                                           {req.proofOfDelivery && (
                                               <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-blue-600" onClick={() => window.open(renderString(req.proofOfDelivery), '_blank')}>
                                                   View Proof
                                               </Button>
                                           )}
                                           {req.rider && (
                                               <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  className="h-6 text-[10px] px-2 border-yellow-200 hover:bg-yellow-50 text-yellow-700"
                                                  onClick={() => handleRateClick(req.rider._id || req.rider)}
                                               >
                                                   Rate Rider
                                               </Button>
                                           )}
                                       </div>
                                   )}
                               </div>
                           )})}
                       </div>
                   )}
               </div>
          </div>
      </div>

      {/* 🥣 Available Now Preview */}
      <section>
        <div className="flex justify-between items-end mb-6">
            <div>
                <h3 className="text-2xl font-bold text-gray-900">Available Now</h3>
                <p className="text-gray-500 mt-1">Donations closest to you</p>
            </div>
            <Button variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" asChild>
                <Link to="/dashboard/browse-donations" className="flex items-center gap-2">
                    Browse All <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
        </div>
        
        {loading ? (
             <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>)}
             </div>
        ) : foods.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No donations available nearby right now.</p>
                <p className="text-sm text-gray-400 mt-2">Notifications are on - we'll ping you when food arrives!</p>
            </div>
        ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {foods.slice(0, 4).map((food) => (
                <Card key={food._id} className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-sm bg-white rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col">
                {food.image && (
                    <div className="relative overflow-hidden h-48">
                         <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                         <img src={renderString(food.image)} alt={renderString(food.title)} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            {renderString(food.quantity)} {renderString(food.unit)}
                         </div>
                    </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                    <h4 className="font-bold text-lg text-gray-900 mb-1 truncate leading-tight group-hover:text-green-700 transition-colors">
                        {renderString(food.title)}
                    </h4>
                    
                    <div className="space-y-3 mt-4 flex-1">
                        <div className="flex items-start gap-2.5">
                            <div className="p-1.5 bg-green-50 rounded-md shrink-0">
                                <MapPin className="h-3.5 w-3.5 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                {food.pickupLocation?.address || "Location hidden"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                             <div className="p-1.5 bg-orange-50 rounded-md shrink-0">
                                <Calendar className="h-3.5 w-3.5 text-orange-500" />
                             </div>
                             <span className="text-sm text-gray-500 pb-0.5">
                                Posted {new Date(food.createdAt).toLocaleDateString()}
                             </span>
                        </div>
                    </div>

                    <Button asChild className="w-full mt-6 bg-gray-900 hover:bg-green-600 text-white font-semibold rounded-xl py-6 shadow-md transition-all group-hover:shadow-green-200">
                        <Link to={`/dashboard/receiver/request/${food._id}`}>Request Item</Link>
                    </Button>
                </div>
                </Card>
            ))}
            </div>
        )}
      </section>

    </div>
  );
};

export default ReceiverDashboard;
