import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, Eye, Pencil, Trash2, Power, Plus, IndianRupee, Bookmark,
} from 'lucide-react';
import { getMyTools, deleteTool, updateTool } from '@/services/toolService';
import type { Tool } from '@/types';
import { formatPrice, classNames, getToolImage } from '@/utils';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import { toast } from '@/components/common/Toast';

export default function MyTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tool | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyTools()
      .then(setTools)
      .catch((err) => setError(err?.message || 'Failed to load your tools'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const activeListings = tools.filter((t) => t.status === 'ACTIVE').length;
  const totalViews = tools.reduce((sum, t) => sum + t.views, 0);
  const potentialEarnings = tools.filter((t) => t.status === 'ACTIVE').reduce((sum, t) => sum + t.pricePerDay, 0);

  const toggleStatus = async (tool: Tool) => {
    const newStatus = tool.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateTool(tool.id, { status: newStatus, available: newStatus === 'ACTIVE' });
      setTools((prev) => prev.map((t) => t.id === tool.id ? { ...t, status: newStatus, available: newStatus === 'ACTIVE' } : t));
      toast('success', `Tool ${newStatus === 'ACTIVE' ? 'enabled' : 'disabled'}.`);
    } catch {
      toast('error', 'Failed to update tool status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTool(deleteTarget.id);
      setTools((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast('success', 'Tool deleted.');
      setDeleteTarget(null);
    } catch {
      toast('error', 'Failed to delete tool.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <FullPageSpinner label="Loading your tools..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tools</h1>
          <p className="text-gray-500 mt-1">Manage your tool listings</p>
        </div>
        <Link to="/tools/add" className="btn-primary">
          <Plus size={18} /> List New Tool
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tools', value: tools.length, icon: Wrench, color: 'text-primary-600 bg-primary-50' },
          { label: 'Active Listings', value: activeListings, icon: Bookmark, color: 'text-green-600 bg-green-50' },
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-accent-600 bg-accent-50' },
          { label: 'Daily Potential', value: formatPrice(potentialEarnings), icon: IndianRupee, color: 'text-blue-600 bg-blue-50' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={classNames('w-10 h-10 rounded-lg flex items-center justify-center mb-3', stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && tools.length === 0 && (
        <EmptyState
          title="No tools listed yet"
          message="Start earning by listing your first tool on ToolShare."
          icon={<Wrench size={28} />}
          action={<Link to="/tools/add" className="btn-primary"><Plus size={18} /> List Your First Tool</Link>}
        />
      )}

      {!error && tools.length > 0 && (
        <div className="card overflow-hidden">
          {/* Table header (desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Tool</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1 text-center">Views</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
          {tools.map((tool) => (
            <div key={tool.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50/50 transition-colors">
              {/* Tool info */}
              <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                <img
                  src={getToolImage(tool.images, tool.category)}
                  alt={tool.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                  onError={(e) => { e.currentTarget.src = getToolImage([], tool.category); }}
                />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{tool.name}</p>
                  <p className="text-sm text-gray-500">{tool.category}</p>
                </div>
              </div>
              {/* Status */}
              <div className="col-span-6 md:col-span-2">
                <span className={classNames('badge', tool.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {tool.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              </div>
              {/* Price */}
              <div className="col-span-6 md:col-span-2">
                <span className="font-semibold text-gray-900">{formatPrice(tool.pricePerDay)}</span>
                <span className="text-sm text-gray-400">/day</span>
              </div>
              {/* Views */}
              <div className="hidden md:flex col-span-1 justify-center items-center text-sm text-gray-500">
                {tool.views}
              </div>
              {/* Actions */}
              <div className="col-span-12 md:col-span-3 flex gap-2 justify-end">
                <Link to={`/tools/${tool.id}`} className="btn-ghost px-2.5" title="View">
                  <Eye size={16} />
                </Link>
                <Link to={`/tools/edit/${tool.id}`} className="btn-ghost px-2.5" title="Edit">
                  <Pencil size={16} />
                </Link>
                <button onClick={() => toggleStatus(tool)} className="btn-ghost px-2.5" title={tool.status === 'ACTIVE' ? 'Disable' : 'Enable'}>
                  <Power size={16} />
                </button>
                <button onClick={() => setDeleteTarget(tool)} className="btn-ghost px-2.5 text-red-500 hover:bg-red-50" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Tool?"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
