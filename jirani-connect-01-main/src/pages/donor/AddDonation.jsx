import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function AddDonation() {
  const [formData, setFormData] = useState({
    title: "",
    quantity: "",
    unit: "",
    pickupLocation: "",
    description: "",
    category: "",
    expiry: "",
    pickupTime: "",
    image: null,
    imagePreview: null
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = "";

      if (formData.image) {
        const uploadData = new FormData();
        uploadData.append("file", formData.image);
        try {
          const uploadRes = await api.post("/upload", uploadData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          imageUrl = uploadRes.data;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error("Failed to upload image. Please try again.");
          return;
        }
      }

      const foodData = {
        title: formData.title,
        quantity: formData.quantity,
        unit: formData.unit,
        pickupLocation: {
          address: formData.pickupLocation, // Fix: Structure as object matches schema
        },
        description: formData.description,
        category: formData.category, // Note: Schema might need category too if added later, but for now passing it
        expiryDate: formData.expiry,
        imageUrl: imageUrl, 
      };

      await api.post("/foods", foodData);

      toast.success("🎉 Food donation added successfully!");
      navigate("/dashboard/donor/donate");
    } catch (err) {
      console.error("❌ Donation error:", err);
      toast.error(err.response?.data?.message || "Error creating donation. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/donor/donate")}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Donation</h1>
            <p className="text-gray-500">Share your surplus food with those in need.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
             <CardTitle>Donation Details</CardTitle>
             <CardDescription>Provide detailed information to help receivers find your donation.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Food Title</label>
                    <Input
                      name="title"
                      placeholder="e.g., Cooked Rice & Stew"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <select 
                        name="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={handleChange}
                        value={formData.category} 
                        required
                    >
                        <option value="" disabled>Select a category</option>
                        <option value="cooked">Cooked Meals</option>
                        <option value="raw">Raw Ingredients</option>
                        <option value="baked">Baked Goods</option>
                        <option value="canned">Canned/Packaged</option>
                        <option value="dairy">Dairy Products</option>
                        <option value="other">Other</option>
                    </select>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <Input
                    name="quantity"
                    placeholder="e.g., 5"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Unit</label>
                  <select 
                      name="unit"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={handleChange}
                      value={formData.unit} 
                      required
                  >
                      <option value="" disabled>Select a unit</option>
                      <option value="plates">Plates</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="boxes">Boxes</option>
                      <option value="pieces">Pieces</option>
                      <option value="liters">Liters</option>
                      <option value="bags">Bags</option>
                  </select>
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Expiry Date/Time</label>
                    <Input
                      type="datetime-local"
                      name="expiry"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Preferred Pickup Time</label>
                    <Input
                      type="text"
                      name="pickupTime"
                      placeholder="e.g., Before 5 PM"
                      onChange={handleChange}
                    />
                  </div>
              </div>

              <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                  <h3 className="font-medium text-sm">Additional Details</h3>
                  
                  <div className="flex items-center space-x-2">
                      <input type="checkbox" id="perishable" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                      <label htmlFor="perishable" className="text-sm text-gray-700">This item is highly perishable</label>
                  </div>

                   <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Upload Image (Optional)</label>
                    <div 
                        onClick={() => document.getElementById('imageInput').click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer relative"
                    >
                        {formData.imagePreview ? (
                            <div className="relative">
                                <img 
                                    src={formData.imagePreview} 
                                    alt="Preview" 
                                    className="mx-auto h-48 object-cover rounded-md" 
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFormData({ ...formData, image: null, imagePreview: null });
                                    }}
                                    className="absolute top-[-10px] right-[-10px] bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center text-xs"
                                >
                                    X
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="mx-auto h-12 w-12 text-gray-400">📷</div>
                                <p className="mt-1 text-sm text-gray-500">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                            </>
                        )}
                        <input 
                            type="file" 
                            id="imageInput" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setFormData({
                                        ...formData,
                                        image: file,
                                        imagePreview: URL.createObjectURL(file)
                                    });
                                }
                            }}
                        />
                    </div>
                  </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pickup Location</label>
                <Input
                  name="pickupLocation"
                  placeholder="e.g., 123 Community Road, Nairobi"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  name="description"
                  placeholder="Describe the food quality, packaging, or any special handling instructions..."
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                 <Button type="button" variant="outline" onClick={() => navigate("/dashboard/donor/donate")}>Cancel</Button>
                 <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8">
                    Post Donation
                 </Button>
              </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};
