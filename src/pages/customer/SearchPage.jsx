import { useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchAPI } from '@/api/restaurants';
import { Search as SearchIcon, Star, Clock, SlidersHorizontal, X } from 'lucide-react';
import { CUISINE_TYPES, debounce, formatCurrency } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks';
import { useLocationStore } from '@/store/locationStore';
import { T, C, card, cardHover } from '@/lib/stitch';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const isVeg = searchParams.get('is_veg') || undefined;
  const ordering = searchParams.get('ordering') || undefined;
  const isPremium = searchParams.get('is_premium') || undefined;
  
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const selectedCity = useLocationStore((s) => s.selectedCity);

  const { data: restData, isLoading: loadingRest } = useQuery({
    queryKey: ['searchRestaurants', debouncedQuery, selectedCuisines, selectedCity, ordering, isPremium],
    queryFn: () => searchAPI.restaurants({ q: debouncedQuery || undefined, cuisine_type: selectedCuisines.length > 0 ? selectedCuisines : undefined, city: selectedCity, ordering, is_premium: isPremium }),
    enabled: !!debouncedQuery || selectedCuisines.length > 0 || !!ordering || !!isPremium,
  });

  const { data: menuData, isLoading: loadingMenu } = useQuery({
    queryKey: ['searchMenuItems', debouncedQuery, isVeg],
    queryFn: () => searchAPI.menuItems({ q: debouncedQuery || undefined, is_veg: isVeg }),
    enabled: !!debouncedQuery || !!isVeg,
  });

  const restaurants = restData?.data?.results || restData?.data || [];
  const menuItems = menuData?.data?.results || menuData?.data || [];

  const fetchSuggestions = useCallback(debounce(async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try { const res = await searchAPI.auto({ q }); setSuggestions(res.data?.suggestions || res.data || []); } catch { setSuggestions([]); }
  }, 300), []);

  useEffect(() => { fetchSuggestions(query); }, [query, fetchSuggestions]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (q) => {
    if (!q.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const toggleCuisine = (v) => setSelectedCuisines(prev => prev.includes(v) ? prev.filter(c => c !== v) : [...prev, v]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <SearchIcon style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: C.outline, pointerEvents: 'none' }} />
          <input type="text" value={query} 
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }} 
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(query); }}
            placeholder="Search restaurants, cuisines, dishes..." autoFocus
            style={{ width: '100%', height: 52, paddingLeft: 48, paddingRight: 80, background: C.surfaceContainerLow, border: `1px solid ${C.outlineVariant}`, borderRadius: 16, ...T.bodyLg, color: C.onSurface, outline: 'none' }} />
          
          {query && (
            <button onClick={() => { setQuery(''); setSuggestions([]); navigate('/search'); }} style={{ position: 'absolute', right: 50, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, color: C.outline }}>
              <X size={16} />
            </button>
          )}

          <button onClick={() => setShowFilters(!showFilters)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, border: 'none', borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SlidersHorizontal size={16} color={showFilters ? C.saffron : C.onSurfaceVariant} />
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: `1px solid ${C.outlineVariant}`, padding: '6px 0', zIndex: 50, maxHeight: 256, overflowY: 'auto' }}>
            {suggestions.map((s, i) => {
              const text = typeof s === 'string' ? s : s.name || s.restaurant_name || JSON.stringify(s);
              return (
                <button key={i} onClick={() => { setQuery(text); handleSearchSubmit(text); }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', cursor: 'pointer', ...T.bodySm, color: C.onSurface, background: 'transparent', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surfaceContainerLow}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <SearchIcon size={14} color={C.outline} />
                  {text}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24, padding: 16, background: C.surfaceContainerLowest, borderRadius: 16, border: `1px solid ${C.outlineVariant}` }}>
          {CUISINE_TYPES.map(({ value, label, emoji }) => {
            const on = selectedCuisines.includes(value);
            return <button key={value} onClick={() => toggleCuisine(value)}
              style={{ padding: '6px 14px', borderRadius: 999, ...T.labelMd, cursor: 'pointer', border: on ? 'none' : `1px solid ${C.outlineVariant}`, transition: 'all 0.15s',
                background: on ? C.saffron : '#fff', color: on ? '#fff' : C.onSurfaceVariant }}>{emoji} {label}</button>;
          })}
        </div>
      )}

      {debouncedQuery ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Menu Items Section */}
          <section>
            <h2 style={{ ...T.headlineSm, color: C.onSurface, marginBottom: 16 }}>Dishes matching "{debouncedQuery}"</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {loadingMenu ? [1,2].map(i => <div key={i} style={{ ...card, height: 120, borderRadius: 16, animation: 'skeleton 1.5s ease-in-out infinite', background: C.surfaceContainer }} />) :
                menuItems.length === 0 ? <p style={{ ...T.bodySm, color: C.outline }}>No dishes found.</p> :
                menuItems.map(item => <MenuItemResult key={item.id} item={item} />)
              }
            </div>
          </section>

          {/* Restaurants Section */}
          <section>
            <h2 style={{ ...T.headlineSm, color: C.onSurface, marginBottom: 16 }}>Restaurants matching "{debouncedQuery}"</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {loadingRest ? [1,2].map(i => <div key={i} style={{ ...card, height: 100, borderRadius: 16, animation: 'skeleton 1.5s ease-in-out infinite', background: C.surfaceContainer }} />) :
                restaurants.length === 0 ? <p style={{ ...T.bodySm, color: C.outline }}>No restaurants found.</p> :
                restaurants.map(r => <RestaurantResult key={r.id} r={r} />)
              }
            </div>
          </section>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ ...T.bodyLg, color: C.onSurfaceVariant }}>Type something to start searching!</p>
        </div>
      )}
    </div>
  );
}

