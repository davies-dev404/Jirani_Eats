import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MessageSquare, AlertTriangle } from "lucide-react";

export default function RiderSupport() {
  return (
    <div className="space-y-6" id="rider-support-page">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Rider Support</h1>
        <p className="text-gray-500">Get help with deliveries, account issues, or emergencies.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Contact Form */}
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>Send us a message and we'll reply within 24 hours.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input placeholder="e.g., Payment Issue" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Job ID (Optional)</label>
                                <Input placeholder="e.g., DEL-1234" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <Textarea placeholder="Describe your issue..." className="min-h-[120px]" />
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700">Send Message</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do I withdraw my earnings?</AccordionTrigger>
                            <AccordionContent>
                                Go to the Earnings tab and click "Withdraw Funds". Transfers usually take 1-2 business days.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What happens if a recipient isn't at the location?</AccordionTrigger>
                            <AccordionContent>
                                Try calling them through the app. If they don't answer after 5 minutes, use the "Report Issue" button in the active delivery screen.
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-3">
                            <AccordionTrigger>How do I update my vehicle details?</AccordionTrigger>
                            <AccordionContent>
                                You can update your vehicle information in the Settings &gt; Vehicle section.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>

        {/* Quick Actions & Emergency */}
        <div className="space-y-6">
            <Card className="bg-red-50 border-red-100">
                <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Emergency
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-red-600">
                        If you are in danger or have an accident during a delivery, call emergency services immediately, then contact us.
                    </p>
                    <Button variant="destructive" className="w-full">
                        <Phone className="mr-2 h-4 w-4" /> Call SOS (999)
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Direct Lines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium">Rider Hotline</p>
                            <p className="text-xs text-gray-500">+254 700 000 000</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium">Email Support</p>
                            <p className="text-xs text-gray-500">riders@jiranieats.com</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium">Live Chat</p>
                            <p className="text-xs text-gray-500">Available 8am - 10pm</p>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
