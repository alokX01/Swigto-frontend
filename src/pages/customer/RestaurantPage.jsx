import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Clock, ArrowLeft, ShoppingCart, Search } from 'lucide-react';
import { restaurantsAPI } from '@/api/restaurants';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import { T, C, S, card } from '@/lib/stitch';
import { toast } from 'sonner';

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchMenu, setSearchMenu] = useState('');
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const cart = useCartStore((s) => s.cart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: restaurant, isLoading: loadingR } = useQuery({ queryKey: ['restaurant', id], queryFn: () => restaurantsAPI.get(id) });
  const { data: categoriesData } = useQuery({ queryKey: ['categories', id], queryFn: () => restaurantsAPI.getCategories(id, { page_size: 50 }) });
  const { data: menuData, isLoading: loadingMenu } = useQuery({ queryKey: ['menuItems', id, selectedCategory, searchMenu], queryFn: () => restaurantsAPI.getMenuItems(id, { category: selectedCategory || undefined, search: searchMenu || undefined, page_size: 100 }) });

  const r = restaurant?.data;
  const categories = categoriesData?.data?.results || categoriesData?.data || [];
  const menuItems = menuData?.data?.results || menuData?.data || [];
  const itemCount = cartItems.reduce((sum, i) => sum + (i.quantity || 0), 0);

  const handleAdd = async (item) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to your cart');
      navigate('/login', { state: { from: location } });
      return;
    }
    try { await addItem({ menu_item: item.id, variant: null, quantity: 1 }); toast.success(`${item.name} added!`); }
    catch (e) { toast.error(e.response?.data?.detail || 'Failed to add'); }
  };

  if (loadingR) return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
      {[1,2,3,4].map(i => <div key={i} style={{ height: i===1?200:80, borderRadius: 16, background: C.surfaceContainer, marginBottom: 12, animation: 'skeleton 1.5s ease-in-out infinite' }} />)}
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `0 ${S.gutter}px`, paddingBottom: 100 }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...T.bodySm, color: C.outline, textDecoration: 'none', padding: '16px 0' }}>
        <ArrowLeft size={16} /> Back
      </Link>

      {/* Hero */}
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 200, marginBottom: 24, background: `linear-gradient(135deg, #FFF3ED, #FFE4D6)` }}>
        {(r?.cover_image || r?.image) ? <img src={r.cover_image || r.image} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>🍴</div>}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 16, left: 20, color: '#fff' }}>
          <h1 style={{ ...T.headlineMd, color: '#fff', margin: 0 }}>{r?.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            {r?.average_rating && <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...T.bodySm }}><Star size={14} fill="#F59E0B" color="#F59E0B" /> {Number(r.average_rating).toFixed(1)}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...T.bodySm }}><Clock size={14} /> 30-45 min</span>
            <span style={{ ...T.labelMd, padding: '3px 10px', borderRadius: 999, background: r?.is_open !== false ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)' }}>
              {r?.is_open !== false ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* Search menu */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: C.outline, pointerEvents: 'none' }} />
        <input type="text" value={searchMenu} onChange={e => setSearchMenu(e.target.value)} placeholder="Search menu..."
          style={{ width: '100%', height: 44, paddingLeft: 40, paddingRight: 16, borderRadius: 12, background: C.surfaceContainerLow, border: `1px solid ${C.outlineVariant}`, ...T.bodySm, color: C.onSurface, outline: 'none' }} />
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16 }}>
          <button onClick={() => setSelectedCategory(null)}
            style={{ flexShrink: 0, padding: '6px 16px', borderRadius: 999, ...T.labelLg, fontWeight: 500, cursor: 'pointer', border: !selectedCategory ? 'none' : `1px solid ${C.outlineVariant}`,
              background: !selectedCategory ? C.saffron : '#fff', color: !selectedCategory ? '#fff' : C.onSurfaceVariant }}>All</button>
          {categories.map(c => {
            const on = selectedCategory === c.id;
            return <button key={c.id} onClick={() => setSelectedCategory(on ? null : c.id)}
              style={{ flexShrink: 0, padding: '6px 16px', borderRadius: 999, ...T.labelLg, fontWeight: 500, cursor: 'pointer', border: on ? 'none' : `1px solid ${C.outlineVariant}`,
                background: on ? C.saffron : '#fff', color: on ? '#fff' : C.onSurfaceVariant }}>{c.name}</button>;
          })}
        </div>
      )}

      {/* Menu items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loadingMenu ? [1,2,3].map(i => <div key={i} style={{ height: 96, borderRadius: 16, background: C.surfaceContainer, animation: 'skeleton 1.5s ease-in-out infinite' }} />) :
          menuItems.length === 0 ? <p style={{ textAlign: 'center', padding: '48px 0', ...T.bodySm, color: C.outline }}>No items</p> :
          menuItems.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 16, padding: 16, ...card, borderRadius: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid ${item.is_veg ? '#22C55E' : '#EF4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: item.is_veg ? '#22C55E' : '#EF4444' }} />
                  </span>
                  {item.is_bestseller && <span style={{ ...T.labelSm, fontSize: 10, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 6px', borderRadius: 4 }}>★ Bestseller</span>}
                </div>
                <h3 style={{ ...T.labelLg, fontWeight: 600, color: C.onSurface, margin: 0 }}>{item.name}</h3>
                <p style={{ ...T.labelLg, fontWeight: 600, color: C.onSurface, marginTop: 2 }}>{formatCurrency(item.effective_price || item.base_price)}</p>
                {item.description && <p style={{ ...T.labelSm, color: C.outline, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>}
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden', background: C.surfaceContainer }}>
                  {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: '#FFF3ED' }}>🍽️</div>}
                </div>
                <button onClick={() => handleAdd(item)} disabled={item.is_available === false}
                  style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: `2px solid ${C.saffron}`, color: C.saffron, padding: '4px 20px', borderRadius: 8, ...T.labelMd, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', opacity: item.is_available === false ? 0.4 : 1 }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.saffron; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.saffron; }}>
                  {item.is_available !== false ? 'ADD' : 'N/A'}
                </button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Floating cart bar */}
      {itemCount > 0 && (
        <Link to="/cart" style={{ position: 'fixed', bottom: 80, left: 16, right: 16, maxWidth: 384, margin: '0 auto', background: C.saffron, color: '#fff', borderRadius: 16, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 30, boxShadow: '0 8px 30px rgba(242,110,33,0.4)', textDecoration: 'none', animation: 'slide-up 0.3s ease-out' }}>
          <div>
            <span style={{ ...T.labelLg, fontWeight: 700 }}>{itemCount} item{itemCount > 1 ? 's' : ''}</span>
            {cart && <span style={{ ...T.bodySm, opacity: 0.9, marginLeft: 8 }}>{formatCurrency(cart.total_amount)}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, ...T.labelLg, fontWeight: 600 }}>View Cart <ShoppingCart size={16} /></div>
        </Link>
      )}
    </div>
  );
}
