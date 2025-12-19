import { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "sonner";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
    DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, Trash2, Users, CheckCircle, Activity } from "lucide-react";

const StatsCard = ({ title, value, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const EditUserDialog = ({ isOpen, onOpenChange, user, setUser, onSubmit }) => {
    if (!user) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User Details</DialogTitle>
                    <DialogDescription>Make changes to the user profile here.</DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={user.phone || ''} onChange={(e) => setUser({...user, phone: e.target.value})} placeholder="+254..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={user.role} onValueChange={(val) => setUser({...user, role: val})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="donor">Donor</SelectItem>
                                    <SelectItem value="receiver">Receiver</SelectItem>
                                    <SelectItem value="rider">Rider</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

import { useSocket } from "@/context/SocketContext";

const AssignRiderDialog = ({ isOpen, onOpenChange, riders, onAssign }) => {
    const [selectedRider, setSelectedRider] = useState("");

    const handleAssign = () => {
        if (selectedRider) onAssign(selectedRider);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Rider</DialogTitle>
                    <DialogDescription>Select a verified rider for this request.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Rider</Label>
                        <Select value={selectedRider} onValueChange={setSelectedRider}>
                            <SelectTrigger><SelectValue placeholder="Select a rider" /></SelectTrigger>
                            <SelectContent>
                                {riders.map(rider => (
                                    <SelectItem key={rider._id} value={rider._id}>
                                        {rider.name} ({rider.vehicleDetails?.type || 'No vehicle'})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" disabled={!selectedRider} onClick={handleAssign}>Assign</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const AdminDashboard = () => {
  const { socket } = useSocket();
  const [users, setUsers] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingFoods, setPendingFoods] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, pendingApprovals: 0, activeDeliveries: 0 });
  const [editingUser, setEditingUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  /* State for Requests */
  const [requests, setRequests] = useState([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchData = async () => {
    try {
        // setIsLoading(true); // Don't show loading spinner on refresh to avoid flicker
        const [usersRes, statsRes, pendingRes, pendingFoodsRes, requestsRes] = await Promise.all([
            api.get('/admin/users'),
            api.get('/admin/stats'),
            api.get('/admin/pending'),
            api.get('/admin/pending-foods'),
            api.get('/requests') // Admin gets all requests
        ]);
        setUsers(usersRes.data);
        setStats(statsRes.data);
        setPendingItems(pendingRes.data);
        setPendingFoods(pendingFoodsRes.data);
        setRequests(requestsRes.data);
    } catch (err) {
        console.error("Failed to fetch admin data", err);
    } finally {
        setIsLoading(false);
    }
  };
  
  // Helpers
  const riders = users.filter(u => u.role === 'rider' && u.verificationStatus === 'approved' && u.status !== 'suspended');

  const openAssignDialog = (req) => {
      setSelectedRequest(req);
      setIsAssignDialogOpen(true);
  };

  const handleAssignRider = async (riderId) => {
      if (!selectedRequest) return;
      try {
          await api.patch(`/requests/${selectedRequest._id}/assign`, { riderId });
          toast.success("Rider Assigned");
          setIsAssignDialogOpen(false);
          fetchData();
      } catch (err) {
          toast.error("Failed to assign rider");
      }
  };

  const handleApprove = async (id) => {
// ... existing ...
      try {
          await api.patch(`/admin/users/${id}/approve`);
          toast.success("User Approved");
          fetchData(); 
      } catch (err) {
          toast.error("Failed to approve");
      }
  };

  const handleReject = async (id) => {
      try {
          await api.patch(`/admin/users/${id}/reject`);
          toast.success("User Rejected");
          fetchData();
      } catch (err) {
          toast.error("Failed to reject");
      }
  };

  const handleApproveFood = async (id) => {
      try {
          await api.patch(`/admin/foods/${id}/approve`);
          toast.success("Food Approved");
          fetchData();
      } catch (err) {
          toast.error("Failed to approve food");
      }
  };

  const handleRejectFood = async (id) => {
      try {
          await api.patch(`/admin/foods/${id}/reject`);
          toast.success("Food Rejected");
          fetchData();
      } catch (err) {
          toast.error("Failed to reject food");
      }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔌 Real-time Updates
  useEffect(() => {
    if (!socket) return;

    const handleUserUpdate = (data) => {
        toast.info(`Update: User ${data.name || 'Profile'} updated`);
        fetchData();
    };

    const handleNewRegistration = (data) => {
         toast.success("New user registered!");
         fetchData();
    };
    
    const handleAdminFoodPending = (data) => {
        toast.info("New food pending approval");
        setPendingFoods(prev => [data, ...prev]);
        setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals + 1 }));
    };

    // Listen for events
    socket.on("userUpdated", handleUserUpdate);
    socket.on("adminFoodPending", handleAdminFoodPending);
    
    return () => {
        socket.off("userUpdated", handleUserUpdate);
        socket.off("adminFoodPending", handleAdminFoodPending);
    };
  }, [socket]);

  const handleExportUsers = () => {
    if (!users.length) return toast.error("No users to export");

    const headers = ["ID", "Name", "Email", "Role", "Status", "Phone", "Verified"];
    const csvContent = [
        headers.join(","),
        ...users.map(u => [
            u._id,
            `"${u.name}"`,
            u.email,
            u.role,
            u.status,
            u.phone || "N/A",
            u.verificationStatus
        ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `users_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Report downloaded!");
  };

  const handleEditUserSubmit = async (e) => {
      e.preventDefault();
      try {
          await api.put(`/admin/users/${editingUser._id}`, editingUser);
          toast.success("User updated successfully");
          setIsEditDialogOpen(false);
          fetchData();
      } catch (err) {
          console.error(err);
          toast.error("Failed to update user");
      }
  };

  const handleUserAction = async (userId, action) => {
      try {
          if (action === 'delete') {
              if(!confirm("Are you sure you want to delete this user?")) return;
              await api.delete(`/admin/users/${userId}`);
              toast.success("User deleted");
          } else if (action === 'suspend') {
              await api.patch(`/admin/users/${userId}/suspend`);
              toast.success("User suspended");
          } else if (action === 'activate') {
              await api.patch(`/admin/users/${userId}/activate`);
              toast.success("User activated");
          }
          fetchData();
      } catch (err) {
          console.error(err);
          toast.error(`Failed to ${action} user`);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Users" value={stats.totalUsers || 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
            <StatsCard title="Pending Approvals" value={stats.pendingApprovals || 0} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} />
            <StatsCard title="Active Deliveries" value={stats.activeDeliveries || 0} icon={<Activity className="h-4 w-4 text-muted-foreground" />} />
        </div>

      <EditUserDialog 
         isOpen={isEditDialogOpen} 
         onOpenChange={setIsEditDialogOpen}
         user={editingUser}
         setUser={setEditingUser}
         onSubmit={handleEditUserSubmit}
      />

      <AssignRiderDialog 
         isOpen={isAssignDialogOpen}
         onOpenChange={setIsAssignDialogOpen}
         riders={riders}
         onAssign={handleAssignRider}
      />

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            <TabsTrigger value="stats">System Stats</TabsTrigger>
        </TabsList>
        


 
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Registered Users</CardTitle>
                  <CardDescription>View and manage platform users.</CardDescription>
              </div>
              <Button variant="outline" onClick={handleExportUsers}>
                  <Download className="mr-2 h-4 w-4" /> Export Report
              </Button>
            </CardHeader>
            <CardContent>
              {/* Existing User Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                            {user.name}
                            <div className="text-xs text-gray-400 font-normal">{user.email}</div>
                            {user.phone && <div className="text-xs text-blue-500">{user.phone}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary">{user.role}</Badge>
                        </td>
                        <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                                 user.status === 'suspended' ? 'text-red-600 bg-red-50' : 
                                 'text-green-600 bg-green-50'
                             }`}>
                                 {user.status || 'Active'}
                             </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setEditingUser(user); setIsEditDialogOpen(true); }}>
                                <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                          {user.role !== "admin" && (
                            <>
                                {user.status === 'suspended' ? (
                                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleUserAction(user._id, 'activate')}>Activate</Button>
                                ) : (
                                    <Button size="sm" variant="outline" className="text-orange-600" onClick={() => handleUserAction(user._id, 'suspend')}>Suspend</Button>
                                )}
                                
                                <Button variant="ghost" size="sm" onClick={() => handleUserAction(user._id, 'delete')} className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries">
            <Card>
                <CardHeader>
                    <CardTitle>Delivery Requests</CardTitle>
                    <CardDescription>Manage daily food requests and assign riders.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {requests.length === 0 ? <p className="text-muted-foreground text-center py-4">No active requests.</p> : (
                            requests.map(req => (
                                <div key={req._id} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50">
                                    <div>
                                        <div className="font-semibold">{req.food?.title || 'Unknown Food'}</div>
                                        <div className="text-sm text-gray-500">
                                            Requester: {req.requestedBy?.name} | Status: <Badge>{req.status}</Badge>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Pickup: {req.pickupLocation?.address || 'N/A'} at {req.pickupTime ? new Date(req.pickupTime).toLocaleString() : 'N/A'}
                                        </div>
                                        {req.rider && <div className="text-xs text-blue-600 mt-1">Assigned to: {req.rider.name}</div>}
                                    </div>
                                    <div>
                                        {req.status === 'pending' && !req.rider && (
                                            <Button size="sm" onClick={() => openAssignDialog(req)}>Assign Rider</Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                </CardContent>
            </Card>
        </TabsContent>


        <TabsContent value="approvals">
            <Card>
                <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>Review pending rider identifications and other requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.pendingApprovals === 0 && pendingItems.length === 0 && pendingFoods.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">No pending approvals found.</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Pending Users */}
                            {pendingItems.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg text-gray-800">Pending User Verifications</h3>
                                    {pendingItems.map((item) => (
                                        <div key={item._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-gray-50">
                                            <div className="mb-4 md:mb-0">
                                                <div className="font-semibold text-gray-900">{item.name} <span className="text-xs text-gray-500">({item.role})</span></div>
                                                <div className="text-sm text-gray-500">{item.email}</div>
                                                {item.vehicleDetails && (
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        Vehicle: {item.vehicleDetails.type} - {item.vehicleDetails.plateNumber}
                                                    </div>
                                                )}
                                                <div className="flex gap-2 mt-2">
                                                    {item.documents?.map((doc, idx) => {
                                                        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
                                                        const fileUrl = doc.url.startsWith("http") ? doc.url : `${baseUrl}${doc.url}`;
                                                        
                                                        return (
                                                            <a key={idx} href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">
                                                                View {doc.type}
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(item._id)}>Approve</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleReject(item._id)}>Reject</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pending Foods */}
                            {pendingFoods.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg text-gray-800">Pending Food Posts</h3>
                                    {pendingFoods.map((food) => (
                                        <div key={food._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-blue-50/50">
                                            <div className="mb-4 md:mb-0">
                                                <div className="font-semibold text-gray-900">{food.title}</div>
                                                <div className="text-sm text-gray-600">{food.description}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Posted by: {food.postedBy?.name || 'Unknown'} | Quantity: {food.quantity} {food.unit}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Location: {food.pickupLocation?.address}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleApproveFood(food._id)}>Approve Post</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleRejectFood(food._id)}>Reject</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="stats">
             <Card>
                <CardHeader>
                    <CardTitle>System Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">Detailed stats coming soon.</div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
