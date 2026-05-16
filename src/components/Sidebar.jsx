import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Star, UserCircle, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { T, C } from '@/lib/stitch';

const restaurantNavItems = [
  { to: '/restaurant/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/restaurant/orders', icon: ShoppingBag, label: 'Live Orders' },
  { to: '/restaurant/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/restaurant/reviews', icon: Star, label: 'Reviews' },
  { to: '/restaurant/profile', icon: UserCircle, label: 'Profile' },
];

export function Sidebar({ variant = 'restaurant' }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const items = restaurantNavItems;
  const accent = C.teal;
  const w = collapsed ? 64 : 260;

  return (
    <aside style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: w, display: 'flex', flexDirection: 'column', transition: 'width 0.3s', zIndex: 50, background: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
      {/* Logo */}
      <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {!collapsed && (
          <span style={{ ...T.headlineSm, fontSize: 18, color: '#fff' }}>
            Food<span style={{ color: accent }}>Revolut</span>
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 4 }}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {items.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', ...T.labelLg, fontWeight: 500, transition: 'all 0.15s', position: 'relative',
              background: active ? 'rgba(255,255,255,0.08)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
              {active && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 24, borderRadius: '0 4px 4px 0', background: accent }} />}
              <Icon size={20} style={{ flexShrink: 0, color: active ? accent : 'inherit' }} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, width: '100%', border: 'none', cursor: 'pointer', background: 'transparent', ...T.labelLg, fontWeight: 500, color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#F87171'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
