import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ToolForm from '@/components/tools/ToolForm';
import type { ToolFormState } from '@/types';
import { formStateToToolPayload } from '@/utils';
import { createTool } from '@/services/toolService';
import { toast } from '@/components/common/Toast';

export default function AddTool() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const emptyForm: ToolFormState = {
    name: '',
    category: '',
    description: '',
    condition: 'GOOD',
    pricePerDay: 0,
    securityDeposit: 0,
    location: '',
    available: true,
    specifications: [],
    images: [],
  };

  const handleSubmit = async (form: ToolFormState) => {
    setSubmitting(true);
    try {
      await createTool(formStateToToolPayload(form));
      toast('success', 'Tool listed successfully!');
      navigate('/tools/my-tools');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to create tool listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">List a New Tool</h1>
        <p className="text-gray-500 mt-1">Share your tool with the community and start earning</p>
      </div>
      <div className="card p-6">
        <ToolForm
          initial={emptyForm}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitting={submitting}
          submitLabel="List Tool"
        />
      </div>
    </div>
  );
}
