import { useState, useEffect } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "../api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

export function NotificationDropdown() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNote) => {
        // Optimistically add notification
        setNotifications((prev) => [newNote, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(newNote.title || "New Notification", {
            description: newNote.message
        });
    };

    socket.on("notification", handleNewNotification); // Standardizing event name to 'notification'
    socket.on("newNotification", handleNewNotification); // Keeping backward compatibility

    return () => {
        socket.off("notification", handleNewNotification);
        socket.off("newNotification", handleNewNotification);
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      // Backend returns array directly now
      const data = Array.isArray(res.data) ? res.data : (res.data.notifications || []);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
        await api.patch("/notifications/read-all");
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    } catch (err) {
        console.error(err);
    }
  };

  const markRead = async (id) => {
      try {
          await api.patch(`/notifications/${id}/read`);
          setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
          console.error(err);
      }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-white animate-pulse" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 shadow-xl border-gray-100 rounded-xl">
        <DropdownMenuLabel className="flex justify-between items-center p-4 bg-gray-50 rounded-t-xl">
             <span className="font-bold text-gray-900">Notifications</span>
             <span 
                className="text-xs text-blue-600 font-medium cursor-pointer hover:underline"
                onClick={markAllRead}
             >
                Mark all as read
             </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <ScrollArea className="h-[400px]">
             {loading && notifications.length === 0 ? (
                 <div className="flex justify-center items-center h-20">
                     <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                 </div>
             ) : notifications.length === 0 ? (
                 <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                     <Bell className="h-8 w-8 text-gray-300" />
                     No notifications yet.
                 </div>
             ) : (
                 notifications.map((note) => (
                     <DropdownMenuItem 
                        key={note._id} 
                        className={`cursor-pointer px-4 py-3 border-b border-gray-50 focus:bg-gray-50 ${!note.read ? 'bg-blue-50/50' : ''}`}
                        onClick={() => !note.read && markRead(note._id)}
                     >
                         <div className="flex items-start gap-4 w-full">
                             {note.type === 'success' && <div className="mt-1 bg-green-100 p-1.5 rounded-full"><CheckCircle className="h-4 w-4 text-green-600" /></div>}
                             {(note.type === 'info' || !note.type) && <div className="mt-1 bg-blue-100 p-1.5 rounded-full"><Info className="h-4 w-4 text-blue-600" /></div>}
                             {note.type === 'warning' && <div className="mt-1 bg-orange-100 p-1.5 rounded-full"><AlertTriangle className="h-4 w-4 text-orange-600" /></div>}
                             
                             <div className="flex-1 space-y-1">
                                 <p className={`text-sm leading-snug ${!note.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                    {note.title}
                                 </p>
                                 <p className="text-xs text-gray-500 line-clamp-2">{note.message}</p>
                                 <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                    {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </p>
                             </div>
                             {!note.read && (
                                 <span className="h-2 w-2 rounded-full bg-blue-600 self-center shrink-0" />
                             )}
                         </div>
                     </DropdownMenuItem>
                 ))
             )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
