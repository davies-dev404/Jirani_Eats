import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Utensils } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import api from "../../api";

const DonateFoodForm = ({ onCancel, onSuccess }) => {
  const { token, user } = useContext(AuthContext);
  const { socket } = useSocket();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    quantity: "",
    unit: "portion",
    address: user?.address || "",
    expiryDate: "",
    image: null
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSelectChange = (val) => setForm({ ...form, unit: val });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        // In a real app, upload immediately or setup formData
        setForm({...form, image: file});
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Please log in.");

    setLoading(true);
    try {
      // If image exists, need FormData
      let payload = form;
      // Note: Actual image upload logic to backend /api/foods needs to handle multipart if supported
      // For now assuming JSON or separate upload flow. Adapting to existing AddFood logic (JSON)
      // If user wants image upload for food, we'd need to upgrade foodController too. 
      // Sticking to existing fields for now to ensure stability.
      
      const res = await api.post("/foods", { 
          ...form, 
          pickupLocation: { address: form.address } 
      });
      
      const newFood = res.data;
      toast.success("✅ Food listed successfully!");
      socket?.emit("foodAdded", newFood);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to list food.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
             <div className="flex items-center gap-2 mb-4">
                 <Button variant="ghost" size="sm" onClick={onCancel} className="p-0 hover:bg-transparent text-gray-500 hover:text-gray-900">
                     <ArrowLeft className="h-4 w-4 mr-1" /> Back
                 </Button>
             </div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Utensils className="text-green-600" /> Share Surplus Food
            </CardTitle>
            <CardDescription>
                Fill in the details below to list your donation.
            </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Food Title</Label>
                        <Input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Fresh Mangoes" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Quantity</Label>
                        <div className="flex gap-2">
                            <Input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="0" required className="flex-1" />
                            <Select value={form.unit} onValueChange={handleSelectChange}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="portion">Portion</SelectItem>
                                    <SelectItem value="kg">Kg</SelectItem>
                                    <SelectItem value="plates">Plates</SelectItem>
                                    <SelectItem value="bottles">Bottles</SelectItem>
                                    <SelectItem value="packets">Packets</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the food..." rows={3} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Pickup Address</Label>
                        <Input name="address" value={form.address} onChange={handleChange} placeholder="Waitara area..." required />
                    </div>
                    <div className="space-y-2">
                        <Label>Expiry Date (Optional)</Label>
                        <Input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
                    </div>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 h-11 text-lg">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Listing...</> : "List Donation"}
                </Button>
            </form>
        </CardContent>
    </Card>
  );
};

export default DonateFoodForm;
