import { Star } from 'lucide-react';
import { classNames } from '@/utils';

interface StarRatingProps {
  value: number;
  size?: number;
  showValue?: boolean;
  count?: number;
  className?: string;
}

export default function StarRating({ value, size = 16, showValue, count, className }: StarRatingProps) {
  return (
    <div className={classNames('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= Math.round(value) ? 'text-accent-400 fill-accent-400' : 'text-gray-300'}
          />
        ))}
      </div>
      {showValue && <span className="text-sm font-medium text-gray-700">{value.toFixed(1)}</span>}
      {count != null && <span className="text-xs text-gray-400">({count})</span>}
    </div>
  );
}
