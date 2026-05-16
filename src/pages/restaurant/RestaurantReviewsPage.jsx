import { useEffect, useState } from 'react';
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Star, AlertCircle, ArrowLeft } from 'lucide-react';
import { T, C, S } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';
import { reviewsAPI } from '@/api/reviews';

export default function RestaurantReviewsPage() {
  const navigate = useNavigate();
  const { restaurant } = useRestaurantOwnerStore();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 10;

  useEffect(() => {
    if (restaurant?.id) {
      loadReviews();
    }
  }, [restaurant?.id, page]);

  const loadReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await reviewsAPI.getRestaurantReviews(restaurant.id, {
        page,
        page_size: pageSize,
      });
      setReviews(res.data.results || res.data);
      setTotalCount(res.data.count || res.data.length);
    } catch (err) {
      setError(getApiError(err, 'Failed to load reviews'));
      toast.error(getApiError(err, 'Failed to load reviews'));
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (isLoading && !reviews.length) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: `${S.gutter}px` }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 120, background: C.surfaceContainer, borderRadius: 12, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: `${S.gutter}px` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => navigate('/restaurant/management')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: 'none',
            background: C.surfaceContainer,
            color: C.onSurface,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ ...T.headlineLg, color: C.onSurface, margin: 0 }}>Customer Reviews</h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 0 0' }}>
            Feedback from your customers
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24, marginBottom: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>Average Rating</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ ...T.headlineLg, color: C.primary, fontWeight: 700 }}>{avgRating}</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill={i < Math.round(avgRating) ? C.saffron : C.outlineVariant}
                  color={i < Math.round(avgRating) ? C.saffron : C.outlineVariant}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>Total Reviews</p>
          <p style={{ ...T.headlineLg, color: C.onSurface, fontWeight: 700, margin: '8px 0 0 0' }}>
            {totalCount}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{ textAlign: 'center', padding: 32, marginBottom: 24 }}>
          <AlertCircle size={48} color={C.error} style={{ margin: '0 auto 16px' }} />
          <p style={{ ...T.bodyMd, color: C.onSurfaceVariant }}>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && reviews.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Star size={48} color={C.onSurfaceVariant} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ ...T.headlineMd, color: C.onSurfaceVariant, margin: 0 }}>
            No reviews yet
          </p>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 0 0' }}>
            Reviews will appear here once customers start ordering
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div style={{ display: 'grid', gap: 12 }}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px',
              background: page === 1 ? C.surfaceContainer : C.primary,
              color: page === 1 ? C.onSurfaceVariant : '#fff',
              border: 'none',
              borderRadius: 8,
              ...T.labelSm,
              fontWeight: 600,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ ...T.bodySm, color: C.onSurfaceVariant }}>
              Page {page} of {totalPages}
            </span>
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            style={{
              padding: '8px 16px',
              background: page === totalPages ? C.surfaceContainer : C.primary,
              color: page === totalPages ? C.onSurfaceVariant : '#fff',
              border: 'none',
              borderRadius: 8,
              ...T.labelSm,
              fontWeight: 600,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              opacity: page === totalPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }) {
  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4CAF50';
    if (rating >= 3) return C.saffron;
    return C.error;
  };

  return (
    <div
      style={{
        padding: 16,
        background: C.surface,
        border: `1px solid ${C.outlineVariant}`,
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
        <div>
          <h3 style={{ ...T.titleMd, fontWeight: 700, color: C.onSurface, margin: 0 }}>
            {review.customer_name}
          </h3>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '4px 0 0 0' }}>
            {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              ...T.labelMd,
              fontWeight: 700,
              color: getRatingColor(review.rating),
              background: getRatingColor(review.rating) + '15',
              padding: '4px 12px',
              borderRadius: 8,
            }}
          >
            {review.rating}
          </span>
          <div style={{ display: 'flex', gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < review.rating ? C.saffron : C.outlineVariant}
                color={i < review.rating ? C.saffron : C.outlineVariant}
              />
            ))}
          </div>
        </div>
      </div>

      {review.review && (
        <p style={{ ...T.bodyMd, color: C.onSurface, margin: 0, lineHeight: 1.6 }}>
          {review.review}
        </p>
      )}
    </div>
  );
}
