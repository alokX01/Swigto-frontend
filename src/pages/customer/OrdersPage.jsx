import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle, ArrowRight, Package, PackageCheck } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { formatCurrency, formatDateTime, resolveMediaUrl } from '@/lib/utils';
import { T, C, S } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';
import { canCustomerCancel, getOrderMeta, isActiveOrder, shortOrderId } from '@/lib/orderFlow';

const FILTERS = [
  { value: 'ALL', label: 'All Orders' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState('ALL');
  const [page] = useState(1);
  const [busyOrderId, setBusyOrderId] = useState(null);
  const { orders, isLoading, error, fetchOrders, cancelOrder } = useOrderStore();

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      try {
        if (active) await fetchOrders({ page, page_size: 20 });
      } catch (err) {
        toast.error(getApiError(err, 'Failed to load orders'));
      }
    };
    loadOrders();
    const interval = window.setInterval(loadOrders, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [page, fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (filter === 'ACTIVE') return orders.filter((order) => isActiveOrder(order.status));
    if (filter === 'DELIVERED') return orders.filter((order) => order.status === 'DELIVERED');
    if (filter === 'CANCELLED') return orders.filter((order) => order.status === 'CANCELLED');
    return orders;
  }, [filter, orders]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    setBusyOrderId(orderId);
    try {
      await cancelOrder(orderId, 'Cancelled by customer');
      await fetchOrders({ page, page_size: 20 });
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(getApiError(err, 'Order cannot be cancelled now'));
    } finally {
      setBusyOrderId(null);
    }
  };

  if (isLoading && !orders.length) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S.gutter}px` }}>
        <div style={{ height: 32, width: 200, background: C.surfaceContainer, borderRadius: 4, marginBottom: 24 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 140, background: C.surfaceContainer, borderRadius: 12, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S.gutter}px`, textAlign: 'center' }}>
        <AlertCircle size={48} color={C.error} style={{ margin: '24px auto' }} />
        <p style={{ ...T.bodyMd, color: C.onSurfaceVariant }}>{getApiError(error, 'Failed to load orders')}</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S.gutter}px`, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={64} color={C.saffron} style={{ marginBottom: 24 }} />
        <h1 style={{ ...T.headlineMd, color: C.onSurface, marginBottom: 8 }}>No orders yet</h1>
        <p style={{ ...T.bodySm, color: C.onSurfaceVariant, marginBottom: 24 }}>When you place your first order, it will appear here.</p>
        <Link to="/" style={{ ...T.labelLg, background: C.saffron, color: '#fff', padding: '12px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>
          Start Ordering
        </Link>
      </div>
    );
  }

  const activeCount = orders.filter((order) => isActiveOrder(order.status)).length;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S.gutter}px` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ ...T.headlineLg, color: C.onSurface, margin: 0 }}>My Orders</h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 0 0' }}>
            {orders.length} total â€¢ {activeCount} active
          </p>
        </div>
        <Link to="/" style={{ ...T.labelLg, background: C.saffron, color: '#fff', padding: '10px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>
          Order Again
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              ...T.labelMd,
              padding: '8px 16px',
              border: `1px solid ${filter === f.value ? C.primary : C.outline}`,
              background: filter === f.value ? C.primary : 'transparent',
              color: filter === f.value ? '#fff' : C.onSurface,
              borderRadius: 20,
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredOrders.map((order) => {
          const meta = getOrderMeta(order.status);
          const placedAt = order.placed_at || order.created_at;
          const canCancel = canCustomerCancel(order.status);

          return (
            <div
              key={order.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr auto',
                gap: 16,
                padding: 16,
                background: C.surface,
                border: `1px solid ${C.outlineVariant}`,
                borderRadius: 12,
                transition: 'all 0.2s',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  background: C.surfaceContainer,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {order.restaurant_image ? (
                  <img src={resolveMediaUrl(order.restaurant_image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <Package size={24} color={C.saffron} />
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <h3 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: 0 }}>
                    {order.restaurant_name || 'Order'}
                  </h3>
                  <span
                    style={{
                      ...T.labelXs,
                      padding: '4px 12px',
                      borderRadius: 20,
                      background: meta.bg,
                      color: meta.color,
                      fontWeight: 700,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
                <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '0 0 8px 0' }}>
                  Order #{shortOrderId(order.id)} - {placedAt ? formatDateTime(placedAt) : 'Recently placed'}
                </p>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ ...T.labelSm, color: C.onSurfaceVariant }}>
                    {order.item_count || order.items?.length || 0} items
                  </span>
                  <span style={{ ...T.labelSm, color: C.onSurfaceVariant }}>
                    {order.payment_method || 'Payment'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <p style={{ ...T.labelLg, fontWeight: 700, color: C.saffron, margin: 0 }}>
                  {formatCurrency(order.total_amount || 0)}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {isActiveOrder(order.status) && (
                    <Link to={`/orders/${order.id}/track`} style={{ ...orderActionLink, background: C.primary, color: '#fff' }}>
                      <PackageCheck size={15} /> Track
                    </Link>
                  )}
                  <Link to={`/orders/${order.id}`} style={{ ...orderActionLink, background: '#fff', color: C.primary, border: `1px solid ${C.outlineVariant}` }}>
                    Details <ArrowRight size={15} />
                  </Link>
                  {canCancel && (
                    <button type="button" onClick={() => handleCancelOrder(order.id)} disabled={busyOrderId === order.id} style={{ ...cancelButtonStyle, opacity: busyOrderId === order.id ? 0.65 : 1 }}>
                      {busyOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const orderActionLink = {
  minHeight: 34,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '7px 11px',
  borderRadius: 9,
  textDecoration: 'none',
  ...T.labelMd,
  fontWeight: 900,
};

const cancelButtonStyle = {
  minHeight: 34,
  padding: '7px 11px',
  borderRadius: 9,
  border: 'none',
  background: C.errorContainer,
  color: C.onErrorContainer,
  ...T.labelMd,
  fontWeight: 900,
  cursor: 'pointer',
};
