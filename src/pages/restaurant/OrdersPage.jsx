import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '@/api/orders';
import { formatCurrency, formatDateTime, getStatusInfo } from '@/lib/utils';
import { getApiError, toNumber } from '@/lib/helpers';
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { toast } from 'sonner';
import { CheckCircle, ChefHat, Clock, MapPin, Package, ReceiptText, Store, User, X, XCircle } from 'lucide-react';
import { T, C, card } from '@/lib/stitch';

const STATUS_COLS = [
  { status: 'PLACED', label: 'New Orders', icon: Clock, top: '#3B82F6' },
  { status: 'ACCEPTED', label: 'Accepted', icon: CheckCircle, top: '#06B6D4' },
  { status: 'PREPARING', label: 'Preparing', icon: ChefHat, top: '#F59E0B' },
  { status: 'READY', label: 'Ready', icon: Package, top: '#22C55E' },
];

const NEXT_ACTIONS = {
  PLACED: {
    status: 'ACCEPTED',
    label: 'Accept Order',
    note: 'Order accepted by restaurant',
  },
  ACCEPTED: {
    status: 'PREPARING',
    label: 'Start Preparing',
    note: 'Restaurant started preparing the order',
  },
  PREPARING: {
    status: 'READY',
    label: 'Mark Ready',
    note: 'Order is ready for pickup',
  },
};

const REJECT_ACTION = {
  status: 'CANCELLED',
  label: 'Reject Order',
  note: 'Order rejected by restaurant',
};

const ORDER_CARD_BG = {
  PLACED: '#EFF6FF',
  ACCEPTED: '#ECFEFF',
  PREPARING: '#FFFBEB',
  READY: '#F0FDF4',
};

