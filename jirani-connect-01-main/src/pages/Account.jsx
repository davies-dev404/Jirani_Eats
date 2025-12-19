import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield, Calendar, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import api from "../api";


const Account = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Local editable state
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bio: user?.bio || "",
    // New Fields
    salutation: user?.salutation || "",
    gender: user?.gender || "",
    dob: user?.dob || "",
    citizenship: user?.citizenship || "",
    maritalStatus: user?.maritalStatus || "",
    nextOfKin: user?.nextOfKin || { name: "", relation: "", phone: "" },
    allergies: user?.allergies || [],
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await api.put("/auth/profile", profile);
      const data = res.data;
      updateUser(data);
      setSaved(true);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <h2 className="text-2xl font-semibold mb-4">You’re not logged in.</h2>
        <Button onClick={() => navigate("/auth")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
               <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Profile Settings</h1>
               <p className="text-muted-foreground text-sm">Manage your account information and preferences.</p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-green-500 to-emerald-600 relative">
             <div className="absolute -bottom-10 left-8">
                 <div className="h-24 w-24 rounded-full border-4 border-white bg-white flex items-center justify-center shadow-md">
                      <User className="h-12 w-12 text-gray-400" />
                 </div>
             </div>
          </div>
          
          <CardContent className="pt-14 p-8 space-y-8">
            {/* Read-only Info Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                   <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" /> {user.email}
                   </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role</p>
                   <p className="font-medium text-gray-900 capitalize flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" /> {user.role || "User"}
                   </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Member Since</p>
                   <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" /> {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                   </p>
                </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-2">
                 <h2 className="text-lg font-semibold text-gray-800">Edit Details</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                  <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Salutation</label>
                      <select
                          name="salutation"
                          value={profile.salutation}
                          onChange={handleChange}
                          className="w-full border rounded-md p-2 bg-gray-50/50"
                      >
                          <option value="">Select...</option>
                          {["Mr", "Ms", "Mrs", "Dr", "Prof", "Rev", "Hon"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                    <Input
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="bg-gray-50/50"
                    />
                  </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                  <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
                       <select
                          name="gender"
                          value={profile.gender}
                          onChange={handleChange}
                          className="w-full border rounded-md p-2 bg-gray-50/50"
                      >
                          <option value="">Select...</option>
                           {["Male", "Female", "Other", "Prefer not to say"].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                  </div>
                   <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Date of Birth</label>
                    <Input
                      type="date"
                      name="dob"
                      value={profile.dob ? profile.dob.split('T')[0] : ''}
                      onChange={handleChange}
                      className="bg-gray-50/50"
                    />
                  </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                   <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Citizenship</label>
                    <Input
                      name="citizenship"
                      value={profile.citizenship}
                      onChange={handleChange}
                      placeholder="e.g. Kenyan"
                      className="bg-gray-50/50"
                    />
                  </div>
                   <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Marital Status</label>
                      <select
                          name="maritalStatus"
                          value={profile.maritalStatus}
                          onChange={handleChange}
                          className="w-full border rounded-md p-2 bg-gray-50/50"
                      >
                          <option value="">Select...</option>
                           {["Single", "Married", "Divorced", "Widowed", "Separated"].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                  </div>
              </div>

               <div>
                  <h3 className="font-semibold text-gray-900 mb-3 border-b pb-1 mt-2">Next of Kin</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                      <Input 
                          placeholder="Name" 
                          value={profile.nextOfKin?.name || ""} 
                          onChange={(e) => setProfile({...profile, nextOfKin: { ...profile.nextOfKin, name: e.target.value }})} 
                      />
                       <Input 
                          placeholder="Relation" 
                          value={profile.nextOfKin?.relation || ""}
                           onChange={(e) => setProfile({...profile, nextOfKin: { ...profile.nextOfKin, relation: e.target.value }})} 
                      />
                       <Input 
                          placeholder="Phone" 
                          value={profile.nextOfKin?.phone || ""}
                           onChange={(e) => setProfile({...profile, nextOfKin: { ...profile.nextOfKin, phone: e.target.value }})} 
                      />
                  </div>
              </div>

               <div>
                  <h3 className="font-semibold text-gray-900 mb-3 border-b pb-1 mt-2">Medical & Preferences</h3>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Allergies (Comma separated)</label>
                  <Input
                      name="allergies"
                      value={Array.isArray(profile.allergies) ? profile.allergies.join(", ") : profile.allergies}
                      onChange={(e) => setProfile({ ...profile, allergies: e.target.value.split(",").map(s => s.trim()) })}
                      placeholder="e.g. Peanuts, Gluten, Dairy"
                      className="bg-gray-50/50"
                    />
               </div>
               
               <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                    <Input
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="e.g. +254712345678"
                      className="bg-gray-50/50"
                    />
                  </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
                <Input
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="e.g. Nairobi, Kenya"
                  className="bg-gray-50/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
                <Textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us a little about yourself..."
                  className="bg-gray-50/50 min-h-[100px]"
                />
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

              <div className="flex justify-end pt-4">
                <Button
                  variant="default"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>

              {saved && (
                <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 block"></span>
                  Profile updated successfully
                </p>
              )}
            </div>
          </CardContent>
        </Card>

    </div>
  );
};

export default Account;
