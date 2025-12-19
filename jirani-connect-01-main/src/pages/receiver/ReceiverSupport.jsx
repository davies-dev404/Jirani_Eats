import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ReceiverSupport() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Support ticket created", {
        description: "We've received your message and will get back to you shortly."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Receiver Support</h1>
        <p className="text-gray-500">Get help with your orders or account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>Tell us about your issue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input placeholder="Your name" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input type="email" placeholder="your@email.com" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Subject</label>
                             <Input placeholder="e.g., Missing item, late delivery" required />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Message</label>
                             <Textarea placeholder="Describe what happened..." className="min-h-[100px]" required />
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                            Submit Ticket
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toast.info("Calling Support...")}>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium">Call Us</p>
                            <p className="text-sm text-gray-500">+254 700 123 456</p>
                        </div>
                     </div>
                     <div className="flex items-center p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toast.info("Opening Email Client...")}>
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                            <Mail className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-medium">Email Us</p>
                            <p className="text-sm text-gray-500">help@jiranieats.com</p>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
