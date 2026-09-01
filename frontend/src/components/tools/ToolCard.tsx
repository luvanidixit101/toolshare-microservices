import { Link } from 'react-router-dom';
import { MapPin, Heart, Phone } from 'lucide-react';
import type { Tool } from '@/types';
import { formatPrice, conditionLabels, classNames, getToolImage, SVG_FALLBACK_IMAGE } from '@/utils';
import StarRating from '@/components/common/StarRating';
import { useState } from 'react';

export default function ToolCard({ tool }: { tool: Tool }) {
  const [fav, setFav] = useState(false);
  const imageUrl = getToolImage(tool.images, tool.category);

  return (
    <Link to={`/tools/${tool.id}`} className="group block">
      <div className="card overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={tool.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const fallback = getToolImage([], tool.category);
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              } else {
                e.currentTarget.src = SVG_FALLBACK_IMAGE;
              }
            }}
          />
          <button
            onClick={(e) => { e.preventDefault(); setFav(!fav); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Heart
              size={18}
              className={classNames('transition-colors', fav ? 'text-red-500 fill-red-500' : 'text-gray-500')}
            />
          </button>
          {!tool.available && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="badge bg-white text-gray-700 px-3 py-1">Currently Rented</span>
            </div>
          )}
          <span className="absolute bottom-3 left-3 badge bg-primary-600 text-white px-2.5 py-1">
            {tool.category}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {tool.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs font-medium text-gray-600">{tool.ownerName}</p>
            <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-green-200">
              <Phone size={10} className="text-green-600" /> {tool.ownerPhone || '+91 98765 43210'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <StarRating value={tool.rating} size={14} showValue />
            <span className="text-xs text-gray-400">({tool.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
            <MapPin size={14} />
            <span>{tool.location}</span>
            <span className="mx-1">·</span>
            <span className="text-gray-400">{conditionLabels[tool.condition]}</span>
          </div>
          <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-100">
            <div>
              <span className="text-xl font-bold text-gray-900">{formatPrice(tool.pricePerDay)}</span>
              <span className="text-sm text-gray-400">/day</span>
            </div>
            <span className="text-xs font-medium text-primary-600 group-hover:underline">View Details</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
