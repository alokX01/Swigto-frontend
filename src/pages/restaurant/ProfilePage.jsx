import { useQuery } from '@tanstack/react-query';
import { restaurantOwnerAPI } from '@/api/profiles';
import { useAuthStore } from '@/store/authStore';
import { Mail, Phone, LogOut } from 'lucide-react';
import { T, C, card } from '@/lib/stitch';

const TEAL = '#0D9488';

export default function RestaurantProfilePage() {
  const logout = useAuthStore(s => s.logout);
  const { data } = useQuery({ queryKey: ['ownerProfile'], queryFn: () => restaurantOwnerAPI.getProfile() });
  const profile = data?.data;

  return (
    <div>
      <h1 style={{ ...T.headlineMd, color: C.onSurface, marginBottom: 24 }}>Profile</h1>
      {profile && (
        <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...card, borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', ...T.headlineMd, color: '#fff' }}>{profile.name?.[0]}</div>
            <h2 style={{ ...T.headlineSm, color: C.onSurface }}>{profile.name}</h2>
            <p style={{ ...T.bodySm, color: C.onSurfaceVariant }}>Restaurant Owner</p>
          </div>
          <div style={{ ...card, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Mail size={16} color={C.outline} /><div><p style={{ ...T.labelSm, color: C.outline }}>Email</p><p style={{ ...T.labelLg, fontWeight: 500, color: C.onSurface }}>{profile.email}</p></div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Phone size={16} color={C.outline} /><div><p style={{ ...T.labelSm, color: C.outline }}>Phone</p><p style={{ ...T.labelLg, fontWeight: 500, color: C.onSurface }}>{profile.phone || 'Not set'}</p></div></div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: `1px solid ${C.error}`, background: 'transparent', color: C.error, cursor: 'pointer', ...T.labelLg, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
