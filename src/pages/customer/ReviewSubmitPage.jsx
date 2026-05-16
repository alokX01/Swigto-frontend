import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/store/orderStore';
import { toast } from 'sonner';
import { Star, AlertCircle, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { T, C, S } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';
import { reviewsAPI } from '@/api/reviews';

const reviewSchema = z.object({
  rating: z.coerce.number().min(1, 'Please select a rating').max(5),
  review: z.string().optional(),
});

export default function ReviewSubmitPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentOrder, fetchOrder } = useOrderStore();
  const [reviewStatus, setReviewStatus] = useState({ restaurant_reviewed: false, delivery_reviewed: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('restaurant'); // 'restaurant' or 'delivery'

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      review: '',
    },
  });

  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      Promise.all([
        fetchOrder(orderId),
        reviewsAPI.getReviewStatus(orderId),
      ])
        .then(([, status]) => {
          setReviewStatus(status.data);
        })
        .catch((err) => toast.error(getApiError(err, 'Failed to load order')))
        .finally(() => setIsLoading(false));
    }
  }, [orderId, fetchOrder]);

  const handleSubmitReview = async (data) => {
    try {
      setIsSubmitting(true);
      if (activeTab === 'restaurant') {
        await reviewsAPI.submitRestaurantReview(orderId, data);
        toast.success('Restaurant review submitted');
        setReviewStatus({ ...reviewStatus, restaurant_reviewed: true });
      } else {
        await reviewsAPI.submitDeliveryReview(orderId, data);
        toast.success('Delivery review submitted');
        setReviewStatus({ ...reviewStatus, delivery_reviewed: true });
      }
      form.reset();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to submit review'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: `${S.gutter}px` }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ height: 120, background: C.surfaceContainer, borderRadius: 12, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: `${S.gutter}px`, textAlign: 'center' }}>
        <AlertCircle size={48} color={C.error} style={{ margin: '24px auto' }} />
        <p style={{ ...T.bodyMd, color: C.onSurfaceVariant }}>Order not found</p>
      </div>
    );
  }

  const canSubmitRestaurant = !reviewStatus.restaurant_reviewed && currentOrder.status === 'DELIVERED';
  const canSubmitDelivery = !reviewStatus.delivery_reviewed && currentOrder.status === 'DELIVERED';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: `${S.gutter}px` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
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
          <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>Rate Your Order</h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '4px 0 0 0' }}>
            Help us improve your experience
          </p>
        </div>
      </div>

      {/* Order Info */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>Restaurant</p>
        <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '4px 0 0 0' }}>
          {currentOrder.restaurant?.name || 'Order #' + currentOrder.id}
        </p>
      </div>

      {/* Tabs */}
      {(canSubmitRestaurant || canSubmitDelivery || reviewStatus.restaurant_reviewed || reviewStatus.delivery_reviewed) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => {
              setActiveTab('restaurant');
              form.reset();
            }}
            disabled={!canSubmitRestaurant && reviewStatus.restaurant_reviewed}
            style={{
              padding: '12px',
              background: activeTab === 'restaurant' ? C.saffron : C.surfaceContainer,
              color: activeTab === 'restaurant' ? '#fff' : C.onSurface,
              border: 'none',
              borderRadius: 8,
              ...T.labelMd,
              fontWeight: 600,
              cursor: canSubmitRestaurant || reviewStatus.restaurant_reviewed ? 'pointer' : 'not-allowed',
              opacity: canSubmitRestaurant || reviewStatus.restaurant_reviewed ? 1 : 0.5,
            }}
          >
            {reviewStatus.restaurant_reviewed ? '✓ Restaurant' : 'Restaurant'}
          </button>

          <button
            onClick={() => {
              setActiveTab('delivery');
              form.reset();
            }}
            disabled={!canSubmitDelivery && reviewStatus.delivery_reviewed}
            style={{
              padding: '12px',
              background: activeTab === 'delivery' ? C.saffron : C.surfaceContainer,
              color: activeTab === 'delivery' ? '#fff' : C.onSurface,
              border: 'none',
              borderRadius: 8,
              ...T.labelMd,
              fontWeight: 600,
              cursor: canSubmitDelivery || reviewStatus.delivery_reviewed ? 'pointer' : 'not-allowed',
              opacity: canSubmitDelivery || reviewStatus.delivery_reviewed ? 1 : 0.5,
            }}
          >
            {reviewStatus.delivery_reviewed ? '✓ Delivery' : 'Delivery'}
          </button>
        </div>
      )}

      {/* Review Form */}
      {(activeTab === 'restaurant' ? canSubmitRestaurant : canSubmitDelivery) ? (
        <form onSubmit={form.handleSubmit(handleSubmitReview)} style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 20, display: 'grid', gap: 20 }}>
          <div>
            <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 12, fontWeight: 600 }}>
              How would you rate the {activeTab === 'restaurant' ? 'restaurant' : 'delivery'}? *
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => form.setValue('rating', num)}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 8,
                    border: `2px solid ${form.watch('rating') === num ? C.saffron : C.outline}`,
                    background: form.watch('rating') === num ? C.saffron + '15' : 'transparent',
                    color: C.onSurface,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <Star
                    size={24}
                    fill={form.watch('rating') >= num ? C.saffron : 'none'}
                    color={form.watch('rating') >= num ? C.saffron : C.outline}
                  />
                </button>
              ))}
            </div>
            {form.formState.errors.rating && (
              <small style={{ color: C.error }}>{form.formState.errors.rating.message}</small>
            )}
          </div>

          <div>
            <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Additional Comments (Optional)
            </label>
            <textarea
              {...form.register('review')}
              placeholder="Share your experience..."
              style={{
                width: '100%',
                height: 120,
                padding: '12px',
                background: '#fff',
                border: `1px solid ${C.outline}`,
                borderRadius: 8,
                ...T.bodySm,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 24px',
              background: C.saffron,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              ...T.labelMd,
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: 48, background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12 }}>
          <Star size={48} color={C.saffron} style={{ margin: '0 auto 16px' }} />
          <p style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>
            {reviewStatus[activeTab === 'restaurant' ? 'restaurant_reviewed' : 'delivery_reviewed'] ? 'Review Submitted' : 'Review Closed'}
          </p>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 0 0' }}>
            {reviewStatus[activeTab === 'restaurant' ? 'restaurant_reviewed' : 'delivery_reviewed']
              ? 'Thank you for your feedback!'
              : 'This order is not eligible for review'}
          </p>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(`/orders/${orderId}`)}
        style={{
          width: '100%',
          marginTop: 16,
          padding: '12px',
          background: C.surfaceContainer,
          color: C.onSurface,
          border: 'none',
          borderRadius: 8,
          ...T.labelMd,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Back to Order
      </button>
    </div>
  );
}
