import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, Clock, MapPin, X, Leaf, Drumstick, Dumbbell, Zap, Tag, Utensils, SlidersHorizontal } from 'lucide-react';
import { restaurantsAPI, searchAPI } from '@/api/restaurants';
import { useLocationStore } from '@/store/locationStore';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { debounce, formatDate, resolveMediaUrl } from '@/lib/utils';
import { T, C, S } from '@/lib/stitch';

const QUICK_CATEGORIES = [
  { label: 'Pure Veg', icon: Leaf, bg: '#F0FDF4', color: '#16A34A', filter: 'vegetarian' },
  { label: 'Non Veg', icon: Drumstick, bg: '#FEF2F2', color: '#DC2626', filter: 'non_veg' },
  { label: 'Healthy', icon: Dumbbell, bg: '#EFF6FF', color: '#2563EB', filter: 'healthy' },
  { label: 'Fastest', icon: Zap, bg: '#FFF7ED', color: '#EA580C', filter: 'fast' },
  { label: 'Offers', icon: Tag, bg: '#FEF2F2', color: '#DC2626', filter: 'offers' },
  { label: 'Cuisines', icon: Utensils, bg: '#FAF5FF', color: '#9333EA', filter: 'cuisines' },
  { label: 'Top Rated', icon: Star, bg: '#FEFCE8', color: '#CA8A04', filter: 'top_rated' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [page, setPage] = useState(1);
  const selectedCity = useLocationStore((s) => s.selectedCity);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { orders, fetchOrders } = useOrderStore();

  const { data: restaurantsData, isLoading } = useQuery({
    queryKey: ['restaurants', selectedCity, selectedCuisine, page],
    queryFn: () => restaurantsAPI.list({ city: selectedCity || undefined, cuisine_type: selectedCuisine || undefined, page, page_size: 12 }),
    keepPreviousData: true,
  });

  const restaurants = restaurantsData?.data?.results || restaurantsData?.data || [];
  const totalCount = restaurantsData?.data?.count || 0;

  const fetchSuggestions = useCallback(debounce(async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try { const res = await searchAPI.auto({ q }); setSuggestions(res.data?.suggestions || res.data || []); } catch { setSuggestions([]); }
  }, 300), []);

  useEffect(() => { fetchSuggestions(searchQuery); }, [searchQuery, fetchSuggestions]);

  useEffect(() => {
    if (isAuthenticated) fetchOrders({ page_size: 5 }).catch(() => {});
  }, [fetchOrders, isAuthenticated]);

  const handleSearchSubmit = (q) => {
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleQuickCategory = (filter) => {
    const targets = {
      vegetarian: '/search?q=veg&is_veg=true',
      non_veg: '/search?q=chicken&is_veg=false',
      healthy: '/search?q=healthy',
      fast: '/search?q=restaurant&ordering=average_preparation_time',
      offers: '/search?q=restaurant&is_premium=true',
      cuisines: '/search?q=',
      top_rated: '/search?q=restaurant&ordering=-average_rating',
    };
    navigate(targets[filter] || '/search');
  };

  const recentOrders = orders.slice(0, 3);

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', width: '100%', padding: `0 ${S.gutter * 1.5}px`, paddingBottom: 100 }}>
      {/* Hero Section */}
      <section style={{ paddingTop: 40, paddingBottom: 48 }}>
        <div style={{ position: 'relative', background: C.primaryContainer, borderRadius: 24, overflow: 'hidden', padding: 64, minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ position: 'relative', zIndex: 10, maxWidth: 640 }}>
            <h1 style={{ ...T.displayLg, color: '#e0d2ff', marginBottom: 8, fontSize: 42 }}>Deliciously Delivered.</h1>
            <p style={{ ...T.bodyLg, color: 'rgba(224, 210, 255, 0.8)', marginBottom: 32 }}>
              The best food from your favorite local restaurants at your doorstep.
            </p>
            
            {/* Search Box */}
            <div style={{ position: 'relative', display: 'flex', background: '#fff', borderRadius: 16, padding: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: `1px solid ${C.outlineVariant}` }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', color: C.outline }}>
                <Search size={20} />
              </div>
              <input type="text" value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(searchQuery); }}
                placeholder="Search for restaurant, cuisine or a dish"
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', ...T.bodySm, height: 48 }}
              />
              <button onClick={() => handleSearchSubmit(searchQuery)}
                style={{ background: C.saffron, color: '#fff', padding: '0 24px', borderRadius: 12, border: 'none', ...T.labelLg, fontWeight: 600, cursor: 'pointer', transition: 'filter 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                Find Food
              </button>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 12, background: '#fff', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.15)', border: `1px solid ${C.outlineVariant}`, padding: '8px 0', zIndex: 50, maxHeight: 320, overflowY: 'auto' }}>
                  {suggestions.map((s, i) => {
                    const text = typeof s === 'string' ? s : s.name || s.restaurant_name || JSON.stringify(s);
                    return (
                      <button key={i} onClick={() => handleSearchSubmit(text)}
                        style={{ width: '100%', textAlign: 'left', padding: '12px 20px', border: 'none', cursor: 'pointer', ...T.bodySm, color: C.onSurface, background: 'transparent', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = C.surfaceContainerLow}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Search size={16} color={C.outline} />
                        {text}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Glassmorphic Accent Shapes */}
          <div style={{ position: 'absolute', bottom: -40, right: -40, width: 256, height: 256, background: 'rgba(242, 110, 33, 0.2)', borderRadius: '50%', filter: 'blur(64px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 40, right: 80, width: 128, height: 128, background: 'rgba(225, 212, 253, 0.3)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
        </div>
      </section>

      {/* Quick Categories */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ ...T.headlineMd, color: C.onSurface, marginBottom: 24 }}>Quick Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
          {QUICK_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div key={i} onClick={() => handleQuickCategory(cat.filter)} style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'; }}>
                <div style={{ width: 48, height: 48, background: cat.bg, color: cat.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={24} />
                </div>
                <span style={{ ...T.labelMd, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Order Again */}
      <section style={{ marginBottom: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ ...T.headlineMd, color: C.onSurface }}>Order Again</h2>
          <Link to="/orders" style={{ ...T.labelLg, color: C.primary, textDecoration: 'none', fontWeight: 600 }}>View History</Link>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {recentOrders.length > 0 ? recentOrders.map((order) => {
            const restaurantId = order.restaurant || order.restaurant_id;
            const target = restaurantId ? `/restaurant/${restaurantId}` : `/orders/${order.id}`;

            return (
              <Link key={order.id} to={target} style={{ minWidth: 260, background: '#F8F6FA', borderRadius: 16, border: `1px solid ${C.outlineVariant}50`, padding: 12, display: 'flex', gap: 12, color: 'inherit', textDecoration: 'none' }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', background: C.surfaceContainer, flexShrink: 0 }}>
                  {order.restaurant_image ? <img src={resolveMediaUrl(order.restaurant_image)} alt={order.restaurant_name || 'Restaurant'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>Food</div>}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: 0 }}>{order.restaurant_name || 'Previous order'}</h4>
                    <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0 }}>{order.placed_at ? `Ordered ${formatDate(order.placed_at)}` : `${order.item_count || order.items?.length || 0} items`}</p>
                  </div>
                  <span style={{ alignSelf: 'flex-start', background: '#FCECE4', color: C.saffron, borderRadius: 8, padding: '4px 12px', ...T.labelSm, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    Order Again
                  </span>
                </div>
              </Link>
            );
          }) : (
            <div style={{ minWidth: 260, background: '#F8F6FA', borderRadius: 16, border: `1px solid ${C.outlineVariant}50`, padding: 16 }}>
              <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0 }}>{isAuthenticated ? 'Your recent orders will appear here.' : 'Sign in to see your recent orders.'}</p>
            </div>
          )}
        </div>
        <div style={{ display: 'none' }}>
          {/* Card 1 */}
          <div style={{ minWidth: 260, background: '#F8F6FA', borderRadius: 16, border: `1px solid ${C.outlineVariant}50`, padding: 12, display: 'flex', gap: 12 }}>
            <img src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=200&auto=format&fit=crop" alt="Biryani" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: 0 }}>Biryani Blues</h4>
                <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0 }}>Ordered 2 days ago</p>
              </div>
              <button style={{ alignSelf: 'flex-start', background: '#FCECE4', color: C.saffron, border: 'none', borderRadius: 8, padding: '4px 12px', ...T.labelSm, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                ↻ Reorder
              </button>
            </div>
          </div>
          {/* Card 2 */}
          <div style={{ minWidth: 260, background: '#F8F6FA', borderRadius: 16, border: `1px solid ${C.outlineVariant}50`, padding: 12, display: 'flex', gap: 12 }}>
            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop" alt="Pizza" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: 0 }}>The Pizza Co</h4>
                <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0 }}>Ordered last week</p>
              </div>
              <button style={{ alignSelf: 'flex-start', background: '#FCECE4', color: C.saffron, border: 'none', borderRadius: 8, padding: '4px 12px', ...T.labelSm, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                ↻ Reorder
              </button>
            </div>
          </div>
          {/* Card 3 */}
          <div style={{ minWidth: 260, background: '#F8F6FA', borderRadius: 16, border: `1px solid ${C.outlineVariant}50`, padding: 12, display: 'flex', gap: 12 }}>
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop" alt="Salad" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: 0 }}>Healthy Greens</h4>
                <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0 }}>Ordered 5 days ago</p>
              </div>
              <button style={{ alignSelf: 'flex-start', background: '#FCECE4', color: C.saffron, border: 'none', borderRadius: 8, padding: '4px 12px', ...T.labelSm, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                ↻ Reorder
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Restaurant Feed */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ ...T.headlineMd, color: C.onSurface }}>Restaurants Near You</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/search?q=restaurant&ordering=-average_rating')} style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 999, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, ...T.bodySm, cursor: 'pointer' }}>
              Sort <SlidersHorizontal size={14} />
            </button>
            <button onClick={() => navigate('/search')} style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 999, padding: '8px 16px', ...T.bodySm, cursor: 'pointer' }}>
              Cuisines
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
          }
        </div>

        {restaurants.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
            <h3 style={{ ...T.headlineSm, color: C.onSurface, marginBottom: 4 }}>No restaurants found</h3>
            <p style={{ ...T.bodySm, color: C.onSurfaceVariant }}>Try a different search or location</p>
          </div>
        )}

        {/* Pagination */}
        {totalCount > 12 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '32px 0' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '8px 20px', borderRadius: 12, ...T.labelLg, border: `1px solid ${C.outlineVariant}`, background: '#fff', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1, color: C.onSurface }}>Previous</button>
            <span style={{ padding: '8px 16px', ...T.bodySm, color: C.onSurfaceVariant }}>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={restaurants.length < 12}
              style={{ padding: '8px 20px', borderRadius: 12, ...T.labelLg, border: `1px solid ${C.outlineVariant}`, background: '#fff', cursor: restaurants.length < 12 ? 'default' : 'pointer', opacity: restaurants.length < 12 ? 0.4 : 1, color: C.onSurface }}>Next</button>
          </div>
        )}
      </section>
    </div>
  );
}

