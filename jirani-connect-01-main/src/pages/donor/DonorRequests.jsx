import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "../../api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, MapPin, Calendar, User, Phone } from "lucide-react";
import { format } from "date-fns";

const DonorRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState(null);
    const { socket } = useSocket();

    const fetchRequests = async () => {
        try {
            const { data } = await api.get("/requests");
            // Filter for pending requests primarily, but could show others too
            // ideally backend should generic query param for status
            setRequests(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        if (socket) {
            socket.on("requestAdded", fetchRequests); // New request comes in
            socket.on("requestUpdated", fetchRequests); // Status changes
            return () => {
                socket.off("requestAdded", fetchRequests);
                socket.off("requestUpdated", fetchRequests);
            };
        }
    }, [socket]);

    const handleAction = async (id, status) => {
        try {
            setActioning(id);
            await api.patch(`/requests/${id}`, { status });
            toast.success(`Request ${status} successfully`);
            
            // Optimistic update
            setRequests(prev => prev.map(req => 
                req._id === id ? { ...req, status } : req
            ));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update request");
        } finally {
            setActioning(null);
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'requested');
    const pastRequests = requests.filter(r => r.status !== 'requested');

    return (
        <div className="space-y-8 animate-in fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Incoming Requests</h1>
                <p className="text-gray-500">Review and approve requests from people who need your food.</p>
            </div>

            {loading ? (
                 <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-green-600" /></div>
            ) : (
                <>
                {/* PENDING SECTION */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        Pending Approval <Badge variant="secondary">{pendingRequests.length}</Badge>
                    </h2>
                    
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500">No pending requests at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingRequests.map(req => (
                                <Card key={req._id} className="border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-all">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">Requested</Badge>
                                            <span className="text-xs text-gray-400">{format(new Date(req.createdAt), 'MMM d, h:mm a')}</span>
                                        </div>
                                        <CardTitle className="text-lg">{req.food?.title}</CardTitle>
                                        <CardDescription className="line-clamp-1">{req.food?.description || "No description"}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">{req.requestedBy?.name || "Unknown User"}</span>
                                            </div>
                                            {req.message && (
                                                <div className="bg-gray-50 p-2 rounded text-xs italic">
                                                    "{req.message}"
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">Quantity:</span>
                                                <span>{req.quantity} items</span>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">Method:</span>
                                                <span className="capitalize">{req.deliveryMethod}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <Button 
                                                variant="outline" 
                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => handleAction(req._id, 'rejected')}
                                                disabled={actioning === req._id}
                                            >
                                                <X className="mr-2 h-4 w-4" /> Reject
                                            </Button>
                                            <Button 
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleAction(req._id, 'approved')}
                                                disabled={actioning === req._id}
                                            >
                                                {actioning === req._id ? <Loader2 className="animate-spin h-4 w-4" /> : <><Check className="mr-2 h-4 w-4" /> Approve</>}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* PAST SECTION */}
                 <div className="pt-8 border-t">
                    <h2 className="text-xl font-semibold mb-4 text-gray-500">History</h2>
                    {pastRequests.length > 0 ? (
                        <div className="space-y-2">
                             {pastRequests.map(req => (
                                 <div key={req._id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50">
                                     <div>
                                         <p className="font-medium text-gray-900">{req.food?.title}</p>
                                         <p className="text-sm text-gray-500">Requested by {req.requestedBy?.name} • {format(new Date(req.createdAt), 'PPP')}</p>
                                     </div>
                                     <Badge className={
                                         req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                         req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                         'bg-gray-100 text-gray-700'
                                     }>
                                         {req.status}
                                     </Badge>
                                 </div>
                             ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">No history yet.</p>
                    )}
                 </div>
                </>
            )}
        </div>
    );
};

export default DonorRequests;
