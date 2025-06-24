import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonText() {
  return (
    <div className="flex items-center space-x-4">
      <div className="space-y-2">
        <Skeleton className="h-2 w-[250px]" />
        <Skeleton className="h-2 w-[200px]" />
      </div>
    </div>
  );
}
