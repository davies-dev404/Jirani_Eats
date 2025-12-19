import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import api from "../api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const FoodList = () => {
  const { token, user } = useContext(AuthContext);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch available foods
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await api.get("/foods");
        const data = res.data;
        setFoods(data);
      } catch (err) {
        console.error("❌ Error fetching food:", err);
        toast.error("Failed to load available foods.");
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // ✅ Check for allergies
  const checkAllergyWarning = (food) => {
      if (!user?.allergies || user.allergies.length === 0) return null;
      
      const foodText = `${food.title} ${food.description || ""}`.toLowerCase();
      const detectedAllergies = user.allergies.filter(allergy => 
          foodText.includes(allergy.toLowerCase())
      );

      if (detectedAllergies.length > 0) {
          return (
              <div className="bg-red-50 text-red-700 text-xs p-2 rounded border border-red-200 mt-2">
                  ⚠️ Caution: Contains <strong>{detectedAllergies.join(", ")}</strong>
              </div>
          );
      }
      return null;
  };

  // ✅ Handle request for food
  const handleRequest = async (foodTitle) => {
    if (!token) {
      toast.error("Please log in first to request food.");
      return;
    }

    try {
      await api.post("/requests", {
          foodType: foodTitle,
          message: "I would like to request this food.",
      });

      toast.success("✅ Food request sent successfully!");
    } catch (err) {
      console.error("Request error:", err);
      toast.error("Error sending request. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* 🌿 Navbar */}
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold text-center text-green-700 mb-6">
          🌱 Browse Food Donations
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Discover available food shared by community members near you. Click
          “Request Food” to reserve what you need.
        </p>

        {/* 🕒 Loading state */}
        {loading ? (
          <p className="text-center text-gray-500 text-lg">
            Loading available food...
          </p>
        ) : foods.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No food available at the moment. Check back later!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {foods.map((food) => (
              <Card
                key={food._id}
                className="shadow-md hover:shadow-xl transition border border-gray-200 rounded-2xl overflow-hidden bg-white"
              >
                {/* Optional Food Image */}
                {food.image && (
                  <img
                    src={food.image}
                    alt={food.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-green-700">
                    {food.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-gray-700 space-y-2">
                  <p className="line-clamp-2 text-sm">
                    {food.description || "No description available."}
                  </p>
                  
                  {/* Allergy Warning */}
                  {checkAllergyWarning(food)}

                  <p className="text-sm">
                    <strong>Quantity:</strong> {food.quantity} {food.unit}
                  </p>
                  <p className="text-sm">
                    <strong>Pickup:</strong>{" "}
                    {food.pickupLocation?.address || "Not specified"}
                  </p>
                  <p className="text-sm">
                    <strong>Expires:</strong>{" "}
                    {food.expiryDate
                      ? new Date(food.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <Button
                    onClick={() => handleRequest(food.title)}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Request Food
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* 🌾 Footer */}
      <Footer />
    </div>
  );
};

export default FoodList;
