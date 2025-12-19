import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "sonner";

export default function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({
    donors: [],
    receivers: [],
    riders: []
  });

  const fetchUsers = async () => {
      try {
          const { data } = await api.get("/users");
          if (Array.isArray(data)) {
              setUsers({
                  donors: data.filter(u => u.role === 'donor'),
                  receivers: data.filter(u => u.role === 'receiver'),
                  riders: data.filter(u => u.role === 'rider')
              });
          }
      } catch (error) {
          console.error("Failed to fetch users", error);
          toast.error("Could not load users.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchUsers();
  }, []);

  const handleVerify = async (userId, newStatus) => {
      try {
          await api.patch(`/users/${userId}/verify`, { status: newStatus });
          toast.success(`User ${newStatus === 'verified' ? 'Verified' : 'Rejected'}!`);
          fetchUsers(); // Refresh list
      } catch (error) {
          console.error("Verify failed", error);
          toast.error("Failed to update status");
      }
  };

const UserTable = ({ data, type }) => (
  <div className="rounded-md border">
    <div className="grid grid-cols-5 bg-gray-50 p-4 font-medium text-sm text-gray-500">
      <div className="col-span-2">Name & Email</div>
      <div>Status</div>
      <div>{type === 'riders' ? 'Deliveries' : type === 'donors' ? 'Donations' : 'Requests'}</div>
      <div className="text-right">Actions</div>
    </div>
    {data.length > 0 ? (
        data.map((user) => (
      <div key={user.id} className="grid grid-cols-5 p-4 items-center border-t text-sm">
        <div className="col-span-2">
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-gray-500 text-xs">{user.email}</div>
        </div>
        <div>
            <Badge variant={user.status === "verified" || user.status === "active" ? "default" : "secondary"} 
                className={
                    user.status === "verified" || user.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" :
                    user.status === "pending" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200" :
                    "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                }
            >
                {user.status || "pending"}
            </Badge>
        </div>
        <div className="font-medium text-gray-700">
            {type === 'riders' ? user.deliveries : type === 'donors' ? user.donations : user.requests}
        </div>
        <div className="flex justify-end gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleVerify(user._id, 'verified')}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Verify User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleVerify(user._id, 'rejected')}>
                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    ))
    ) : (
        <div className="p-8 text-center text-gray-500 text-sm">
            No users found in this category.
        </div>
    )}
  </div>
);

  // Render logic continues below
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h1>
           <p className="text-gray-500">Manage donors, receivers, and riders.</p>
        </div>
        <div className="relative w-full sm:w-64">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
           <Input placeholder="Search users..." className="pl-9 bg-white" />
        </div>
      </div>

      <Tabs defaultValue="donors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="donors">Donors</TabsTrigger>
          <TabsTrigger value="receivers">Receivers</TabsTrigger>
          <TabsTrigger value="riders">Riders</TabsTrigger>
        </TabsList>

        <TabsContent value="donors" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Donors</CardTitle>
                    <CardDescription>Manage food donors and organizations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserTable data={users.donors} type="donors" />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="receivers" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Receivers</CardTitle>
                    <CardDescription>Manage beneficiaries and community centers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserTable data={users.receivers} type="receivers" />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="riders" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Riders</CardTitle>
                    <CardDescription>Manage delivery partners and verification.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserTable data={users.riders} type="riders" />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
