import { Loader2 } from 'lucide-react';
import { classNames } from '@/utils';

export default function LoadingSpinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <div className={classNames('flex items-center justify-center', className)}>
      <Loader2 className="animate-spin text-primary-600" style={{ width: size, height: size }} />
    </div>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <LoadingSpinner size={36} />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={classNames('animate-pulse rounded-lg bg-gray-200', className)} />;
}

export function ToolCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
