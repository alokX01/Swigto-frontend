import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bike, CheckCircle, Clock, CookingPot, Home, MapPin, PackageCheck, Store } from 'lucide-react';
import { toast } from 'sonner';
import { ordersAPI } from '@/api/orders';
import { formatDateTime } from '@/lib/utils';
import { C, S, badge } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';
import { canCustomerCancel, getOrderMeta, getOrderStep } from '@/lib/orderFlow';

const STEP_META = [
  { status: 'PLACED', label: 'Placed', icon: CheckCircle },
  { status: 'ACCEPTED', label: 'Accepted', icon: Store },
  { status: 'PREPARING', label: 'Preparing', icon: CookingPot },
  { status: 'READY', label: 'Ready', icon: PackageCheck },
  { status: 'PICKED_UP', label: 'On the way', icon: Bike },
  { status: 'DELIVERED', label: 'Delivered', icon: Home },
];

export default function TrackOrderPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.get(id),
    refetchInterval: 5000,
  });

  const order = data?.data;
  const status = order?.status || 'PLACED';
  const meta = getOrderMeta(status);
  const currentStep = getOrderStep(status);

  const cancelMutation = useMutation({
    mutationFn: () => ordersAPI.cancel(id, { status: 'CANCELLED', note: 'Cancelled by customer' }),
    onSuccess: () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => toast.error(getApiError(err, 'Order cannot be cancelled now')),
  });

  if (isLoading) {
    return (
      <div className="track-shell">
        <div className="track-hero skeleton-block" />
        <div className="track-grid">
          <div className="track-map skeleton-block" />
          <div className="track-card skeleton-block" />
        </div>
        <TrackStyles />
      </div>
    );
  }

  return (
    <div className="track-shell">
      <Link to={`/orders/${id}`} className="track-back"><ArrowLeft size={16} /> Order details</Link>

      <section className="track-hero">
        <div>
          <span className="track-kicker"><Clock size={15} /> Updates every 5 seconds</span>
          <h1>{meta.customerTitle}</h1>
          <p>{meta.customerMessage}</p>
        </div>
        {order && <span style={badge(meta.bg, meta.color)}>{meta.label}</span>}
      </section>

      <div className="track-grid">
        <main className="track-main">
          <section className="track-map">
            <div className="map-grid-lines" />
            <div className="route-line" />
            <div className="map-point restaurant"><Store size={18} /></div>
            <div className="map-point rider"><Bike size={20} /></div>
            <div className="map-point home"><Home size={18} /></div>
          </section>

          <section className="track-card">
            <h2>Live Timeline</h2>
            <div className="track-timeline">
              {STEP_META.map((step, index) => {
                const Icon = step.icon;
                const done = status !== 'CANCELLED' && index <= currentStep;
                const stepMeta = getOrderMeta(step.status);
                return (
                  <div key={step.status} className={done ? 'timeline-row done' : 'timeline-row'}>
                    <div><Icon size={18} /></div>
                    <span>{stepMeta.shortLabel}</span>
                    {done && <strong>{index === currentStep ? 'Current' : 'Done'}</strong>}
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="track-side">
          <section className="track-card">
            <h2>Order</h2>
            <p className="track-order-id">#{order?.id?.slice(0, 8)}</p>
            <div className="track-info-row">
              <Store size={17} />
              <span>{order?.restaurant_name || 'Restaurant'}</span>
            </div>
            {order?.placed_at && (
              <div className="track-info-row">
                <Clock size={17} />
                <span>{formatDateTime(order.placed_at)}</span>
              </div>
            )}
            {order?.delivery_address && (
              <div className="track-info-row">
                <MapPin size={17} />
                <span>{order.delivery_address}</span>
              </div>
            )}
          </section>

          <section className="track-card support-card">
            <h2>Need Help?</h2>
            <p>{canCustomerCancel(status) ? 'You can cancel before the restaurant accepts this order.' : 'Use order details to inspect billing and delivery information.'}</p>
            {canCustomerCancel(status) && (
              <button type="button" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <Link to={`/orders/${id}`}>View Details</Link>
          </section>
        </aside>
      </div>

      <TrackStyles />
    </div>
  );
}

function TrackStyles() {
  return (
    <style>{`
      .track-shell {
        width: 100%;
        max-width: 1600px;
        margin: 0 auto;
        padding: 32px ${S.gutter * 1.5}px 110px;
      }

      .track-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        color: ${C.primary};
        text-decoration: none;
        font-family: Inter, sans-serif;
        font-size: 14px;
        font-weight: 800;
      }

      .track-hero,
      .track-map,
      .track-card {
        background: ${C.surfaceContainerLowest};
        border: 1px solid ${C.outlineVariant};
        border-radius: 18px;
        box-shadow: 0 4px 20px rgba(29, 27, 32, 0.05);
      }

      .track-hero {
        display: flex;
        justify-content: space-between;
        gap: 22px;
        padding: 30px;
        margin-bottom: 24px;
        background: ${C.primaryContainer};
      }

      .track-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #e9ddff;
        font-family: Inter, sans-serif;
        font-size: 13px;
        font-weight: 800;
      }

      .track-hero h1 {
        margin: 8px 0 6px;
        color: #fff;
        font-family: Plus Jakarta Sans, sans-serif;
        font-size: 38px;
        font-weight: 800;
      }

      .track-hero p {
        margin: 0;
        color: rgba(255,255,255,0.78);
        font-family: Inter, sans-serif;
      }

      .track-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 380px;
        gap: 28px;
        align-items: start;
      }

      .track-main,
      .track-side {
        display: flex;
        flex-direction: column;
        gap: 22px;
      }

      .track-side {
        position: sticky;
        top: 84px;
      }

      .track-map {
        height: 430px;
        position: relative;
        overflow: hidden;
        background:
          radial-gradient(circle at 20% 20%, rgba(242,110,33,0.16), transparent 28%),
          linear-gradient(135deg, #f8f2fa, #eef7f5);
      }

      .map-grid-lines {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(122,117,130,0.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(122,117,130,0.12) 1px, transparent 1px);
        background-size: 46px 46px;
      }

      .route-line {
        position: absolute;
        left: 18%;
        right: 18%;
        top: 50%;
        height: 6px;
        border-radius: 999px;
        background: ${C.saffron};
        transform: rotate(-16deg);
        box-shadow: 0 8px 28px rgba(242,110,33,0.24);
      }

      .map-point {
        position: absolute;
        width: 54px;
        height: 54px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: #fff;
        color: ${C.primary};
        border: 3px solid ${C.primaryFixed};
        box-shadow: 0 10px 30px rgba(29,27,32,0.14);
      }

      .map-point.restaurant {
        left: 13%;
        top: 57%;
      }

      .map-point.rider {
        left: 48%;
        top: 41%;
        width: 68px;
        height: 68px;
        color: #fff;
        background: ${C.saffron};
        border-color: #fff3ed;
        animation: pulse-soft 2s ease-in-out infinite;
      }

      .map-point.home {
        right: 13%;
        top: 29%;
      }

      .track-card {
        padding: 26px;
      }

      .track-card h2 {
        margin: 0 0 18px;
        color: ${C.onSurface};
        font-family: Plus Jakarta Sans, sans-serif;
        font-size: 24px;
        font-weight: 800;
      }

      .track-timeline {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 12px;
      }

      .timeline-row {
        min-height: 122px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 1px solid ${C.outlineVariant};
        border-radius: 14px;
        color: ${C.outline};
        text-align: center;
        font-family: Inter, sans-serif;
        font-size: 13px;
        font-weight: 800;
      }

      .timeline-row div {
        width: 42px;
        height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: ${C.surfaceContainer};
      }

      .timeline-row.done {
        border-color: ${C.primaryFixed};
        color: ${C.primary};
        background: ${C.surfaceContainer};
      }

      .timeline-row.done div {
        background: ${C.saffron};
        color: #fff;
      }

      .timeline-row strong {
        color: ${C.saffron};
        font-size: 11px;
      }

      .track-order-id {
        margin: -10px 0 18px;
        color: ${C.outline};
        font-family: Inter, sans-serif;
        font-size: 13px;
        font-weight: 800;
      }

      .track-info-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 0;
        border-top: 1px solid ${C.surfaceContainer};
        color: ${C.onSurfaceVariant};
        font-family: Inter, sans-serif;
        font-size: 14px;
        line-height: 1.5;
      }

      .support-card p {
        margin: 0 0 16px;
        color: ${C.onSurfaceVariant};
        font-family: Inter, sans-serif;
        font-size: 14px;
      }

      .support-card a,
      .support-card button {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin-top: 10px;
        border: 0;
        border-radius: 12px;
        background: ${C.saffron};
        color: #fff;
        text-decoration: none;
        font-family: Inter, sans-serif;
        font-weight: 800;
        cursor: pointer;
      }

      .support-card button {
        background: ${C.errorContainer};
        color: ${C.onErrorContainer};
      }

      .support-card button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .skeleton-block {
        min-height: 240px;
        background: linear-gradient(90deg, ${C.surfaceContainer} 25%, ${C.surfaceContainerLow} 50%, ${C.surfaceContainer} 75%);
        background-size: 200% 100%;
        animation: skeleton 1.5s ease-in-out infinite;
      }

      @media (max-width: 1100px) {
        .track-grid {
          grid-template-columns: 1fr;
        }

        .track-side {
          position: static;
        }
      }

      @media (max-width: 760px) {
        .track-shell {
          padding: 24px ${S.gutter}px 100px;
        }

        .track-hero {
          flex-direction: column;
        }

        .track-hero h1 {
          font-size: 30px;
        }

        .track-map {
          height: 320px;
        }

        .track-timeline {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `}</style>
  );
}
