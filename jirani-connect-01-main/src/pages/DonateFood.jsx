import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DonateFood = () => {
  const [formData, setFormData] = useState({
    title: "",
    quantity: "",
    unit: "",
    pickupLocation: "",
    description: "",
  });

  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please log in first");
      return navigate("/auth");
    }

    try {
      await api.post("/foods", formData);

      toast.success("🎉 Food donation added successfully!");
      setFormData({
        title: "",
        quantity: "",
        unit: "",
        pickupLocation: "",
        description: "",
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Donation error:", err);
      toast.error("Error creating donation. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Page Header */}
      <div className="bg-green-600 text-white py-10 shadow-md">
        <h1 className="text-4xl font-bold text-center">Donate Food</h1>
        <p className="text-center text-green-100 mt-2">
          Share your surplus food and help reduce hunger
        </p>
      </div>

      {/* Form Section */}
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">

          {/* Back to Dashboard Button */}
          <div className="mb-6 text-left">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              ← Back to Dashboard
            </Button>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8 border border-green-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 text-center">
              Food Donation Form
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Food Title
                </label>
                <Input
                  name="title"
                  placeholder="e.g., Cooked Rice"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">
                    Quantity
                  </label>
                  <Input
                    name="quantity"
                    placeholder="e.g., 5"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">
                    Unit
                  </label>
                  <Input
                    name="unit"
                    placeholder="e.g., plates, kg"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Pickup Location
                </label>
                <Input
                  name="pickupLocation"
                  placeholder="e.g., Nairobi CBD"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Description (Optional)
                </label>
                <Textarea
                  name="description"
                  placeholder="Describe the food or packaging..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
              >
                Submit Donation
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DonateFood;
