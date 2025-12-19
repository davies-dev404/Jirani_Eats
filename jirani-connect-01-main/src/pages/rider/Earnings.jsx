import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";

export default function Earnings() {
    const transactions = [
        { id: 1, date: "Today, 10:30 AM", desc: "Delivery to Shelter A", amount: "KES 400" },
        { id: 2, date: "Yesterday, 4:15 PM", desc: "Delivery to Kibera Center", amount: "KES 350" },
        { id: 3, date: "12 Dec, 2:00 PM", desc: "Bulk Transport", amount: "KES 1,200" },
    ];

  return (
    <div className="space-y-6" id="earnings-page">
       <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Earnings</h1>
            <p className="text-gray-500">Track your income and payment history.</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
             Withdraw Funds
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white border-none shadow-lg">
             <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                     <div>
                         <p className="text-green-100 text-sm font-medium">Available Balance</p>
                         <h2 className="text-3xl font-bold mt-1">KES 0</h2>
                     </div>
                     <div className="p-2 bg-white/20 rounded-lg">
                         <CreditCard className="h-6 w-6 text-white" />
                     </div>
                 </div>
                 <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="secondary" className="text-green-800 w-full" disabled>Cash Out</Button>
                 </div>
             </CardContent>
        </Card>

         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">This Week</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">KES 0</div>
                <p className="text-xs text-muted-foreground">+0% from last week</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Deliveries</CardTitle>
                <div className="p-2 bg-orange-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-orange-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
        </Card>
      </div>

       <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Recent Transactions</h2>
       <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 p-4 bg-gray-50 border-b font-medium text-sm text-gray-500">
                <div className="col-span-2">Description</div>
                <div className="text-right">Amount</div>
            </div>
            <div className="p-8 text-center text-gray-500">
                <p>No transactions yet.</p>
                <p className="text-xs mt-1">Complete your first delivery to see earnings here.</p>
            </div>
       </div>
    </div>
  );
}