export default function RestaurantOrdersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { restaurant, isLoading, fetchMyRestaurant } = useRestaurantOwnerStore();
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    fetchMyRestaurant().catch((err) => toast.error(getApiError(err, 'Failed to load restaurant')));
  }, [fetchMyRestaurant]);

  const { data, error: ordersError, isFetching } = useQuery({
    queryKey: ['restaurantOrders', 'list'],
    queryFn: () => ordersAPI.restaurantOrders({ page_size: 50 }),
    enabled: !!restaurant?.id,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (ordersError) toast.error(getApiError(ordersError, 'Failed to load restaurant orders'));
  }, [ordersError]);

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['restaurantOrderDetail', selectedOrderId],
    queryFn: () => ordersAPI.restaurantOrderDetail(selectedOrderId),
    enabled: !!selectedOrderId,
    refetchInterval: selectedOrderId ? 10000 : false,
  });

  const orders = useMemo(() => data?.data?.results || data?.data || [], [data]);
  const activeOrders = orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status));
  const newOrders = orders.filter((order) => order.status === 'PLACED');

  const updateStatus = useMutation({
    mutationFn: ({ id, action }) => ordersAPI.updateStatus(id, { status: action.status, note: action.note }),
    onSuccess: (_, variables) => {
      toast.success(`${getStatusInfo(variables.action.status).label} updated`);
      queryClient.invalidateQueries({ queryKey: ['restaurantOrders'] });
      queryClient.invalidateQueries({ queryKey: ['restaurantOrderDetail', variables.id] });
    },
    onError: (err) => toast.error(getApiError(err, 'Failed to update status')),
  });

  const moveOrder = (order) => {
    const action = NEXT_ACTIONS[order.status];
    if (!action) return;
    updateStatus.mutate({ id: order.id, action });
  };

  const rejectOrder = (order) => {
    if (order.status !== 'PLACED') return;
    if (!window.confirm('Reject this customer order?')) return;
    updateStatus.mutate({ id: order.id, action: REJECT_ACTION });
  };

  if (isLoading && !restaurant) {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 160, borderRadius: 16, background: C.surfaceContainer }} />
        ))}
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ ...card, maxWidth: 720, margin: '48px auto', padding: 32, textAlign: 'center' }}>
        <Store size={44} color={C.saffron} style={{ margin: '0 auto 16px' }} />
        <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>Register Restaurant First</h1>
        <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 24px' }}>Orders will appear here after your restaurant profile is created.</p>
        <button onClick={() => navigate('/restaurant/management')} style={primaryButtonStyle}>
          Register Restaurant
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: '0 0 6px' }}>Live Orders</h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0 }}>
            {restaurant.name}{isFetching ? ' - refreshing' : ''}
          </p>
        </div>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['restaurantOrders'] })} style={{ ...secondaryButtonStyle, width: 'auto' }}>
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
        <StatCard label="Orders Loaded" value={orders.length} />
        <StatCard label="Active Now" value={activeOrders.length} />
        <StatCard label="New Orders" value={newOrders.length} accent={C.saffron} />
        <StatCard label="Recent Value" value={formatCurrency(orders.reduce((sum, order) => sum + toNumber(order.total_amount), 0))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        {STATUS_COLS.map(({ status, label, icon: Icon, top }) => {
          const col = orders.filter((order) => order.status === status);
          return (
            <div key={status} style={{ ...card, borderTop: `4px solid ${top}`, padding: 16, minHeight: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ ...T.labelLg, fontWeight: 800, color: C.onSurface, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <Icon size={16} /> {label}
                </h3>
                <span style={{ ...T.labelMd, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: C.surfaceContainer, color: C.onSurfaceVariant }}>{col.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onView={() => setSelectedOrderId(order.id)}
                    onMove={() => moveOrder(order)}
                    onReject={() => rejectOrder(order)}
                    isBusy={updateStatus.isPending && updateStatus.variables?.id === order.id}
                  />
                ))}
                {col.length === 0 && <p style={{ textAlign: 'center', ...T.labelSm, color: C.outline, padding: '28px 0' }}>No orders</p>}
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrderId && (
        <OrderDetailPanel
          order={detailData?.data}
          loading={detailLoading}
          onClose={() => setSelectedOrderId(null)}
          onMove={moveOrder}
          onReject={rejectOrder}
          isBusy={updateStatus.isPending}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, accent = C.primary }) {
  return (
    <div style={{ ...card, padding: 16 }}>
      <p style={{ ...T.headlineMd, color: accent, margin: 0 }}>{value}</p>
      <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: '4px 0 0', fontWeight: 800, textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

function OrderCard({ order, onView, onMove, onReject, isBusy }) {
  const action = NEXT_ACTIONS[order.status];
  const canReject = order.status === 'PLACED';
  const placedAt = order.placed_at || order.created_at;

  return (
    <div style={{ background: ORDER_CARD_BG[order.status] || C.surfaceContainerLow, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <div>
          <p style={{ ...T.labelMd, fontWeight: 900, color: C.onSurface, margin: 0 }}>#{order.id?.slice(0, 8)}</p>
          <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: '4px 0 0' }}>{placedAt ? formatDateTime(placedAt) : 'Just now'}</p>
        </div>
        <span style={{ ...T.labelSm, fontWeight: 900, color: C.saffron, whiteSpace: 'nowrap' }}>{formatCurrency(order.total_amount)}</span>
      </div>

      <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: '0 0 10px' }}>
        {order.item_count || order.items?.length || 0} items - {order.payment_method || 'Payment'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: action ? (canReject ? '1fr 1fr 1fr' : '1fr 1fr') : '1fr', gap: 8 }}>
        <button type="button" onClick={onView} style={secondaryButtonStyle}>
          <ReceiptText size={15} /> View Items
        </button>
        {canReject && (
          <button type="button" onClick={onReject} disabled={isBusy} style={{ ...dangerButtonStyle, minHeight: 38, padding: '8px 10px', opacity: isBusy ? 0.65 : 1 }}>
            <XCircle size={15} /> Reject
          </button>
        )}
        {action && (
          <button type="button" onClick={onMove} disabled={isBusy} style={{ ...primaryButtonStyle, minHeight: 38, padding: '8px 10px', opacity: isBusy ? 0.65 : 1 }}>
            {isBusy ? 'Updating...' : action.label}
          </button>
        )}
      </div>
    </div>
  );
}

function OrderDetailPanel({ order, loading, onClose, onMove, onReject, isBusy }) {
  const action = order ? NEXT_ACTIONS[order.status] : null;
  const canReject = order?.status === 'PLACED';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(15, 23, 42, 0.42)', display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <aside style={{ width: 'min(520px, 100%)', minHeight: '100vh', background: '#fff', padding: 24, overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }} onClick={(event) => event.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
          <div>
            <h2 style={{ ...T.headlineSm, color: C.onSurface, margin: 0 }}>Order Details</h2>
            {order?.id && <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: '4px 0 0' }}>#{order.id}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close order details" style={{ width: 38, height: 38, border: 'none', borderRadius: 10, background: C.surfaceContainerLow, color: C.onSurfaceVariant, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {[1, 2, 3].map((item) => <div key={item} style={{ height: 90, background: C.surfaceContainerLow, borderRadius: 12 }} />)}
          </div>
        ) : order ? (
          <>
            <section style={detailSectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <span style={{ ...T.labelMd, fontWeight: 900, padding: '5px 10px', borderRadius: 999, background: C.primaryFixed, color: C.primary }}>{getStatusInfo(order.status).label}</span>
                <strong style={{ ...T.titleMd, color: C.saffron }}>{formatCurrency(order.total_amount)}</strong>
              </div>
              <InfoRow icon={User} label={order.customer_name || 'Customer'} />
              <InfoRow icon={Store} label={order.restaurant_name || 'Restaurant'} />
              {order.delivery_address && <InfoRow icon={MapPin} label={order.delivery_address} />}
            </section>

            <section style={detailSectionStyle}>
              <h3 style={detailHeadingStyle}>Dishes</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {(order.items || []).map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.outlineVariant}` }}>
                    <div>
                      <p style={{ ...T.labelLg, fontWeight: 800, color: C.onSurface, margin: 0 }}>{item.item_name || item.menu_item_name || 'Menu item'}</p>
                      <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: '3px 0 0' }}>
                        Qty {item.quantity || 1}{item.variant_name ? ` - ${item.variant_name}` : ''}
                      </p>
                    </div>
                    <strong style={{ ...T.labelMd, color: C.onSurface }}>{formatCurrency(item.subtotal || toNumber(item.price) * Number(item.quantity || 1))}</strong>
                  </div>
                ))}
                {!order.items?.length && <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0 }}>No dish details returned for this order.</p>}
              </div>
            </section>

            {order.status_history?.length > 0 && (
              <section style={detailSectionStyle}>
                <h3 style={detailHeadingStyle}>Status History</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {order.status_history.map((history, index) => (
                    <div key={`${history.status}-${history.changed_at || index}`} style={{ display: 'grid', gap: 2 }}>
                      <p style={{ ...T.labelMd, fontWeight: 900, color: C.onSurface, margin: 0 }}>{getStatusInfo(history.status).label}</p>
                      <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0 }}>
                        {history.changed_by_name || 'System'}{history.changed_at ? ` - ${formatDateTime(history.changed_at)}` : ''}
                      </p>
                      {history.note && <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0 }}>{history.note}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(action || canReject) && (
              <div style={{ display: 'grid', gridTemplateColumns: canReject && action ? '1fr 1fr' : '1fr', gap: 10 }}>
                {canReject && (
                  <button type="button" onClick={() => onReject(order)} disabled={isBusy} style={{ ...dangerButtonStyle, width: '100%', minHeight: 48, opacity: isBusy ? 0.65 : 1 }}>
                    {isBusy ? 'Updating...' : REJECT_ACTION.label}
                  </button>
                )}
                {action && (
                  <button type="button" onClick={() => onMove(order)} disabled={isBusy} style={{ ...primaryButtonStyle, width: '100%', minHeight: 48, opacity: isBusy ? 0.65 : 1 }}>
                    {isBusy ? 'Updating...' : action.label}
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant }}>Order not found.</p>
        )}
      </aside>
    </div>
  );
}

function InfoRow({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: C.onSurfaceVariant, ...T.bodySm, marginTop: 8 }}>
      <Icon size={16} style={{ marginTop: 2, flexShrink: 0 }} />
      <span>{label}</span>
    </div>
  );
}

const primaryButtonStyle = {
  minHeight: 38,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '8px 14px',
  background: C.teal,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  ...T.labelMd,
  fontWeight: 800,
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  minHeight: 38,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  padding: '8px 12px',
  background: '#fff',
  color: C.primary,
  border: `1px solid ${C.outlineVariant}`,
  borderRadius: 10,
  ...T.labelMd,
  fontWeight: 800,
  cursor: 'pointer',
};

const dangerButtonStyle = {
  minHeight: 38,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '8px 14px',
  background: C.error,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  ...T.labelMd,
  fontWeight: 800,
  cursor: 'pointer',
};

const detailSectionStyle = {
  border: `1px solid ${C.outlineVariant}`,
  borderRadius: 14,
  padding: 16,
  marginBottom: 14,
  background: C.surfaceContainerLowest,
};

const detailHeadingStyle = {
  ...T.labelLg,
  fontWeight: 900,
  color: C.onSurface,
  margin: '0 0 12px',
};
