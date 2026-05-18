import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertCircle,
  ArrowLeft,
  Bike,
  CheckCircle,
  Clock,
  CookingPot,
  Home,
  MapPin,
  PackageCheck,
  Phone,
  Store,
} from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { T, C, S } from '@/lib/stitch';
import { getApiError, toNumber } from '@/lib/helpers';
import { canCustomerCancel, getOrderMeta, getOrderStep, ORDER_FLOW, shortOrderId } from '@/lib/orderFlow';

const STATUS_ICONS = {
  PLACED: CheckCircle,
  ACCEPTED: Store,
  PREPARING: CookingPot,
  READY: PackageCheck,
  PICKED_UP: Bike,
  DELIVERED: Home,
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { currentOrder, isLoading, fetchOrder, cancelOrder } = useOrderStore();
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return undefined;

    let active = true;
    const loadOrder = () => {
      if (!active) return;
      fetchOrder(id).catch((err) => toast.error(getApiError(err, 'Failed to load order')));
    };

    loadOrder();
    const interval = window.setInterval(loadOrder, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [id, fetchOrder]);

  const isCurrentOrderLoaded = currentOrder?.id === id;

  if (isLoading && !isCurrentOrderLoaded) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: `${S.gutter}px` }}>
        {[1, 2, 3].map((item) => (
          <div key={item} style={{ height: 112, background: C.surfaceContainer, borderRadius: 12, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  if (!isCurrentOrderLoaded) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: `${S.gutter}px`, textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AlertCircle size={48} color={C.error} style={{ margin: '0 auto 24px' }} />
        <h2 style={{ ...T.headlineSm, color: C.onSurface }}>Order not found</h2>
        <Link to="/orders" style={{ ...T.labelLg, color: C.saffron, textDecoration: 'none', fontWeight: 700, marginTop: 16 }}>
          Back to orders
        </Link>
      </div>
    );
  }

  const statusMeta = getOrderMeta(currentOrder.status);
  const currentStatusIndex = getOrderStep(currentOrder.status);
  const canCancel = canCustomerCancel(currentOrder.status);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await cancelOrder(currentOrder.id, 'Cancelled by customer');
      await fetchOrder(currentOrder.id);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(getApiError(err, 'Order cannot be cancelled now'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: `${S.gutter}px` }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...T.labelLg, color: C.primary, textDecoration: 'none', fontWeight: 800, marginBottom: 24 }}>
        <ArrowLeft size={20} /> Back to Orders
      </Link>

      <section style={{ ...sectionStyle, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
          <div>
            <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0 }}>Order #{shortOrderId(currentOrder.id)}</p>
            <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: '8px 0 0' }}>
              {currentOrder.restaurant_name || 'Restaurant order'}
            </h1>
          </div>
          <span style={{ ...statusBadge(statusMeta), whiteSpace: 'nowrap' }}>{statusMeta.label}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} />
            {currentOrder.placed_at ? formatDateTime(currentOrder.placed_at) : 'Recently placed'}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {canCancel && (
              <button type="button" onClick={handleCancel} disabled={cancelling} style={{ ...cancelButtonStyle, opacity: cancelling ? 0.65 : 1 }}>
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            {currentOrder.status !== 'CANCELLED' && currentOrder.status !== 'DELIVERED' && (
              <Link to={`/orders/${currentOrder.id}/track`} style={trackButtonStyle}>
                <PackageCheck size={16} /> Track Live
              </Link>
            )}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Live Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 10 }}>
          {ORDER_FLOW.map((status, index) => {
            const Icon = STATUS_ICONS[status] || CheckCircle;
            const meta = getOrderMeta(status);
            const done = currentOrder.status !== 'CANCELLED' && index <= currentStatusIndex;
            return (
              <div key={status} style={{ minHeight: 112, border: `1px solid ${done ? meta.color : C.outlineVariant}`, borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: done ? meta.bg : C.surfaceContainerLow, color: done ? meta.color : C.outline, textAlign: 'center' }}>
                <Icon size={20} />
                <span style={{ ...T.labelSm, fontWeight: 900 }}>{meta.shortLabel}</span>
                {status === currentOrder.status && <strong style={{ ...T.labelSm, color: C.saffron }}>Current</strong>}
              </div>
            );
          })}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Items ({currentOrder.items?.length || 0})</h2>
        {(currentOrder.items || []).map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '13px 0', borderBottom: `1px solid ${C.outlineVariant}` }}>
            <div>
              <p style={{ ...T.labelLg, fontWeight: 800, color: C.onSurface, margin: 0 }}>
                {item.item_name || item.menu_item_name || 'Menu item'}
              </p>
              <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '4px 0 0' }}>
                Qty: {item.quantity || 1}{item.variant_name ? ` - ${item.variant_name}` : ''}
              </p>
            </div>
            <p style={{ ...T.labelLg, fontWeight: 800, color: C.onSurface, margin: 0 }}>
              {formatCurrency(item.subtotal || toNumber(item.price) * Number(item.quantity || 1))}
            </p>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Delivery Details</h2>
        <InfoRow icon={MapPin} label={currentOrder.delivery_address || 'Address not available'} />
        {currentOrder.delivery_phone && <InfoRow icon={Phone} label={currentOrder.delivery_phone} />}
      </section>

      {currentOrder.status_history?.length > 0 && (
        <section style={sectionStyle}>
          <h2 style={sectionHeading}>Status History</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {currentOrder.status_history.map((item, index) => {
              const meta = getOrderMeta(item.status);
              return (
                <div key={`${item.status}-${item.changed_at || index}`} style={{ display: 'grid', gap: 3, paddingLeft: 12, borderLeft: `3px solid ${meta.color}` }}>
                  <p style={{ ...T.labelMd, fontWeight: 900, color: C.onSurface, margin: 0 }}>{meta.label}</p>
                  <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0 }}>
                    {item.changed_by_name || 'System'}{item.changed_at ? ` - ${formatDateTime(item.changed_at)}` : ''}
                  </p>
                  {item.note && <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0 }}>{item.note}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Order Summary</h2>
        <SummaryLine label="Subtotal" value={formatCurrency(currentOrder.subtotal || 0)} />
        {toNumber(currentOrder.delivery_fee) > 0 && <SummaryLine label="Delivery Fee" value={formatCurrency(currentOrder.delivery_fee)} />}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${C.outlineVariant}`, marginTop: 12 }}>
          <span style={{ ...T.titleMd, fontWeight: 800, color: C.onSurface }}>Total</span>
          <span style={{ ...T.titleMd, fontWeight: 900, color: C.saffron, fontSize: 18 }}>
            {formatCurrency(currentOrder.total_amount)}
          </span>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ icon: Icon, label }) {
  return (
    <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '10px 0 0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <Icon size={15} style={{ marginTop: 1, flexShrink: 0 }} />
      <span>{label}</span>
    </p>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ ...T.bodySm, color: C.onSurfaceVariant }}>{label}</span>
      <span style={{ ...T.bodySm, fontWeight: 700, color: C.onSurface }}>{value}</span>
    </div>
  );
}

const sectionStyle = {
  background: C.surface,
  border: `1px solid ${C.outlineVariant}`,
  borderRadius: 12,
  padding: 24,
  marginBottom: 24,
};

const sectionHeading = {
  ...T.labelLg,
  fontWeight: 900,
  color: C.onSurface,
  margin: '0 0 16px',
};

const statusBadge = (meta) => ({
  ...T.labelMd,
  padding: '6px 12px',
  background: meta.bg,
  color: meta.color,
  borderRadius: 20,
  fontWeight: 900,
});

const trackButtonStyle = {
  minHeight: 40,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  padding: '9px 14px',
  borderRadius: 10,
  background: C.primary,
  color: '#fff',
  textDecoration: 'none',
  ...T.labelMd,
  fontWeight: 900,
};

const cancelButtonStyle = {
  minHeight: 40,
  padding: '9px 14px',
  borderRadius: 10,
  border: 'none',
  background: C.errorContainer,
  color: C.onErrorContainer,
  ...T.labelMd,
  fontWeight: 900,
  cursor: 'pointer',
};
