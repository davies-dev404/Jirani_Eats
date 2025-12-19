import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function FoodCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition">
      <Skeleton className="w-full h-32 rounded-t-xl" />
      <CardHeader className="pb-2 space-y-2">
         <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
      </CardContent>
    </Card>
  );
}

export function JobCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-1/2 mb-2" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
      </CardHeader>
      <CardContent className="mt-4">
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function StatsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
         <Skeleton className="h-4 w-1/3" />
         <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-1/2 mb-1" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
      <Card className="col-span-4">
        <CardHeader>
           <Skeleton className="h-6 w-1/4 mb-2" />
           <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </CardContent>
      </Card>
  )
}
