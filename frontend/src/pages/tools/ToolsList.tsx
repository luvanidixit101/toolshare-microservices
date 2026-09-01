import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getTools } from '@/services/toolService';
import type { Tool, ToolFilters, PaginatedResult } from '@/types';
import ToolCard from '@/components/tools/ToolCard';
import FilterPanel from '@/components/tools/FilterPanel';
import Pagination from '@/components/common/Pagination';
import { ToolCardSkeleton } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';

export default function ToolsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ToolFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    sort: 'newest',
    page: 1,
    size: 9,
  });
  const [data, setData] = useState<PaginatedResult<Tool> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTools(filters)
      .then(setData)
      .catch((err) => setError(err?.message || 'Failed to load tools'))
      .finally(() => setLoading(false));
  }, [filters]);

  const update = (patch: Partial<ToolFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    const params = new URLSearchParams();
    if (next.search) params.set('search', next.search);
    if (next.category) params.set('category', next.category);
    if (next.location) params.set('location', next.location);
    setSearchParams(params);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_desc', label: 'Top Rated' },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Browse Tools</h1>
        <p className="text-gray-500 mt-1">Find the perfect tool for your next project</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => update({ search: e.target.value, page: 1 })}
            placeholder="Search tools by name or keyword..."
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary lg:hidden"
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <FilterPanel filters={filters} onChange={update} />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <div className="relative w-80 max-w-[85vw] bg-white p-5 overflow-y-auto animate-slide-in ml-auto">
              <div className="flex justify-end mb-2">
                <button onClick={() => setShowFilters(false)} className="text-gray-400"><X size={20} /></button>
              </div>
              <FilterPanel filters={filters} onChange={(f) => { update(f); setShowFilters(false); }} />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${data?.total ?? 0} tool${(data?.total ?? 0) !== 1 ? 's' : ''} found`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:block">Sort by</span>
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as ToolFilters['sort'] })}
                className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={() => setFilters({ ...filters })} />}

          {!error && loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ToolCardSkeleton key={i} />)}
            </div>
          )}

          {!error && !loading && data && data.items.length === 0 && (
            <EmptyState
              title="No tools found"
              message="Try adjusting your filters or search terms to find what you're looking for."
              action={<button onClick={() => update({ search: '', category: '', location: '', minPrice: undefined, maxPrice: undefined, minRating: undefined, availableOnly: undefined, page: 1 })} className="btn-primary">Clear Filters</button>}
            />
          )}

          {!error && !loading && data && data.items.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {data.items.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
              </div>
              <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => update({ page: p })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
