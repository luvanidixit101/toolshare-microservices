import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { CATEGORIES } from '@/services/mockData';
import type { ToolCondition, ToolFormState } from '@/types';
import { classNames, conditionLabels, CURRENCY_SYMBOL } from '@/utils';

interface ToolFormProps {
  initial: ToolFormState;
  onSubmit: (form: ToolFormState) => void;
  onCancel: () => void;
  submitting: boolean;
  submitLabel: string;
}

export default function ToolForm({ initial, onSubmit, onCancel, submitting, submitLabel }: ToolFormProps) {
  const [form, setForm] = useState<ToolFormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof ToolFormState>(key: K, value: ToolFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addSpec = () => setForm((f) => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const updateSpec = (i: number, field: 'key' | 'value', val: string) => {
    setForm((f) => {
      const specs = [...f.specifications];
      specs[i] = { ...specs[i], [field]: val };
      return { ...f, specifications: specs };
    });
  };
  const removeSpec = (i: number) => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImages = async (files: FileList | null) => {
    if (!files) return;
    const selectedFiles = Array.from(files).slice(0, 5);
    for (const file of selectedFiles) {
      try {
        const compressed = await compressImage(file);
        setForm((f) => ({ ...f, images: [...f.images, compressed].slice(0, 5) }));
      } catch {
        // Fallback
      }
    }
  };

  const removeImage = (i: number) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Tool name is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.pricePerDay || form.pricePerDay <= 0) e.pricePerDay = 'Price must be greater than 0';
    if (!form.securityDeposit || form.securityDeposit < 0) e.securityDeposit = 'Security deposit is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Images */}
      <div>
        <label className="label">Tool Images (up to 5)</label>
        <div className="flex flex-wrap gap-3">
          {form.images.map((img, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {form.images.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              <Upload size={20} />
              <span className="text-xs mt-1">Upload</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => handleImages(e.target.files)} className="hidden" />
      </div>

      {/* Name + Category */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Tool Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. DeWalt Cordless Drill"
            className={classNames('input', errors.name && 'border-red-400')}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="label">Category *</label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className={classNames('input', errors.category && 'border-red-400')}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={4}
          placeholder="Describe the tool, its condition, and what it's good for..."
          className={classNames('input resize-none', errors.description && 'border-red-400')}
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>

      {/* Condition + Location */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Condition *</label>
          <select
            value={form.condition}
            onChange={(e) => update('condition', e.target.value as ToolCondition)}
            className="input"
          >
            {Object.entries(conditionLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Location *</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="City, State"
            className={classNames('input', errors.location && 'border-red-400')}
          />
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>
      </div>

      {/* Price + Deposit */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Price per Day ({CURRENCY_SYMBOL}) *</label>
          <input
            type="number"
            value={form.pricePerDay || ''}
            onChange={(e) => update('pricePerDay', Number(e.target.value))}
            placeholder="500"
            min="0"
            className={classNames('input', errors.pricePerDay && 'border-red-400')}
          />
          {errors.pricePerDay && <p className="text-xs text-red-500 mt-1">{errors.pricePerDay}</p>}
        </div>
        <div>
          <label className="label">Security Deposit ({CURRENCY_SYMBOL}) *</label>
          <input
            type="number"
            value={form.securityDeposit || ''}
            onChange={(e) => update('securityDeposit', Number(e.target.value))}
            placeholder="2000"
            min="0"
            className={classNames('input', errors.securityDeposit && 'border-red-400')}
          />
          {errors.securityDeposit && <p className="text-xs text-red-500 mt-1">{errors.securityDeposit}</p>}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => update('available', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Available for rent</span>
        </label>
      </div>

      {/* Specifications */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Specifications</label>
          <button type="button" onClick={addSpec} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add spec</button>
        </div>
        <div className="space-y-2">
          {form.specifications.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={spec.key}
                onChange={(e) => updateSpec(i, 'key', e.target.value)}
                placeholder="Key (e.g. Voltage)"
                className="input flex-1"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => updateSpec(i, 'value', e.target.value)}
                placeholder="Value (e.g. 20V)"
                className="input flex-1"
              />
              <button type="button" onClick={() => removeSpec(i)} className="btn-ghost px-3">
                <X size={16} />
              </button>
            </div>
          ))}
          {form.specifications.length === 0 && (
            <p className="text-sm text-gray-400">No specifications added. Click "Add spec" to include details like voltage, weight, etc.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3">
          {submitting ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary py-3">Cancel</button>
      </div>
    </form>
  );
}
