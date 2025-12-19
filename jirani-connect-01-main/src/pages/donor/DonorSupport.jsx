import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function DonorSupport() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Support ticket created", {
        description: "We've received your message and will get back to you shortly."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Support Center</h1>
        <p className="text-gray-500">Need help? We're here for you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                    <CardDescription>Send us a message directly.</CardDescription>
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
                             <Input placeholder="How can we help?" required />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Message</label>
                             <Textarea placeholder="Describe your issue..." className="min-h-[100px]" required />
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                            Send Message
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toast.info("Calling Support...")}>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium">Call Support</p>
                            <p className="text-sm text-gray-500">+254 700 000 000</p>
                        </div>
                     </div>
                     <div className="flex items-center p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toast.info("Opening Email Client...")}>
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                            <Mail className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-medium">Email Support</p>
                            <p className="text-sm text-gray-500">support@jiranieats.com</p>
                        </div>
                     </div>
                     <div className="flex items-center p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toast.info("Opening Live Chat...")}>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <MessageSquare className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium">Live Chat</p>
                            <p className="text-sm text-gray-500">Chat with an agent</p>
                        </div>
                     </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-none">
                <CardHeader>
                    <CardTitle className="text-white">FAQs</CardTitle>
                    <CardDescription className="text-slate-400">Common questions from donors.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">How do I track my donation?</h4>
                        <p className="text-xs text-slate-400">Go to the "Pickup Tracking" page to see real-time updates.</p>
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-medium text-sm">What items can I donate?</h4>
                        <p className="text-xs text-slate-400">We accept cooked meals, raw ingredients, and packaged goods.</p>
                    </div>
                    <Button variant="link" className="text-green-400 p-0 h-auto text-xs mt-2">
                        Visit Help Center <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
