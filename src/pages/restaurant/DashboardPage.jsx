import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '@/api/orders';
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { ShoppingBag, DollarSign, Clock, Star, Power, Store } from 'lucide-react';
import { formatCurrency, getStatusInfo } from '@/lib/utils';
import { getApiError } from '@/lib/helpers';
import { toast } from 'sonner';
import { T, C, card } from '@/lib/stitch';

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const { restaurant: r, isLoading, fetchMyRestaurant, toggleRestaurantStatus } = useRestaurantOwnerStore();

  useEffect(() => {
    fetchMyRestaurant().catch((err) => toast.error(getApiError(err, 'Failed to load restaurant')));
  }, [fetchMyRestaurant]);

  const { data: ordersData } = useQuery({
    queryKey: ['restaurantOrders', 'dashboard'],
    queryFn: () => ordersAPI.restaurantOrders({ page_size: 50 }),
    enabled: !!r?.id,
    refetchInterval: 10000,
  });
  const orders = ordersData?.data?.results || ordersData?.data || [];
  const visibleOrders = orders.slice(0, 8);
  const newOrderCount = orders.filter((order) => order.status === 'PLACED').length;

  const toggleStatus = async () => {
    try {
      await toggleRestaurantStatus(r.id);
      toast.success(`Restaurant ${r.is_open ? 'closed' : 'opened'}`);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update restaurant status'));
    }
  };

  if (isLoading && !r) {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 140, borderRadius: 16, background: C.surfaceContainer }} />
        ))}
      </div>
    );
  }

  if (!r) {
    return (
      <div style={{ ...card, maxWidth: 760, margin: '48px auto', padding: 32, textAlign: 'center' }}>
        <Store size={44} color={C.saffron} style={{ margin: '0 auto 16px' }} />
        <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>Set Up Your Restaurant</h1>
        <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 24px' }}>
          Create your restaurant once, then manage menu, reviews, and orders from this dashboard.
        </p>
        <button
          onClick={() => navigate('/restaurant/management')}
          style={{ padding: '12px 24px', background: C.saffron, color: '#fff', border: 'none', borderRadius: 12, ...T.labelLg, fontWeight: 700, cursor: 'pointer' }}
        >
          Register Restaurant
        </button>
      </div>
    );
  }

  const stats = [
    { icon: ShoppingBag, label: 'Recent Orders', value: orders.length || 0, bg: '#EFF6FF', ic: '#2563EB' },
    { icon: Clock, label: 'New Orders', value: newOrderCount, bg: '#FFF7ED', ic: '#EA580C' },
    { icon: DollarSign, label: 'Recent Revenue', value: formatCurrency(orders.reduce((s, o) => s + Number.parseFloat(o.total_amount || 0), 0)), bg: '#ECFDF5', ic: '#059669' },
    { icon: Star, label: 'Rating', value: r.average_rating ? Number(r.average_rating).toFixed(1) : 'N/A', bg: '#FFFBEB', ic: '#D97706' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>Restaurant Dashboard</h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '6px 0 0' }}>{r.name}</p>
        </div>
        <button
          onClick={toggleStatus}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', ...T.labelLg, fontWeight: 700, background: r.is_open ? '#D1FAE5' : C.errorContainer, color: r.is_open ? '#065F46' : C.onErrorContainer }}
        >
          <Power size={16} /> {r.is_open ? 'Open' : 'Closed'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(({ icon: Icon, label, value, bg, ic }) => (
          <div key={label} style={{ ...card, padding: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon size={20} color={ic} />
            </div>
            <p style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>{value}</p>
            <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: '4px 0 0' }}>{label}</p>
          </div>
        ))}
      </div>

      <h2 style={{ ...T.headlineSm, color: C.onSurface, margin: '0 0 12px' }}>Recent Orders</h2>
      <div style={{ ...card, overflow: 'hidden' }}>
        {orders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px 0', ...T.bodySm, color: C.onSurfaceVariant }}>No restaurant orders yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surfaceContainerLow }}>
                {['Order', 'Items', 'Status', 'Amount'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', ...T.labelMd, fontWeight: 700, color: C.onSurfaceVariant, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((o) => (
                <tr key={o.id} style={{ borderTop: `1px solid ${C.outlineVariant}` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: 0 }}>#{o.id?.slice(0, 8)}</p>
                    <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: '2px 0 0' }}>{o.customer_name || 'Customer'}</p>
                  </td>
                  <td style={{ padding: '12px 16px', ...T.labelLg, fontWeight: 700, color: C.onSurface }}>{o.item_count || o.items?.length || 0}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ ...T.labelMd, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: C.primaryFixed, color: C.primary }}>{getStatusInfo(o.status).label}</span>
                  </td>
                  <td style={{ padding: '12px 16px', ...T.labelLg, fontWeight: 700, color: C.onSurface }}>{formatCurrency(o.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
