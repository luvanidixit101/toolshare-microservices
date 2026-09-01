import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import ToolForm from '@/components/tools/ToolForm';
import { getToolById, updateTool, deleteTool } from '@/services/toolService';
import type { Tool, ToolFormState } from '@/types';
import { toolToFormState, formStateToToolPayload } from '@/utils';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import { toast } from '@/components/common/Toast';

export default function EditTool() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getToolById(id)
      .then(setTool)
      .catch((err) => setError(err?.message || 'Failed to load tool'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (form: ToolFormState) => {
    setSubmitting(true);
    try {
      await updateTool(id!, formStateToToolPayload(form));
      toast('success', 'Tool updated successfully!');
      navigate('/tools/my-tools');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to update tool.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTool(id!);
      toast('success', 'Tool deleted.');
      navigate('/tools/my-tools');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to delete tool.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <FullPageSpinner label="Loading tool..." />;
  if (error) return <div className="max-w-3xl mx-auto py-12"><ErrorState message={error} onRetry={() => navigate(0)} /></div>;
  if (!tool) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Tool</h1>
          <p className="text-gray-500 mt-1">Update your tool listing or remove it</p>
        </div>
        <button onClick={() => setDeleteOpen(true)} className="btn-danger">
          <Trash2 size={16} /> Delete
        </button>
      </div>
      <div className="card p-6">
        <ToolForm
          initial={toolToFormState(tool)}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitting={submitting}
          submitLabel="Save Changes"
        />
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Tool?"
        footer={
          <>
            <button onClick={() => setDeleteOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger">
              {deleting ? 'Deleting...' : 'Delete Tool'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold">{tool.name}</span>? This action cannot be undone.
          Any active bookings for this tool will need to be handled separately.
        </p>
      </Modal>
    </div>
  );
}
