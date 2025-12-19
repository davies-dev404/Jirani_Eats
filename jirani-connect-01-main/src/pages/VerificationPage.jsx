import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Upload, CheckCircle, Car, FileText } from "lucide-react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const VerificationPage = () => {
  const { user, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("");
  const [idUrl, setIdUrl] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Stepper steps
  const steps = [
      { id: 1, title: "Vehicle Details", icon: Car },
      { id: 2, title: "Documents", icon: FileText },
      { id: 3, title: "Review", icon: CheckCircle }
  ];

  const handleFileUpload = async (e, setUrl) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUrl(data);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
        const updateData = {
            vehicleDetails: {
                type: vehicleType,
                plateNumber,
                model,
                color: "N/A"
            },
            documents: [
                { type: "id", url: idUrl, status: "pending" },
                { type: "license", url: licenseUrl, status: "pending" }
            ],
            verificationStatus: "pending"
        };
        
        await api.put("/users/profile", updateData); 
        
        toast.success("Details submitted for approval!");
        navigate("/dashboard");
        
    } catch (error) {
        console.error("Verification submit error:", error);
        toast.error("Failed to submit details. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const nextStep = () => {
      if (step === 1 && (!vehicleType || !plateNumber || !model)) {
          toast.error("Please fill in all vehicle details");
          return;
      }
      if (step === 2 && (!idUrl || !licenseUrl)) {
          toast.error("Please upload all required documents");
          return;
      }
      setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  if (user?.verificationStatus === 'approved') {
      return (
          <DashboardLayout>
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                  <div className="bg-green-100 p-6 rounded-full">
                      <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">You are Verified!</h2>
                  <p className="text-gray-500 max-w-md">Your account is active and you can accept delivery jobs.</p>
                  <Button onClick={() => navigate("/dashboard")} className="mt-4">Go to Dashboard</Button>
              </div>
          </DashboardLayout>
      )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in py-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Account Verification</h1>
            <p className="text-gray-500">Complete the steps below to start earning.</p>
        </div>

        {/* Stepper Header */}
        <div className="flex justify-between items-center relative mb-8">
             <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10" />
             {steps.map((s) => (
                 <div key={s.id} className={`flex flex-col items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl transition-colors ${step >= s.id ? 'text-green-600' : 'text-gray-400'}`}>
                     <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${step >= s.id ? 'bg-green-100 border-green-600' : 'bg-white border-gray-300'}`}>
                         <s.icon className="h-5 w-5" />
                     </div>
                     <span className="text-sm font-semibold bg-gray-50 px-2">{s.title}</span>
                 </div>
             ))}
        </div>

        <Card className="border-t-4 border-t-green-500 shadow-lg">
            <CardContent className="p-8">
                {/* Step 1: Vehicle Details */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                            <Car className="h-6 w-6 text-green-600" />
                            <h2 className="text-xl font-bold text-gray-800">Vehicle Information</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Vehicle Type</Label>
                                <Select onValueChange={setVehicleType} value={vehicleType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bike">Bicycle</SelectItem>
                                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                        <SelectItem value="car">Car</SelectItem>
                                        <SelectItem value="van">Van</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Plate Number</Label>
                                <Input placeholder="KAA 123A" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Model / Make</Label>
                                <Input placeholder="e.g. Toyota Vitz, Honda CB" value={model} onChange={e => setModel(e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Documents */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                            <FileText className="h-6 w-6 text-green-600" />
                            <h2 className="text-xl font-bold text-gray-800">Required Documents</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition ${idUrl ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                {idUrl ? <CheckCircle className="h-10 w-10 text-green-600 mb-2" /> : <Upload className="h-10 w-10 text-gray-400 mb-2" />}
                                <span className="text-sm font-medium text-gray-700">National ID (Front)</span>
                                <Input type="file" className="mt-4" onChange={(e) => handleFileUpload(e, setIdUrl)} disabled={uploading} />
                                {idUrl && <p className="text-xs text-green-600 mt-2 font-medium">Uploaded Successfully</p>}
                            </div>

                            <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition ${licenseUrl ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                {licenseUrl ? <CheckCircle className="h-10 w-10 text-green-600 mb-2" /> : <Upload className="h-10 w-10 text-gray-400 mb-2" />}
                                <span className="text-sm font-medium text-gray-700">Driver's License</span>
                                <Input type="file" className="mt-4" onChange={(e) => handleFileUpload(e, setLicenseUrl)} disabled={uploading} />
                                {licenseUrl && <p className="text-xs text-green-600 mt-2 font-medium">Uploaded Successfully</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 text-center">
                        <div className="flex flex-col items-center gap-4 py-6">
                             <div className="bg-blue-100 p-4 rounded-full">
                                 <Info className="h-8 w-8 text-blue-600" />
                             </div>
                             <div>
                                 <h2 className="text-xl font-bold text-gray-900">Review & Submit</h2>
                                 <p className="text-gray-500 max-w-sm mx-auto">Please confirm your details. Once submitted, our team will review your application within 24 hours.</p>
                             </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Vehicle:</span>
                                <span className="font-medium capitalize">{vehicleType} - {model}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Plate:</span>
                                <span className="font-medium uppercase">{plateNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Documents:</span>
                                <span className="font-medium text-green-600">All Uploaded</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                        Back
                    </Button>
                    
                    {step < 3 ? (
                        <Button onClick={nextStep} className="bg-black hover:bg-gray-800 text-white min-w-[120px]">
                            Next Step
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Submit Application
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VerificationPage;
