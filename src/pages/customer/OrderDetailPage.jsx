import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '@/store/orderStore';
import { toast } from 'sonner';
import { ArrowLeft, Clock, MapPin, Phone, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { T, C, S } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';

const STATUS_FLOW = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'];
const STATUS_LABELS = {
  PLACED: { label: 'Order Placed', icon: '📝' },
  ACCEPTED: { label: 'Accepted', icon: '✅' },
  PREPARING: { label: 'Preparing', icon: '👨‍🍳' },
  READY: { label: 'Ready', icon: '🎉' },
  PICKED_UP: { label: 'Picked Up', icon: '🚴' },
  DELIVERED: { label: 'Delivered', icon: '✨' },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { currentOrder, isLoading, fetchOrder } = useOrderStore();

  useEffect(() => {
    if (id) {
      fetchOrder(id).catch((err) => {
        toast.error(getApiError(err, 'Failed to load order'));
      });
    }
  }, [id, fetchOrder]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: `${S.gutter}px` }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 100, background: C.surfaceContainer, borderRadius: 12, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: `${S.gutter}px`, textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AlertCircle size={48} color={C.error} style={{ margin: '0 auto 24px' }} />
        <h2 style={{ ...T.headlineSmall, color: C.onSurface }}>Order not found</h2>
        <Link to="/orders" style={{ ...T.labelLg, color: C.saffron, textDecoration: 'none', fontWeight: 600, marginTop: 16 }}>
          Back to orders
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(currentOrder.status);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: `${S.gutter}px` }}>
      {/* Back Button */}
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...T.labelLg, color: C.primary, textDecoration: 'none', fontWeight: 600, marginBottom: 24 }}>
        <ArrowLeft size={20} /> Back to Orders
      </Link>

      {/* Order Header */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
          <div>
            <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0 }}>Order #{currentOrder.id?.slice(-6).toUpperCase()}</p>
            <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: '8px 0 0 0' }}>
              {currentOrder.restaurant_name || 'Order'}
            </h1>
          </div>
          <span style={{ ...T.labelMd, padding: '6px 12px', background: '#E0F2F1', color: '#00695C', borderRadius: 20, fontWeight: 700 }}>
            {currentOrder.status}
          </span>
        </div>
        <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0 }}>
          <Clock size={14} style={{ marginRight: 6, display: 'inline' }} />
          Placed on {formatDate(currentOrder.placed_at)}
        </p>
      </div>

      {/* Status Timeline */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: '0 0 24px 0' }}>Order Status</h2>
        <div style={{ position: 'relative' }}>
          {STATUS_FLOW.map((status, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrentStatus = status === currentOrder.status;
            return (
              <div key={status} style={{ display: 'flex', marginBottom: idx < STATUS_FLOW.length - 1 ? 24 : 0 }}>
                {/* Timeline Line */}
                {idx < STATUS_FLOW.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: 40,
                      width: 2,
                      height: 24,
                      background: isCompleted ? C.saffron : C.outlineVariant,
                    }}
                  />
                )}

                {/* Status Dot */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isCompleted ? C.saffron : C.outlineVariant,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginRight: 16,
                  }}
                >
                  {STATUS_LABELS[status].icon}
                </div>

                {/* Status Text */}
                <div>
                  <p style={{ ...T.labelMd, fontWeight: isCurrentStatus ? 700 : 500, color: C.onSurface, margin: 0 }}>
                    {STATUS_LABELS[status].label}
                  </p>
                  {isCurrentStatus && (
                    <p style={{ ...T.bodySm, color: C.saffron, margin: '4px 0 0 0', fontWeight: 600 }}>
                      Current Status
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>Items ({currentOrder.items?.length || 0})</h2>
        {currentOrder.items?.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.outlineVariant}` }}>
            <div>
              <p style={{ ...T.labelMd, fontWeight: 600, color: C.onSurface, margin: 0 }}>
                {item.item_name}
              </p>
              <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '4px 0 0 0' }}>
                Qty: {item.quantity} {item.variant_name && `• ${item.variant_name}`}
              </p>
            </div>
            <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface }}>
              {formatCurrency(item.subtotal || item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Delivery Details */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>Delivery Details</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0 }}>Delivery Address</p>
            <p style={{ ...T.labelMd, fontWeight: 600, color: C.onSurface, margin: '8px 0 0 0' }}>
              <MapPin size={14} style={{ marginRight: 6, display: 'inline' }} />
              {currentOrder.delivery_address || 'Address not available'}
            </p>
          </div>
          {currentOrder.delivery_phone && (
            <div>
              <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0 }}>Contact</p>
              <p style={{ ...T.labelMd, fontWeight: 600, color: C.onSurface, margin: '8px 0 0 0' }}>
                <Phone size={14} style={{ marginRight: 6, display: 'inline' }} />
                {currentOrder.delivery_phone}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24 }}>
        <h2 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>Order Summary</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ ...T.bodySm, color: C.onSurfaceVariant }}>Subtotal</span>
          <span style={{ ...T.bodySm, fontWeight: 600, color: C.onSurface }}>
            {formatCurrency(currentOrder.subtotal || 0)}
          </span>
        </div>
        {currentOrder.delivery_fee > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ ...T.bodySm, color: C.onSurfaceVariant }}>Delivery Fee</span>
            <span style={{ ...T.bodySm, fontWeight: 600, color: C.onSurface }}>
              {formatCurrency(currentOrder.delivery_fee)}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${C.outlineVariant}`, marginBottom: 0 }}>
          <span style={{ ...T.titleMd, fontWeight: 700, color: C.onSurface }}>Total</span>
          <span style={{ ...T.titleMd, fontWeight: 700, color: C.saffron, fontSize: 18 }}>
            {formatCurrency(currentOrder.total_amount)}
          </span>
        </div>
      </div>
    </div>
  );
}