function RestaurantCard({ restaurant }) {
  const [hovered, setHovered] = useState(false);
  const isOpen = restaurant.is_open !== false;
  const rating = restaurant.average_rating || restaurant.rating;
  const image = restaurant.image || restaurant.cover_image;
  const cuisines = restaurant.cuisine_type || restaurant.cuisines;

  return (
    <Link to={`/restaurant/${restaurant.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: C.surface, borderRadius: 16, border: `1px solid ${C.outlineVariant}50`, overflow: 'hidden', boxShadow: hovered ? '0 12px 30px rgba(0,0,0,0.08)' : '0 4px 15px rgba(0,0,0,0.03)', transition: 'all 0.3s', transform: hovered ? 'translateY(-4px)' : 'translateY(0)', opacity: isOpen ? 1 : 0.6 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      
      <div style={{ position: 'relative', height: 192, overflow: 'hidden' }}>
        {image ? (
          <img src={image} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
            onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #FFF3ED, #FFE4D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🍴</div>
        )}
        
        {rating && (
          <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '4px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Star size={14} fill="#F59E0B" color="#F59E0B" />
            <span style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface }}>{Number(rating).toFixed(1)}</span>
          </div>
        )}
        
        {/* Placeholder for Offer Badge */}
        <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
          <span style={{ background: C.saffron, color: '#fff', padding: '4px 12px', borderRadius: 6, ...T.labelMd, fontWeight: 700, letterSpacing: '0.02em', boxShadow: '0 4px 12px rgba(242,110,33,0.3)' }}>
            FLAT ₹100 OFF
          </span>
        </div>
        
        {!isOpen && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ ...T.labelMd, background: C.error, color: '#fff', padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase' }}>Closed</span>
          </div>
        )}
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <h3 style={{ ...T.headlineSm, fontSize: 18, fontWeight: 700, color: C.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, flex: 1 }}>{restaurant.name}</h3>
        </div>
        <p style={{ ...T.bodySm, color: C.onSurfaceVariant, marginBottom: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {Array.isArray(cuisines) ? cuisines.join(', ') : cuisines || 'Multi-Cuisine'}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, borderTop: `1px solid ${C.outlineVariant}40`, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.onSurfaceVariant }}>
            <Clock size={16} />
            <span style={{ ...T.bodySm }}>30-45 mins</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.onSurfaceVariant }}>
            <MapPin size={16} />
            <span style={{ ...T.bodySm }}>{restaurant.city || 'Nearby'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.outlineVariant}50`, overflow: 'hidden' }}>
      <div style={{ height: 192, background: `linear-gradient(90deg, ${C.surfaceContainer} 25%, ${C.surfaceContainerLow} 50%, ${C.surfaceContainer} 75%)`, backgroundSize: '200% 100%', animation: 'skeleton 1.5s ease-in-out infinite' }} />
      <div style={{ padding: 16 }}>
        <div style={{ height: 20, width: '70%', borderRadius: 4, background: C.surfaceContainer, marginBottom: 8 }} />
        <div style={{ height: 14, width: '40%', borderRadius: 4, background: C.surfaceContainer, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 16, borderTop: `1px solid ${C.outlineVariant}40`, paddingTop: 16 }}>
          <div style={{ height: 16, width: 60, borderRadius: 4, background: C.surfaceContainer }} />
          <div style={{ height: 16, width: 60, borderRadius: 4, background: C.surfaceContainer }} />
        </div>
      </div>
    </div>
  );
}
