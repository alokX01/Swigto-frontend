import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ChevronRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import { T, C, S } from '@/lib/stitch';
import { toNumber, toBoolean, getApiError } from '@/lib/helpers';

export default function CartPage() {
  const navigate = useNavigate();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const { cart, items, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const [busyItem, setBusyItem] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (isAuth) {
      fetchCart();
    }
  }, [isAuth, fetchCart]);

  const cartItems = cart?.items?.length ? cart.items : items;
  const subtotal = toNumber(cart?.subtotal);
  const deliveryFee = toNumber(cart?.delivery_fee);
  const platformFee = toNumber(cart?.platform_fee);
  const gst = toNumber(cart?.gst);
  const total = toNumber(cart?.total_amount) || subtotal + deliveryFee + platformFee + gst;
  const minOrder = toNumber(cart?.min_order_amount);
  const belowMinimum = toBoolean(cart?.is_below_minimum);
  const progress = minOrder > 0 ? Math.min((subtotal / minOrder) * 100, 100) : 100;
  const amountToAdd = Math.max(minOrder - subtotal, 0);

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cartItems]
  );

  const handleQty = async (item, delta) => {
    const nextQuantity = (item.quantity || 1) + delta;
    setBusyItem(item.id);
    try {
      if (nextQuantity < 1) {
        await removeItem(item.id);
        toast.success('Item removed');
      } else {
        await updateItem(item.id, {
          menu_item: item.menu_item,
          variant: item.variant ?? null,
          quantity: nextQuantity,
        });
      }
    } catch (error) {
      toast.error(getApiError(error, 'Failed to update cart'));
    } finally {
      setBusyItem(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    setClearing(true);
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to clear cart'));
    } finally {
      setClearing(false);
    }
  };

  if (!isAuth) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S.gutter}px`, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={64} color={C.saffron} style={{ marginBottom: 24 }} />
        <h1 style={{ ...T.headlineMd, color: C.onSurface, marginBottom: 8 }}>Sign in to view cart</h1>
        <Link to="/login" style={{ ...T.labelLg, background: C.saffron, color: '#fff', padding: '12px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, marginTop: 22 }}>Sign In</Link>
      </div>
    );
  }

  if (isLoading) return <CartSkeleton />;

  if (!cart || !cartItems.length) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S.gutter}px`, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={64} color={C.saffron} style={{ marginBottom: 24 }} />
        <h1 style={{ ...T.headlineMd, color: C.onSurface, marginBottom: 8 }}>Your cart is empty</h1>
        <p style={{ ...T.bodySm, color: C.onSurfaceVariant, marginBottom: 24 }}>Add delicious food from your favorite restaurants</p>
        <Link to="/" style={{ ...T.labelLg, background: C.saffron, color: '#fff', padding: '12px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Browse Restaurants</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S.gutter}px`, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: C.onSurface, ...T.labelLg, fontWeight: 600 }}>
          <ArrowLeft size={20} /> Continue browsing
        </Link>
        <button onClick={handleClear} disabled={clearing} style={{ ...T.labelLg, padding: '8px 16px', border: '1px solid ' + C.error, background: 'transparent', color: C.error, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          {clearing ? 'Clearing...' : <><Trash2 size={16} style={{ marginRight: 4 }} />Clear cart</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Items */}
        <div>
          {belowMinimum && (
            <div style={{ background: '#FFF3ED', border: `1px solid ${C.saffron}50`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: 0 }}>Add {formatCurrency(amountToAdd)} more</p>
                  <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '4px 0 0 0' }}>Min. order: {formatCurrency(minOrder)}</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 4, background: C.surfaceContainer, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: C.saffron, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {cartItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: 16, padding: 16, background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, marginBottom: 12, opacity: busyItem === item.id ? 0.6 : 1 }}>
              <div style={{ width: 80, height: 80, borderRadius: 8, background: C.surfaceContainer, flexShrink: 0, overflow: 'hidden' }}>
                {item.menu_item_image ? <img src={item.menu_item_image} alt={item.menu_item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>ðŸ½ï¸</div>}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: '0 0 4px 0' }}>{item.item_name || item.menu_item_name || 'Menu item'}</h3>
                {item.variant_name && <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0 }}>Variant: {item.variant_name}</p>}
                <p style={{ ...T.labelMd, color: C.saffron, fontWeight: 700, margin: '8px 0 0 0' }}>{formatCurrency(item.subtotal || toNumber(item.unit_price) * (item.quantity || 1))}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.outlineVariant}`, borderRadius: 8, padding: '4px 8px' }}>
                <button onClick={() => handleQty(item, -1)} disabled={busyItem === item.id} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', color: C.saffron }}><Minus size={16} /></button>
                <span style={{ ...T.labelMd, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity || 1}</span>
                <button onClick={() => handleQty(item, 1)} disabled={busyItem === item.id} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', color: C.saffron }}><Plus size={16} /></button>
              </div>
              <button onClick={() => handleQty(item, -Number(item.quantity || 1))} disabled={busyItem === item.id} style={{ width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', color: C.error }}><Trash2 size={20} /></button>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 16, height: 'fit-content', position: 'sticky', top: 16 }}>
          <h3 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>Bill Details</h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ ...T.bodySm, color: C.onSurfaceVariant }}>Subtotal</span><span style={{ ...T.bodySm, color: C.onSurface, fontWeight: 600 }}>{formatCurrency(subtotal)}</span></div>
          {deliveryFee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ ...T.bodySm, color: C.onSurfaceVariant }}>Delivery</span><span style={{ ...T.bodySm, color: C.onSurface, fontWeight: 600 }}>{formatCurrency(deliveryFee)}</span></div>}
          {platformFee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ ...T.bodySm, color: C.onSurfaceVariant }}>Platform fee</span><span style={{ ...T.bodySm, color: C.onSurface, fontWeight: 600 }}>{formatCurrency(platformFee)}</span></div>}
          {gst > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ ...T.bodySm, color: C.onSurfaceVariant }}>GST & Taxes</span><span style={{ ...T.bodySm, color: C.onSurface, fontWeight: 600 }}>{formatCurrency(gst)}</span></div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${C.outlineVariant}`, marginBottom: 16 }}>
            <span style={{ ...T.titleMd, fontWeight: 700, color: C.onSurface }}>Total</span>
            <span style={{ ...T.titleMd, fontWeight: 700, color: C.saffron, fontSize: 20 }}>{formatCurrency(total)}</span>
          </div>

          <Link to="/checkout" style={{ display: 'block', width: '100%', height: 48, background: belowMinimum ? C.surfaceContainer : C.saffron, color: belowMinimum ? C.onSurfaceVariant : '#fff', border: 'none', borderRadius: 12, ...T.labelLg, fontWeight: 700, cursor: belowMinimum ? 'not-allowed' : 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, pointerEvents: belowMinimum ? 'none' : 'auto' }}>
            {belowMinimum ? 'Add More Items' : <>Proceed to Checkout<ChevronRight size={20} style={{ marginLeft: 8 }} /></>}
          </Link>

          <button onClick={handleClear} disabled={clearing} style={{ width: '100%', height: 48, background: 'transparent', color: C.saffron, border: `1px solid ${C.saffron}`, borderRadius: 12, ...T.labelLg, fontWeight: 700, cursor: 'pointer' }}>
            {clearing ? 'Clearing...' : 'Clear Cart'}
          </button>

          <div style={{ display: 'flex', gap: 12, marginTop: 20, padding: '12px 0', borderTop: `1px solid ${C.outlineVariant}40` }}>
            <ShieldCheck size={20} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: 0 }}>Cart is saved and synced across devices</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S.gutter}px` }}>
      <div style={{ height: 28, width: 200, background: C.surfaceContainer, borderRadius: 4, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 120, background: C.surfaceContainer, borderRadius: 12, marginBottom: 12 }} />
          ))}
        </div>
        <div style={{ height: 300, background: C.surfaceContainer, borderRadius: 12 }} />
      </div>
    </div>
  );
}
