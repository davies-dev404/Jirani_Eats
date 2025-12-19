import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PackageOpen, ClipboardList, SearchX } from "lucide-react";

const icons = {
  food: PackageOpen,
  job: ClipboardList,
  search: SearchX
};

const EmptyState = ({ 
    type = "search", 
    title = "No items found", 
    description = "Try adjusting your filters or check back later.",
    actionLabel,
    actionLink,
    onAction
}) => {
  const Icon = icons[type] || icons.search;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50/50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm ring-1 ring-gray-100 dark:ring-gray-700">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      
      {(actionLabel && (actionLink || onAction)) && (
        <div className="pt-2">
            {actionLink ? (
                <Button asChild>
                    <Link to={actionLink}>{actionLabel}</Link>
                </Button>
            ) : (
                <Button onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
