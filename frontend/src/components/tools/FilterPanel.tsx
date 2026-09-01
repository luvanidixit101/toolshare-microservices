import { SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '@/services/mockData';
import type { ToolFilters } from '@/types';
import { classNames, CURRENCY_SYMBOL } from '@/utils';

interface FilterPanelProps {
  filters: ToolFilters;
  onChange: (filters: ToolFilters) => void;
  className?: string;
}

export default function FilterPanel({ filters, onChange, className }: FilterPanelProps) {
  const update = (patch: Partial<ToolFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className={classNames('card p-5 space-y-5', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal size={18} /> Filters
        </h3>
        {(filters.category || filters.location || filters.minPrice || filters.maxPrice || filters.minRating || filters.availableOnly) && (
          <button onClick={() => onChange({ search: filters.search, sort: filters.sort, page: 1, size: filters.size })} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <select value={filters.category || ''} onChange={(e) => update({ category: e.target.value || undefined, page: 1 })} className="input">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="label">Location</label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => update({ location: e.target.value || undefined, page: 1 })}
          placeholder="City or state"
          className="input"
        />
      </div>

      {/* Price range */}
      <div>
        <label className="label">Price Range ({CURRENCY_SYMBOL} per day)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice ?? ''}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            placeholder={`Min ${CURRENCY_SYMBOL}`}
            className="input"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            value={filters.maxPrice ?? ''}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            placeholder={`Max ${CURRENCY_SYMBOL}`}
            className="input"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="label">Minimum Rating</label>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => update({ minRating: r || undefined, page: 1 })}
              className={classNames(
                'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                (filters.minRating ?? 0) === r
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              )}
            >
              {r === 0 ? 'Any' : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.availableOnly ?? false}
          onChange={(e) => update({ availableOnly: e.target.checked || undefined, page: 1 })}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700">Available only</span>
      </label>
    </div>
  );
}
