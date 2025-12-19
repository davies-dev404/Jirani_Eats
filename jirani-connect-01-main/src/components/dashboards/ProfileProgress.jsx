import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";

export function ProfileProgress({ user }) {
  if (!user) return null;

  const totalSteps = 4;
  let completedSteps = 0;

  if (user.name) completedSteps++;
  if (user.email) completedSteps++;
  if (user.phone) completedSteps++;
  if (user.address) completedSteps++; // Assuming 'address' is a field we want
  // Optional: check for avatar or bio if they exist

  const progress = (completedSteps / totalSteps) * 100;

  if (progress === 100) return null; // Don't show if complete

  return (
    <Card className="border-l-4 border-l-purple-500 mb-6 bg-purple-50/30">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Complete Your Profile</CardTitle>
            <span className="text-sm font-semibold text-purple-700">{Math.round(progress)}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2 mb-4" />
        
        <div className="space-y-2 mb-4">
             <div className="flex items-center gap-2 text-sm">
                 {user.phone ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-gray-400" />}
                 <span className={user.phone ? "text-gray-500 line-through" : "text-gray-700 font-medium"}>Add Phone Number</span>
             </div>
             <div className="flex items-center gap-2 text-sm">
                 {user.address ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-gray-400" />}
                 <span className={user.address ? "text-gray-500 line-through" : "text-gray-700 font-medium"}>Add Address</span>
             </div>
        </div>

        <Button size="sm" asChild className="w-full sm:w-auto">
            <Link to="/account">Complete Setup</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
