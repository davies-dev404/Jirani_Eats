import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AdminCommunication() {
  const [selectedGroup, setSelectedGroup] = useState("everyone");

  const handleSend = () => {
    toast.success("Broadcast sent successfully", {
      description: `Message sent to ${selectedGroup} group.`
    });
  };

  const handleCreateAlert = () => {
     toast.info("Create Alert", {
        description: "This feature will open a modal to configure system alerts."
     });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Communication Center</h1>
           <p className="text-gray-500">Manage announcements and support tickets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Send Announcement</CardTitle>
                        <CardDescription>Broadcast a message to all users or specific groups.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-sm font-medium">Recipient Group</label>
                            <div className="flex gap-2">
                                {["everyone", "riders", "donors", "receivers"].map((group) => (
                                    <Button
                                        key={group}
                                        variant={selectedGroup === group ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedGroup(group)}
                                        className="capitalize"
                                    >
                                        {group}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <Input placeholder="e.g., System Maintenance" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <Textarea placeholder="Type your announcement here..." className="min-h-[120px]" />
                        </div>
                        <div className="flex justify-end">
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSend}>
                                <Send className="mr-2 h-4 w-4" /> Send Broadcast
                            </Button>
                        </div>
                    </CardContent>
                </Card>
           </div>
           
           <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Alerts</CardTitle>
                        <CardDescription>Active banner messages.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-gray-500 text-sm">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No active alerts.</p>
                        </div>
                        <Button 
                            variant="outline" 
                            className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={handleCreateAlert}
                        >
                            Create Alert
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                         <CardTitle className="text-sm font-medium">Recent Broadcasts</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="text-sm text-gray-500 text-center py-4">
                            No recent history.
                         </div>
                    </CardContent>
                </Card>
           </div>
      </div>
    </div>
  );
}
