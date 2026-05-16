import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '@/api/orders';
import { formatCurrency, getStatusInfo } from '@/lib/utils';
import { toast } from 'sonner';
import { Clock, CheckCircle, ChefHat, Package } from 'lucide-react';
import { T, C, card } from '@/lib/stitch';

const TEAL = '#0D9488';
const STATUS_COLS = [
  { status: 'PLACED', label: 'New Orders', icon: Clock, top: '#3B82F6' },
  { status: 'ACCEPTED', label: 'Accepted', icon: CheckCircle, top: '#06B6D4' },
  { status: 'PREPARING', label: 'Preparing', icon: ChefHat, top: '#F59E0B' },
  { status: 'READY', label: 'Ready', icon: Package, top: '#22C55E' },
];

export default function RestaurantOrdersPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['restaurantOrders'], queryFn: () => ordersAPI.restaurantOrders({ page_size: 50 }), refetchInterval: 10000 });
  const orders = data?.data?.results || data?.data || [];
  const updateStatus = useMutation({ mutationFn: ({ id, status }) => ordersAPI.updateStatus(id, { status }), onSuccess: () => { toast.success('Status updated!'); queryClient.invalidateQueries(['restaurantOrders']); }, onError: (e) => toast.error(e.response?.data?.detail || 'Failed') });
  const nextStatus = (s) => ({ PLACED: 'ACCEPTED', ACCEPTED: 'PREPARING', PREPARING: 'READY' }[s]);

  return (
    <div>
      <h1 style={{ ...T.headlineMd, color: C.onSurface, marginBottom: 24 }}>Live Orders</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {STATUS_COLS.map(({ status, label, icon: Ic, top }) => {
          const col = orders.filter(o => o.status === status);
          return (
            <div key={status} style={{ ...card, borderRadius: 16, borderTop: `4px solid ${top}`, padding: 16, minHeight: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ ...T.labelLg, fontWeight: 600, color: C.onSurface, display: 'flex', alignItems: 'center', gap: 8 }}><Ic size={16} /> {label}</h3>
                <span style={{ ...T.labelMd, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: C.surfaceContainer, color: C.onSurfaceVariant }}>{col.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.map(o => (
                  <div key={o.id} style={{ background: C.surfaceContainerLow, borderRadius: 10, padding: 12, transition: 'box-shadow 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface }}>#{o.id?.slice(0,8)}</p>
                    <p style={{ ...T.labelSm, color: C.onSurfaceVariant, marginTop: 2 }}>{o.item_count} items • {formatCurrency(o.total_amount)}</p>
                    {nextStatus(status) && (
                      <button onClick={() => updateStatus.mutate({ id: o.id, status: nextStatus(status) })}
                        style={{ marginTop: 8, width: '100%', padding: '6px 0', borderRadius: 8, border: 'none', cursor: 'pointer', background: TEAL, color: '#fff', ...T.labelMd, fontWeight: 600, transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        Move to {getStatusInfo(nextStatus(status)).label}
                      </button>
                    )}
                  </div>
                ))}
                {col.length === 0 && <p style={{ textAlign: 'center', ...T.labelSm, color: C.outline, padding: '16px 0' }}>No orders</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