function RestaurantResult({ r }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/restaurant/${r.id}`} style={{ ...card, borderRadius: 16, display: 'flex', gap: 16, padding: 16, textDecoration: 'none', color: 'inherit', ...(hovered ? cardHover : {}) }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', background: C.surfaceContainer, flexShrink: 0 }}>
        {r.image || r.cover_image ? <img src={r.image || r.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: '#FFF3ED' }}>🍴</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{r.name}</h3>
        <p style={{ ...T.labelSm, color: C.onSurfaceVariant, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {Array.isArray(r.cuisine_type) ? r.cuisine_type.join(', ') : r.cuisine_type || 'Multi-Cuisine'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          {r.average_rating && <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...T.labelSm, color: C.onSurfaceVariant, fontWeight: 600 }}><Star size={14} fill="#F59E0B" color="#F59E0B" />{Number(r.average_rating).toFixed(1)}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...T.labelSm, color: C.outline }}><Clock size={12} /> 30-45 min</span>
        </div>
      </div>
    </Link>
  );
}

function MenuItemResult({ item }) {
  const [hovered, setHovered] = useState(false);
  const r = item.restaurant || {};
  return (
    <Link to={`/restaurant/${item.restaurant_id || r.id}?item=${item.id}`} style={{ ...card, borderRadius: 16, padding: 16, textDecoration: 'none', color: 'inherit', display: 'flex', gap: 16, ...(hovered ? cardHover : {}) }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid ${item.is_veg ? '#22C55E' : '#EF4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: item.is_veg ? '#22C55E' : '#EF4444' }} />
          </span>
          <span style={{ ...T.labelSm, color: C.onSurfaceVariant, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name || 'View Restaurant'}</span>
        </div>
        <h3 style={{ ...T.labelLg, fontWeight: 600, color: C.onSurface, margin: 0 }}>{item.name}</h3>
        <p style={{ ...T.labelLg, fontWeight: 600, color: C.onSurface, marginTop: 4 }}>{formatCurrency(item.effective_price || item.base_price)}</p>
      </div>
      <div style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden', background: C.surfaceContainer, flexShrink: 0 }}>
        {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: '#FFF3ED' }}>🍽️</div>}
      </div>
    </Link>
  );
}
