import { useEffect, useState, useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { io } from "socket.io-client";
import { Search, MapPin, Calendar, UtensilsCrossed, FolderSearch } from "lucide-react";
import api from "../api";

const BrowseDonations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [foods, setFoods] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [foodsRes, reqRes] = await Promise.all([
       api.get("/foods"),
       token ? api.get("/requests") : Promise.resolve({ data: [] }),
      ]);

      const foodData = foodsRes.data;
      const reqData = reqRes.data || [];

      setFoods(Array.isArray(foodData) ? foodData : []);
      setRequests(Array.isArray(reqData) ? reqData : []);
    } catch (err) {
      console.error(err);
      toast.error("Error loading food.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user) navigate("/auth");
    
    fetchData();
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", { auth: { token } });

    socket.on("foodAdded", (food) => setFoods((prev) => [food, ...prev]));
    socket.on("foodUpdated", (updatedFood) => {
        setFoods(prev => {
             // If food is approved and available, add/update it
             if(updatedFood.approvalStatus === 'available' && updatedFood.isAvailable) {
                 const exists = prev.find(f => f._id === updatedFood._id);
                 if(exists) return prev.map(f => f._id === updatedFood._id ? updatedFood : f);
                 return [updatedFood, ...prev];
             } else {
                 // If it's no longer available (quantity 0) or no longer approved (rejected/pending), remove it
                 return prev.filter(f => f._id !== updatedFood._id);
             }
        });
    });
    socket.on("requestAdded", (request) => setRequests((prev) => [request, ...prev]));

    return () => socket.disconnect();
  }, [fetchData, token, user, navigate]);

  const handleRequest = (foodId) => {
    if (!token) {
      toast.error("Please log in first.");
      return navigate("/auth");
    }
    navigate(`/request-food/${foodId}`);
  };

  const hasRequested = (foodId) => requests.some((req) => req.foodId === foodId || req.food === foodId);

  const filteredFoods = foods.filter(food => 
    food.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    food.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.pickupLocation?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h1 className="text-3xl font-bold text-gray-900">Browse Donations</h1>
                <p className="text-gray-500">Find and request food available near you.</p>
             </div>
             
             <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Search by food name or location..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
        </div>

        {loading ? (
             <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>)}
             </div>
        ) : filteredFoods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="bg-gray-100 p-6 rounded-full mb-4">
                   <FolderSearch className="h-12 w-12 text-gray-400" />
               </div>
               <h3 className="text-xl font-semibold text-gray-900">No Food Found</h3>
               <p className="text-gray-500 max-w-sm mx-auto mt-2">
                   {searchTerm ? `No results found for "${searchTerm}". Try different keywords.` : "There are no available food donations at the moment."}
               </p>
               {searchTerm && (
                   <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-green-600">
                       Clear Search
                   </Button>
               )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFoods.map((food) => (
              <Card key={food._id} className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-sm bg-white rounded-2xl overflow-hidden flex flex-col">
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {food.image ? (
                        <img 
                            src={food.image} 
                            alt={food.title} 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 text-green-600">
                             <UtensilsCrossed className="h-12 w-12 opacity-50" />
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                        {food.quantity} {food.unit}
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                   <h3 className="font-bold text-lg text-gray-900 mb-1 truncate line-clamp-1">{food.title}</h3>
                   <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{food.description}</p>
                   
                   <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                             <MapPin className="h-3.5 w-3.5 text-green-600 shrink-0" />
                             <span className="truncate">{food.pickupLocation?.address || "Unknown Location"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                             <Calendar className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                             <span>Expires: {food.expiryDate ? new Date(food.expiryDate).toLocaleDateString() : "N/A"}</span>
                        </div>
                   </div>

                  <Button
                    onClick={() => handleRequest(food._id)}
                    disabled={hasRequested(food._id)}
                    className={`w-full font-semibold rounded-xl py-5 shadow-sm transition-all ${
                        hasRequested(food._id) 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100" 
                            : "bg-gray-900 hover:bg-green-600 text-white shadow-md hover:shadow-green-200"
                    }`}
                  >
                    {hasRequested(food._id) ? "Requested" : "Request This"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
};

export default BrowseDonations;
