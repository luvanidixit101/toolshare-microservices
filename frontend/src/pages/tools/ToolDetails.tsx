import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Heart, Share2, Calendar, Shield, Star, ChevronLeft, ChevronRight,
  ArrowLeft, CheckCircle2, User as UserIcon, Phone,
} from 'lucide-react';
import { getToolById, getReviews, addReview } from '@/services/toolService';
import type { Tool, Review } from '@/types';
import { formatPrice, formatDate, conditionLabels, classNames, getToolImage, SVG_FALLBACK_IMAGE } from '@/utils';
import StarRating from '@/components/common/StarRating';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState, EmptyState } from '@/components/common/EmptyState';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { toast } from '@/components/common/Toast';
import { useAuth } from '@/context/AuthContext';

export default function ToolDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [fav, setFav] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isOwner = !!user && !!tool && user.id === tool.ownerId;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    if (!isAuthenticated) {
      toast('info', 'Please sign in to leave a comment or review.');
      navigate('/auth/login', { state: { from: `/tools/${id}` } });
      return;
    }
    setSubmittingReview(true);
    try {
      const savedReview = await addReview(id, newRating, newComment.trim());
      toast('success', 'Thank you! Your review has been posted.');
      setReviews((prev) => [savedReview, ...prev]);
      setNewComment('');
      setNewRating(5);

      setTool((prev) => {
        if (!prev) return null;
        const newCount = prev.reviewCount + 1;
        const newAvg = Number((((prev.rating * prev.reviewCount) + newRating) / newCount).toFixed(1));
        return { ...prev, rating: newAvg, reviewCount: newCount };
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to post review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([getToolById(id), getReviews(id)])
      .then(([t, r]) => {
        setTool(t);
        setReviews(r);
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e?.message || 'Failed to load tool details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FullPageSpinner label="Loading tool details..." />;
  if (error) return <div className="max-w-3xl mx-auto py-12"><ErrorState message={error} onRetry={() => navigate(0)} /></div>;
  if (!tool) return <div className="max-w-3xl mx-auto py-12"><EmptyState title="Tool not found" message="This tool may have been removed." /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/tools" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to tools
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Gallery + details */}
        <div className="lg:col-span-3">
          {/* Gallery */}
          <div className="card overflow-hidden">
            <div className="relative h-80 sm:h-96 bg-gray-100">
              <img
                src={getToolImage(tool.images, tool.category, activeImage)}
                alt={tool.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const fallback = getToolImage([], tool.category);
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  } else {
                    e.currentTarget.src = SVG_FALLBACK_IMAGE;
                  }
                }}
              />
              {tool.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((i) => (i - 1 + tool.images.length) % tool.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImage((i) => (i + 1) % tool.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => setFav(!fav)} className="w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white">
                  <Heart size={18} className={classNames(fav ? 'text-red-500 fill-red-500' : 'text-gray-600')} />
                </button>
                <button onClick={() => toast('info', 'Link copied to clipboard!')} className="w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white">
                  <Share2 size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
            {tool.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {tool.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={classNames(
                      'w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors',
                      i === activeImage ? 'border-primary-500' : 'border-transparent'
                    )}
                  >
                    <img
                      src={getToolImage(tool.images, tool.category, i)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = getToolImage([], tool.category); }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="mt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge bg-primary-50 text-primary-700 px-3 py-1">{tool.category}</span>
              <span className="badge bg-gray-100 text-gray-600 px-3 py-1">{conditionLabels[tool.condition]}</span>
              <span className={classNames('badge px-3 py-1', tool.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
                {tool.available ? 'Available' : 'Currently Rented'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">{tool.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={15} /> {tool.location}</span>
              <span className="flex items-center gap-1"><StarRating value={tool.rating} size={14} showValue /> ({tool.reviewCount} reviews)</span>
              <span>{tool.views} views</span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 card p-5">
            <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">{tool.description}</p>
          </div>

          {/* Specifications */}
          <div className="mt-4 card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Specifications</h2>
            {Object.keys(tool.specifications).length > 0 ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {Object.entries(tool.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-gray-100 pb-2">
                    <dt className="text-sm text-gray-500">{key}</dt>
                    <dd className="text-sm font-medium text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-gray-400">No specifications provided.</p>
            )}
          </div>

          {/* Reviews & Comment Section */}
          <div className="mt-4 card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Reviews & Comments ({reviews.length})</h2>

            {/* Comment Form */}
            <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200/70">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Leave a Comment & Review</h3>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Your Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= (hoverRating || newRating);
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star size={20} className={active ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                          </button>
                        );
                      })}
                      <span className="text-xs font-semibold text-gray-700 ml-2">{newRating} / 5</span>
                    </div>
                  </div>

                  <div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your review or comment about this tool..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview || !newComment.trim()}
                      className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
                    >
                      {submittingReview ? 'Posting...' : 'Post Comment & Review'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between py-2 text-sm text-gray-600">
                  <span>Sign in to write a comment or review for this tool.</span>
                  <Link to="/auth/login" state={{ from: `/tools/${id}` }} className="btn-secondary text-xs px-3 py-1.5">
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Review List */}
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <img
                      src={review.authorAvatar || `https://i.pravatar.cc/100?u=${review.authorName}`}
                      alt={review.authorName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{review.authorName}</p>
                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>
                      <StarRating value={review.rating} size={13} className="mt-1" />
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 space-y-4">
            {/* Price card */}
            <div className="card p-5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(tool.pricePerDay)}</span>
                <span className="text-gray-500">/day</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Shield size={15} className="text-gray-400" />
                Security deposit: {formatPrice(tool.securityDeposit)}
              </div>
              {isOwner && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <UserIcon size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Your Tool Listing</p>
                    <p className="text-amber-700">You are the owner of this tool. Users cannot book their own tools.</p>
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/auth/login', { state: { from: `/tools/${id}` } });
                      return;
                    }
                    if (isOwner) {
                      toast('error', 'You cannot book your own tool.');
                      return;
                    }
                    setBookingOpen(true);
                  }}
                  disabled={!tool.available || isOwner}
                  className={`w-full py-3 shadow-md rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    isOwner
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                      : !tool.available
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
                  }`}
                >
                  <Calendar size={18} /> {isOwner ? 'You Own This Tool' : tool.available ? 'Rent Now / Proceed to Book' : 'Not Available'}
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-green-500" /> Instant booking & payment protection</div>
                <div className="flex items-center gap-2"><Shield size={15} className="text-green-500" /> Damage protection included</div>
                <div className="flex items-center gap-2"><UserIcon size={15} className="text-green-500" /> Verified owner</div>
              </div>
            </div>

            {/* Tool Owner Card */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Tool Owner</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                  {tool.ownerName[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{tool.ownerName}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    {tool.ownerRating.toFixed(1)} rating
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 w-fit">
                    <Phone size={14} className="text-green-600" />
                    <span>{tool.ownerPhone || '+91 98765 43210'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Website Checkout & Payment Modal */}
      {tool && (
        <CheckoutModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          tool={tool}
        />
      )}
    </div>
  );
}
