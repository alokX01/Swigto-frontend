import { useQuery } from '@tanstack/react-query';
import { restaurantsAPI } from '@/api/restaurants';
import { reviewsAPI } from '@/api/reviews';
import { Star } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { T, C, card } from '@/lib/stitch';

export default function RestaurantReviewsPage() {
  const { data: rData } = useQuery({ queryKey: ['myRestaurant'], queryFn: () => restaurantsAPI.getMyRestaurant().catch(err => {
    if (err.response?.status === 404) return { data: null };
    throw err;
  }) });
  const rId = rData?.data?.id;
  const { data: reviewsData } = useQuery({ queryKey: ['reviews', rId], queryFn: () => reviewsAPI.getRestaurantReviews(rId, { page_size: 30 }), enabled: !!rId });
  const reviews = reviewsData?.data?.results || reviewsData?.data || [];

  return (
    <div>
      <h1 style={{ ...T.headlineMd, color: C.onSurface, marginBottom: 24 }}>Customer Reviews</h1>
      {reviews.length === 0 ? (
        <div style={{ ...card, borderRadius: 16, padding: '48px', textAlign: 'center' }}><p style={{ ...T.bodySm, color: C.outline }}>No reviews yet</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ ...card, borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 999, background: '#FFF3ED', display: 'flex', alignItems: 'center', justifyContent: 'center', ...T.labelLg, fontWeight: 700, color: '#F26E21' }}>{r.customer_name?.[0]}</div>
                  <div>
                    <p style={{ ...T.labelLg, fontWeight: 600, color: C.onSurface }}>{r.customer_name}</p>
                    <p style={{ ...T.labelSm, color: C.outline }}>{formatDateTime(r.created_at)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? '#F59E0B' : 'none'} color={i < r.rating ? '#F59E0B' : C.surfaceDim} />)}
                </div>
              </div>
              {r.review && <p style={{ ...T.bodySm, color: C.onSurfaceVariant }}>{r.review}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
