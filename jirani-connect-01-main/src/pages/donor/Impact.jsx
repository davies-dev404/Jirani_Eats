import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, TrendingUp, Users, Leaf } from "lucide-react";

export default function Impact() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Impact Report</h1>
        <p className="text-gray-500">See how your contributions are changing lives.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Meals provided</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">People Fed</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
           <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Community members supported</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
             <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
           <CardContent>
            <div className="text-2xl font-bold">0 kg</div>
            <p className="text-xs text-muted-foreground">Environmental impact</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Impact Growth</CardTitle>
          <CardDescription>Your contribution history over time.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
           <div className="h-[200px] flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                No data available yet. Start donating to see your impact footprint!
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
