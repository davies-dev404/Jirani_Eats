import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="bg-orange-100 p-4 rounded-full mb-6">
        <Construction className="h-12 w-12 text-orange-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Work in Progress</h2>
      <p className="text-gray-500 max-w-md mb-8">
        This feature is currently being built. We're working hard to bring you the best experience!
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
