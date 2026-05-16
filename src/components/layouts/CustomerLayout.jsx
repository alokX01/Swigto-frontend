import { Outlet, Link, useLocation } from 'react-router-dom';
import { MapPin, ShoppingCart, ChevronDown, Home, Search, ShoppingBag, User } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { T, C, glassmorphic } from '@/lib/stitch';

const cities = ['Kanpur', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function CustomerLayout() {
  const { selectedCity, setCity } = useLocationStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const fetchCart = useCartStore((s) => s.fetchCart);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showCities, setShowCities] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: 'Inter, sans-serif' }}>
      {/* Top Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, ...glassmorphic, borderBottom: `1px solid ${C.outlineVariant}` }}>
        <div style={{ width: '100%', margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Location picker */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowCities(!showCities)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.surfaceContainerLow}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <MapPin size={16} color={C.saffron} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ ...T.labelSm, color: C.outline, margin: 0 }}>Delivering to</p>
                <p style={{ ...T.labelLg, fontWeight: 600, color: C.onSurface, margin: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {selectedCity} <ChevronDown size={12} />
                </p>
              </div>
            </button>
            {showCities && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: `1px solid ${C.outlineVariant}`, padding: '6px 0', width: 180, zIndex: 50, animation: 'slide-down 0.2s ease-out' }}>
                {cities.map(city => (
                  <button key={city} onClick={() => { setCity(city); setShowCities(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', cursor: 'pointer', ...T.bodySm, transition: 'background 0.1s',
                      background: city === selectedCity ? '#FFF3ED' : 'transparent',
                      color: city === selectedCity ? C.saffron : C.onSurface,
                      fontWeight: city === selectedCity ? 600 : 400,
                    }}
                    onMouseEnter={e => { if (city !== selectedCity) e.currentTarget.style.background = C.surfaceContainerLow; }}
                    onMouseLeave={e => { if (city !== selectedCity) e.currentTarget.style.background = 'transparent'; }}>
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logo */}
          <Link to="/" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.saffron, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17.5 7H14.5V4H9.5C6.46 4 4 6.46 4 9.5V20H7V15H11.23L16 20H19.5L14.36 14.62C16.14 13.96 17.5 12.24 17.5 10.25V7Z" fill="white"/></svg>
            </div>
            <span style={{ ...T.headlineSm, fontSize: 20, color: C.onSurface }}>
              Food<span style={{ color: C.saffron }}>Revolut</span>
            </span>
          </Link>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/cart" style={{ position: 'relative', padding: 8, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.surfaceContainerLow}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <ShoppingCart size={20} color={C.onSurfaceVariant} />
              {itemCount > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: 999, background: C.saffron, color: '#fff', ...T.labelSm, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <Link to="/profile" style={{ width: 34, height: 34, borderRadius: 999, background: C.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', ...T.labelLg, fontWeight: 700, color: C.primary }}>
                {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </Link>
            ) : (
              <Link to="/login" style={{ padding: '8px 16px', borderRadius: 999, background: C.saffron, color: '#fff', textDecoration: 'none', ...T.labelMd, fontWeight: 600 }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ paddingBottom: 80 }}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, ...glassmorphic, borderTop: `1px solid ${C.outlineVariant}` }}
        className="md:hidden">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 64 }}>
          {navItems.filter(item => user || !['/orders', '/profile'].includes(item.to)).map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link key={to} to={to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 12px', textDecoration: 'none', transition: 'color 0.15s', color: isActive ? C.saffron : C.outline }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ ...T.labelSm, fontSize: 10, color: 'inherit', fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
