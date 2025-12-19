import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "../../api";
import { Upload, CheckCircle } from "lucide-react";

export const RiderVerification = ({ user }) => {
    const [vehicle, setVehicle] = useState({
        type: user?.vehicleDetails?.type || "bike",
        plateNumber: user?.vehicleDetails?.plateNumber || "",
        model: user?.vehicleDetails?.model || "",
        color: user?.vehicleDetails?.color || ""
    }); 
    
    // Update local state when user prop populates
    useEffect(() => {
        if (user?.vehicleDetails) {
            setVehicle({
                type: user.vehicleDetails.type || "bike",
                plateNumber: user.vehicleDetails.plateNumber || "",
                model: user.vehicleDetails.model || "",
                color: user.vehicleDetails.color || ""
            });
        }
    }, [user]);

    const [idUrl, setIdUrl] = useState("");
    const [licenseUrl, setLicenseUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleFileUpload = async (e, setUrl) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const toastId = toast.loading("Uploading...");
            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setUrl(res.data); // Assuming backend returns the URL string directly or { url: ... }
            // Wait, uploadRoutes.js does `res.send(...)` which is text/html or text/plain maybe? 
            // Better to check. My uploadRoutes returns `res.send(...)` string.
            // Axios `res.data` will be that string.
            toast.dismiss(toastId);
            toast.success("File uploaded!");
        } catch (err) {
            console.error(err);
            toast.error("Upload failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put("/users/profile", {
                vehicleDetails: vehicle,
                documents: [
                    { type: "id", url: idUrl || "https://fake-url.com/id.jpg" }, // Fallback for demo
                    { type: "license", url: licenseUrl || "https://fake-url.com/license.jpg" }
                ],
                verificationStatus: 'pending'
            });
            toast.success("Verification submitted! Waiting for admin approval.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit verification.");
        } finally {
            setSubmitting(false);
        }
    };

    // Show Pending State
    if (user?.verificationStatus === 'pending') {
        return (
            <Card className="border-yellow-400 bg-yellow-50">
                <CardHeader>
                    <CardTitle className="text-yellow-700 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" /> Verification Pending
                    </CardTitle>
                    <CardDescription className="text-yellow-600">
                        Your documents have been submitted and are awaiting admin approval. You will be notified once approved.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Hide if approved
    if (user?.verificationStatus === 'approved') return null;

    return (
        <Card className={user?.verificationStatus === 'rejected' ? "border-red-500 bg-red-50" : ""}>
            <CardHeader>
                <CardTitle className={user?.verificationStatus === 'rejected' ? "text-red-700" : ""}>
                    {user?.verificationStatus === 'rejected' ? "Verification Rejected ❌" : "Rider Verification"}
                </CardTitle>
                <CardDescription className={user?.verificationStatus === 'rejected' ? "text-red-600" : ""}>
                    {user?.verificationStatus === 'rejected' 
                        ? "Your previous submission was rejected. Please upload valid documents." 
                        : "Upload your credentials and vehicle details to start earning."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Vehicle Type</Label>
                        <Select value={vehicle.type} onValueChange={(val) => setVehicle({...vehicle, type: val})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bike">Bicycle</SelectItem>
                                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                <SelectItem value="car">Car</SelectItem>
                                <SelectItem value="van">Van</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Plate Number</Label>
                            <Input 
                                placeholder="KAA 123A" 
                                value={vehicle.plateNumber}
                                onChange={(e) => setVehicle({...vehicle, plateNumber: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Model / Make</Label>
                            <Input 
                                placeholder="Honda / Toyota" 
                                value={vehicle.model}
                                onChange={(e) => setVehicle({...vehicle, model: e.target.value})}
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>National ID Photo</Label>
                            <Input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(e, setIdUrl)}
                            />
                            {idUrl && <p className="text-xs text-green-600 truncate">Uploaded: {idUrl.split('/').pop()}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Driving License</Label>
                            <Input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(e, setLicenseUrl)}
                            />
                            {licenseUrl && <p className="text-xs text-green-600 truncate">Uploaded: {licenseUrl.split('/').pop()}</p>}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit for Verification"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
