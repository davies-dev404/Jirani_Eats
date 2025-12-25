import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import api from "../api";

const RequestFood = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [food, setFood] = useState(null);
  const [requesting, setRequesting] = useState(false);

  // Form state
  const [pickupLocation, setPickupLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    const fetchFood = async () => {
      try {
        const res = await api.get(`/foods/${id}`);
        const data = res.data;
        setFood(data);
        // Pre-fill pickup location if available
        if (data.pickupLocation) {
          setPickupLocation(typeof data.pickupLocation === "object" ? data.pickupLocation.address : data.pickupLocation);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load food details");
      }
    };

    fetchFood();
  }, [id, token]);

  const handleRequest = async () => {
    if (!pickupLocation || !phoneNumber || !pickupTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (quantity > food.quantity) {
        toast.error(`Only ${food.quantity} items available`);
        return;
    }

    try {
      setRequesting(true);
      await api.post("/requests", {
          foodId: id,
          pickupLocation: pickupLocation === 'rider' ? 'Rider Delivery' : pickupLocation,
          phoneNumber,
          pickupTime,
          status: "pending",
          deliveryMethod: pickupLocation === 'rider' ? "rider" : "self-pickup",
          quantity: Number(quantity)
      });

      toast.success("Food requested successfully!");
      navigate("/dashboard/receiver/history"); // Redirect to history page
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Error requesting food");
    } finally {
      setRequesting(false);
    }
  };

  if (!food) return <p className="text-center py-8">Loading food details...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <main className="w-full max-w-3xl">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="relative h-64 w-full rounded-xl overflow-hidden mb-6">
              {food.image ? (
                  <img 
                    src={food.image} 
                    alt={food.title} 
                    className="w-full h-full object-cover"
                  />
              ) : (
                  <div className="w-full h-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl">
                      No Image Available
                  </div>
              )}
          </div>

          <h1 className="text-3xl font-bold mb-2">{food.title}</h1>
          <p className="text-gray-600 mb-4">{food.description}</p>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
             <p className="text-lg"><strong>Available Quantity:</strong> {food.quantity} {food.unit}</p>
             <p className="text-sm text-gray-500 mt-1">Don't wait! This item is popular.</p>
          </div>
          
          <p>
            <strong>Pickup Location:</strong>{" "}
            {typeof food.pickupLocation === "object" ? food.pickupLocation.address : food.pickupLocation}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-medium mb-1">Quantity Requested</label>
                 <input
                   type="number"
                   min="1"
                   max={food.quantity}
                   className="input w-full p-2 border rounded font-mono text-lg"
                   value={quantity}
                   onChange={(e) => setQuantity(Number(e.target.value))}
                 />
                 <p className="text-xs text-gray-500 mt-1">Max: {food.quantity}</p>
              </div>

              <div>
                 <label className="block text-sm font-medium mb-1">Delivery Method</label>
                 <div className="flex gap-2">
                    <Button 
                       variant={pickupLocation === 'rider' ? 'default' : 'outline'} 
                       className="flex-1"
                       onClick={() => setPickupLocation('rider')}
                    >
                       Request Rider
                    </Button>
                    <Button 
                       variant={pickupLocation !== 'rider' ? 'default' : 'outline'}
                       className="flex-1"
                       onClick={() => setPickupLocation('')}
                    >
                       Self Pickup
                    </Button>
                 </div>
              </div>
          </div>

          <div className="space-y-3">
            {pickupLocation !== 'rider' && (
              <div>
                  <label className="block text-sm font-medium mb-1">Confirm Location</label>
                  <input
                    type="text"
                    placeholder="Your Pickup Location"
                    className="input w-full p-2 border rounded"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                  />
              </div>
            )}
            <div>
               <label className="block text-sm font-medium mb-1">Contact Phone</label>
               <input
                 type="text"
                 placeholder="Your Phone Number"
                 className="input w-full p-2 border rounded"
                 value={phoneNumber}
                 onChange={(e) => setPhoneNumber(e.target.value)}
               />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Preferred Pickup Time</label>
               <input
                 type="datetime-local"
                 className="input w-full p-2 border rounded"
                 value={pickupTime}
                 onChange={(e) => setPickupTime(e.target.value)}
               />
            </div>
          </div>

          <Button onClick={handleRequest} disabled={requesting || food.quantity < 1} className="mt-4 w-full text-lg h-12">
            {requesting ? "Requesting..." : food.quantity < 1 ? "Out of Stock" : "Confirm Request"}
          </Button>

          <Button onClick={() => navigate("/dashboard/browse-donations")} variant="outline" className="mt-2 w-full">
            Back to Donations
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RequestFood;
