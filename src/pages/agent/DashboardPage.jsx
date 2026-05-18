import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentAPI } from '@/api/profiles';
import { ordersAPI } from '@/api/orders';
import { formatCurrency, getStatusInfo } from '@/lib/utils';
import { Power, Navigation, Package, Star, LogOut, Truck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { T, badge } from '@/lib/stitch';

const surfaceCard = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 };
const STATUS_COLORS = { PLACED: ['#DBEAFE','#1D4ED8'], ACCEPTED: ['#CFFAFE','#0E7490'], PREPARING: ['#FEF3C7','#B45309'], READY: ['#E9DDFF','#4F378A'], PICKED_UP: ['#E0E7FF','#4338CA'], DELIVERED: ['#D1FAE5','#065F46'], CANCELLED: ['#FFDAD6','#93000A'] };

export default function AgentDashboard() {
  const logout = useAuthStore(s => s.logout);
  const queryClient = useQueryClient();
  const { data: profileData } = useQuery({ queryKey: ['agentProfile'], queryFn: () => agentAPI.getProfile() });
  const { data: ordersData } = useQuery({ queryKey: ['agentOrders'], queryFn: () => ordersAPI.agentOrders({ page_size: 20 }), refetchInterval: 10000 });
  const profile = profileData?.data;
  const orders = ordersData?.data?.results || ordersData?.data || [];
  const toggleM = useMutation({ mutationFn: () => agentAPI.toggleAvailability(), onSuccess: () => { toast.success('Availability toggled!'); queryClient.invalidateQueries({ queryKey: ['agentProfile'] }); } });
  const updateM = useMutation({ mutationFn: ({ id, status }) => ordersAPI.updateStatus(id, { status }), onSuccess: () => { toast.success('Updated!'); queryClient.invalidateQueries({ queryKey: ['agentOrders'] }); }, onError: e => toast.error(e.response?.data?.detail || 'Failed') });
  const isOnline = profile?.status === 'AVAILABLE' || profile?.status === 'ONLINE';

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
        <div>
          <h1 style={{ ...T.headlineSm, color: '#fff' }}>Hey, {profile?.name?.split(' ')[0] || 'Agent'} 👋</h1>
          <p style={{ ...T.labelSm, color: 'rgba(255,255,255,0.5)' }}>Delivery Partner Dashboard</p>
        </div>
        <button onClick={() => toggleM.mutate()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', ...T.labelLg, fontWeight: 700, transition: 'all 0.15s',
            background: isOnline ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: isOnline ? '#4ADE80' : '#F87171' }}>
          <Power size={16} /> {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={surfaceCard}>
          <Package size={20} color="#60A5FA" style={{ marginBottom: 8 }} />
          <p style={{ ...T.headlineMd, color: '#fff' }}>{profile?.total_deliveries || 0}</p>
          <p style={{ ...T.labelSm, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Deliveries</p>
        </div>
        <div style={surfaceCard}>
          <Star size={20} color="#FBBF24" style={{ marginBottom: 8 }} />
          <p style={{ ...T.headlineMd, color: '#fff' }}>{profile?.average_rating ? Number(profile.average_rating).toFixed(1) : 'N/A'}</p>
          <p style={{ ...T.labelSm, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Rating</p>
        </div>
      </div>

      {/* Vehicle Info */}
      {profile && (
        <div style={{ ...surfaceCard, marginBottom: 24 }}>
          <h3 style={{ ...T.labelLg, fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Truck size={16} /> Vehicle Details</h3>
          <p style={{ ...T.bodySm, color: '#fff' }}>{profile.vehicle_type} • {profile.vehicle_number}</p>
          <p style={{ ...T.labelSm, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>License: {profile.driving_license}</p>
        </div>
      )}

      {/* Assigned Orders */}
      <h2 style={{ ...T.headlineSm, fontSize: 16, color: '#fff', marginBottom: 12 }}>Assigned Orders</h2>
      {orders.length === 0 ? (
        <div style={{ ...surfaceCard, textAlign: 'center', padding: 32 }}>
          <Navigation size={32} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 8px' }} />
          <p style={{ ...T.bodySm, color: 'rgba(255,255,255,0.4)' }}>No orders assigned. Stay online!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const next = order.status === 'READY' ? 'PICKED_UP' : order.status === 'PICKED_UP' ? 'DELIVERED' : null;
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.PLACED;
            return (
              <div key={order.id} style={surfaceCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ ...T.labelLg, fontWeight: 700, color: '#fff' }}>#{order.id?.slice(0, 8)}</p>
                    <p style={{ ...T.labelSm, color: 'rgba(255,255,255,0.4)' }}>{order.restaurant_name}</p>
                  </div>
                  <span style={{ ...badge(sc[0], sc[1]), fontSize: 10 }}>{getStatusInfo(order.status).label}</span>
                </div>
                <p style={{ ...T.bodySm, color: '#fff' }}>{formatCurrency(order.total_amount)} • {order.item_count} items</p>
                {next && (
                  <button onClick={() => updateM.mutate({ id: order.id, status: next })}
                    style={{ marginTop: 12, width: '100%', padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', ...T.labelLg, fontWeight: 600, color: '#fff', transition: 'opacity 0.15s',
                      background: next === 'PICKED_UP' ? '#3B82F6' : '#22C55E' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {next === 'PICKED_UP' ? '📦 Pick Up Order' : '✅ Mark Delivered'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Logout */}
      <button onClick={logout} style={{ marginTop: 32, width: '100%', padding: '14px 0', borderRadius: 12, border: '1px solid rgba(248,113,113,0.3)', background: 'transparent', color: '#F87171', cursor: 'pointer', ...T.labelLg, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
