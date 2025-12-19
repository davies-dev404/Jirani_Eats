import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Download, CreditCard, Wallet } from "lucide-react";

export default function AdminFinance() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Finance Overview</h1>
           <p className="text-gray-500">View earnings, payouts, and system revenue.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-emerald-600 text-white border-none">
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-emerald-100 text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-emerald-100" />
                 </CardHeader>
                 <CardContent>
                    <div className="text-3xl font-bold">$0.00</div>
                    <p className="text-xs text-emerald-100 mt-1">+0% from last month</p>
                 </CardContent>
            </Card>
             <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-gray-500 text-sm font-medium">Pending Payouts</CardTitle>
                    <Wallet className="h-4 w-4 text-gray-500" />
                 </CardHeader>
                 <CardContent>
                    <div className="text-3xl font-bold">$0.00</div>
                 </CardContent>
            </Card>
             <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-gray-500 text-sm font-medium">Donations Value</CardTitle>
                    <CreditCard className="h-4 w-4 text-gray-500" />
                 </CardHeader>
                 <CardContent>
                    <div className="text-3xl font-bold">$0.00</div>
                 </CardContent>
            </Card>
       </div>

      <Card>
        <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A list of recent financial activities.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="text-center py-12 text-gray-500">
                <p>No transactions found.</p>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
