import { useQuery } from '@tanstack/react-query';
import { restaurantsAPI } from '@/api/restaurants';
import { ordersAPI } from '@/api/orders';
import { ShoppingBag, DollarSign, Clock, Star, Power } from 'lucide-react';
import { formatCurrency, getStatusInfo } from '@/lib/utils';
import { toast } from 'sonner';
import { T, C, card } from '@/lib/stitch';

const TEAL = '#0D9488';

export default function RestaurantDashboard() {
  const { data: restaurant, refetch } = useQuery({ queryKey: ['myRestaurant'], queryFn: () => restaurantsAPI.getMine() });
  const { data: ordersData } = useQuery({ queryKey: ['restaurantOrders'], queryFn: () => ordersAPI.restaurantOrders({ page_size: 5 }) });
  const r = restaurant?.data;
  const orders = ordersData?.data?.results || ordersData?.data || [];

  const toggleStatus = async () => { try { await restaurantsAPI.toggleStatus(r.id); toast.success(`Restaurant ${r.is_open ? 'closed' : 'opened'}!`); refetch(); } catch { toast.error('Failed'); } };

  const stats = [
    { icon: ShoppingBag, label: 'Total Orders', value: orders.length || 0, bg: '#EFF6FF', ic: '#2563EB' },
    { icon: DollarSign, label: 'Revenue', value: formatCurrency(orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0)), bg: '#ECFDF5', ic: '#059669' },
    { icon: Star, label: 'Rating', value: r?.average_rating ? Number(r.average_rating).toFixed(1) : 'N/A', bg: '#FFFBEB', ic: '#D97706' },
    { icon: Clock, label: 'Avg Prep Time', value: `${r?.average_preparation_time || 30} min`, bg: '#F5F3FF', ic: '#7C3AED' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ ...T.headlineMd, color: C.onSurface }}>Dashboard</h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant }}>{r?.name || 'Your Restaurant'}</p>
        </div>
        {r && (
          <button onClick={toggleStatus}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', ...T.labelLg, fontWeight: 600, transition: 'all 0.15s',
              background: r.is_open ? '#D1FAE5' : '#FFDAD6', color: r.is_open ? '#065F46' : '#93000A' }}>
            <Power size={16} /> {r.is_open ? 'Open' : 'Closed'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(({ icon: Ic, label, value, bg, ic }) => (
          <div key={label} style={{ ...card, borderRadius: 16, padding: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Ic size={20} color={ic} /></div>
            <p style={{ ...T.headlineMd, color: C.onSurface }}>{value}</p>
            <p style={{ ...T.labelSm, color: C.onSurfaceVariant, marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>

      <h2 style={{ ...T.headlineSm, color: C.onSurface, marginBottom: 12 }}>Recent Orders</h2>
      <div style={{ ...card, borderRadius: 16, overflow: 'hidden' }}>
        {orders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px 0', ...T.bodySm, color: C.outline }}>No orders yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Order', 'Status', 'Amount'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 16px', ...T.labelMd, fontWeight: 600, color: C.onSurfaceVariant, textTransform: 'uppercase' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const sc = { PLACED: ['#DBEAFE','#1D4ED8'], ACCEPTED: ['#CFFAFE','#0E7490'], PREPARING: ['#FEF3C7','#B45309'], READY: ['#E9DDFF','#4F378A'], PICKED_UP: ['#E0E7FF','#4338CA'], DELIVERED: ['#D1FAE5','#065F46'], CANCELLED: ['#FFDAD6','#93000A'] }[o.status] || ['#F3F4F6','#6B7280'];
                return (
                  <tr key={o.id} style={{ borderTop: `1px solid ${C.surfaceContainer}` }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 16px' }}>
                      <p style={{ ...T.labelLg, fontWeight: 500, color: C.onSurface }}>#{o.id?.slice(0,8)}</p>
                      <p style={{ ...T.labelSm, color: C.outline }}>{o.customer_name || 'Customer'}</p>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ ...T.labelMd, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: sc[0], color: sc[1] }}>{getStatusInfo(o.status).label}</span>
                    </td>
                    <td style={{ padding: '10px 16px', ...T.labelLg, fontWeight: 500, color: C.onSurface }}>{formatCurrency(o.total_amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
