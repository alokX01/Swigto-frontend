import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Home,
  Landmark,
  MapPin,
  MessageSquare,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Ticket,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerAPI } from '@/api/profiles';
import { ordersAPI, paymentsAPI } from '@/api/orders';
import { useCartStore } from '@/store/cartStore';
import { addressSchema } from '@/lib/validators';
import { formatCurrency, PAYMENT_METHODS } from '@/lib/utils';
import { T, C, S, btnSaffron, input as inputStyle } from '@/lib/stitch';
import { getApiError, toNumber, toBoolean } from '@/lib/helpers';

const paymentIcons = {
  UPI: Smartphone,
  CARD: CreditCard,
  NETBANKING: Landmark,
  COD: Banknote,
};

const paymentDescriptions = {
  UPI: 'Google Pay, PhonePe, Paytm',
  CARD: 'Credit and debit cards',
  NETBANKING: 'All major banks',
  COD: 'Pay when your food arrives',
};

const addressIcons = {
  HOME: Home,
  WORK: Briefcase,
  OTHER: MapPin,
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, items, isLoading: cartLoading, fetchCart, clearCart } = useCartStore();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [cartHydrated, setCartHydrated] = useState(false);

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'HOME',
      flat_number: '',
      address_line: '',
      pincode: '',
      receiver_phone: '',
    },
  });

  useEffect(() => {
    let active = true;
    fetchCart().finally(() => {
      if (active) setCartHydrated(true);
    });
    return () => {
      active = false;
    };
  }, [fetchCart]);

  const { data: addressData, isLoading: addressesLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => customerAPI.getAddresses({ page_size: 20 }),
  });

  const addresses = useMemo(() => addressData?.data?.results || addressData?.data || [], [addressData]);
  const cartItems = cart?.items?.length ? cart.items : items;
  const isCartEmpty = !cartItems.length;
  const isBelowMinimum = toBoolean(cart?.is_below_minimum);
  const defaultAddressId = useMemo(() => {
    if (!addresses.length) return null;
    return (addresses.find((addr) => addr.is_default) || addresses[0]).id;
  }, [addresses]);
  const activeAddressId = selectedAddress || defaultAddressId;
  const selectedAddressObj = addresses.find((addr) => addr.id === activeAddressId);

  const addAddressMutation = useMutation({
    mutationFn: (data) => customerAPI.addAddress(data),
    onSuccess: (res) => {
      const savedAddress = res?.data;
      toast.success('Address added');
      setShowAddAddress(false);
      addressForm.reset();
      if (savedAddress?.id) setSelectedAddress(savedAddress.id);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      refetchAddresses();
    },
    onError: (error) => {
      toast.error(getApiError(error, 'Failed to add address'));
    },
  });

  const handlePlaceOrder = async () => {
    if (cartLoading) return;
    if (!cart || isCartEmpty) {
      toast.error('Your cart is empty');
      return;
    }
    if (!activeAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    if (isBelowMinimum) {
      toast.error('Please meet the minimum order amount');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderRes = await ordersAPI.checkout({
        payment_method: paymentMethod,
        selected_address: activeAddressId,
      });
      const order = orderRes.data;

      if (paymentMethod !== 'COD' && order?.id) {
        try {
          const payRes = await paymentsAPI.initiate(order.id);
          const razorpayOrderId = payRes.data?.razorpay_order_id;

          if (razorpayOrderId && window.Razorpay) {
            const rzp = new window.Razorpay({
              key: import.meta.env.VITE_RAZORPAY_KEY_ID,
              amount: payRes.data.amount,
              currency: 'INR',
              name: 'FoodRevolut',
              order_id: razorpayOrderId,
              handler: async (response) => {
                await paymentsAPI.verify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                });
                await clearCart();
                navigate(`/orders/${order.id}/track`);
              },
            });
            rzp.open();
            return;
          }
        } catch {
          toast.error('Payment window could not be started. Your order was created.');
        }
      }

      await clearCart();
      navigate(order?.id ? `/orders/${order.id}/track` : '/orders');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to place order'));
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!cartHydrated || cartLoading) return <CheckoutSkeleton />;

  if (!cart || isCartEmpty) {
    return (
      <div className="checkout-shell">
        <Link to="/" className="checkout-back-link">
          <ArrowLeft size={16} /> Back to restaurants
        </Link>
        <div className="checkout-empty">
          <div className="checkout-empty-icon"><ShoppingBag size={36} color={C.saffron} /></div>
          <h1 style={{ ...T.headlineMd, color: C.onSurface }}>Your cart is empty</h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, marginTop: 6 }}>
            Add your favourite dishes before checkout.
          </p>
          <Link to="/" style={{ ...btnSaffron, display: 'inline-flex', width: 'auto', padding: '0 22px', marginTop: 22, alignItems: 'center', textDecoration: 'none' }}>
            Browse Restaurants
          </Link>
        </div>
        <CheckoutStyles />
      </div>
    );
  }

  return (
    <div className="checkout-shell">
      <div className="checkout-title-row">
        <Link to="/cart" className="checkout-back-link">
          <ArrowLeft size={16} /> Back to cart
        </Link>
        {cart.restaurant_name && (
          <span className="checkout-restaurant">
            <ShoppingBag size={14} /> {cart.restaurant_name}
          </span>
        )}
      </div>

      <div className="checkout-grid">
        <div className="checkout-main">
          <CheckoutSection icon={MapPin} title="Delivery Address">
            {addressesLoading ? (
              <div className="address-grid">
                {[1, 2].map((i) => <div key={i} className="mini-skeleton" />)}
              </div>
            ) : (
              <div className="address-grid">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    selected={activeAddressId === addr.id}
                    onSelect={() => setSelectedAddress(addr.id)}
                  />
                ))}
                <button type="button" className="add-address-tile" onClick={() => setShowAddAddress(true)}>
                  <Plus size={19} />
                  <span>Add New Address</span>
                </button>
              </div>
            )}

            {showAddAddress && (
              <form className="address-form" onSubmit={addressForm.handleSubmit((data) => addAddressMutation.mutate(data))}>
                <div className="form-title">
                  <span>New Address</span>
                  <button type="button" onClick={() => setShowAddAddress(false)} aria-label="Close address form">
                    <X size={16} />
                  </button>
                </div>
                <div className="form-grid">
                  <label>
                    <span>Label</span>
                    <select {...addressForm.register('label')} style={fieldStyle}>
                      <option value="HOME">Home</option>
                      <option value="WORK">Work</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </label>
                  <label>
                    <span>Flat/House</span>
                    <input {...addressForm.register('flat_number')} placeholder="42, Silver Oak" style={fieldStyle} />
                    <FieldError message={addressForm.formState.errors.flat_number?.message} />
                  </label>
                  <label className="full-row">
                    <span>Address line</span>
                    <input {...addressForm.register('address_line')} placeholder="Street, area, city" style={fieldStyle} />
                    <FieldError message={addressForm.formState.errors.address_line?.message} />
                  </label>
                  <label>
                    <span>Pincode</span>
                    <input {...addressForm.register('pincode')} placeholder="208001" style={fieldStyle} />
                    <FieldError message={addressForm.formState.errors.pincode?.message} />
                  </label>
                  <label>
                    <span>Receiver phone</span>
                    <input {...addressForm.register('receiver_phone')} placeholder="9876543210" style={fieldStyle} />
                    <FieldError message={addressForm.formState.errors.receiver_phone?.message} />
                  </label>
                </div>
                <button type="submit" disabled={addAddressMutation.isPending} style={{ ...btnSaffron, width: 'auto', padding: '0 22px', height: 46 }}>
                  {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                </button>
              </form>
            )}
          </CheckoutSection>

          <CheckoutSection icon={MessageSquare} title="Delivery Instructions">
            <textarea
              value={deliveryNote}
              onChange={(event) => setDeliveryNote(event.target.value)}
              placeholder="Add notes like 'Don't ring the bell' or 'Leave at the gate'..."
              className="instruction-input"
              maxLength={180}
            />
          </CheckoutSection>

          <CheckoutSection icon={CreditCard} title="Payment Method">
            <div className="payment-panel">
              {PAYMENT_METHODS.map((method) => (
                <PaymentOption
                  key={method.value}
                  method={method}
                  selected={paymentMethod === method.value}
                  onSelect={() => setPaymentMethod(method.value)}
                />
              ))}
            </div>
          </CheckoutSection>
        </div>

        <OrderSummary
          cart={cart}
          items={cartItems}
          selectedAddress={selectedAddressObj}
          placingOrder={placingOrder}
          onPlaceOrder={handlePlaceOrder}
          disabled={placingOrder || isBelowMinimum || !activeAddressId}
        />
      </div>

      <CheckoutStyles />
    </div>
  );
}

function CheckoutSection({ icon: Icon, title, children }) {
  return (
    <section className="checkout-section">
      <h2 className="section-title">
        <Icon size={22} color={C.primary} />
        {title}
      </h2>
      {children}
    </section>
  );
}

function AddressCard({ address, selected, onSelect }) {
  const label = normalizeLabel(address.label);
  const Icon = addressIcons[address.label] || MapPin;

  return (
    <button type="button" className={`address-card ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <Icon size={22} color={selected ? C.primary : C.onSurfaceVariant} />
      <div>
        <div className="address-heading">
          <span>{label}</span>
          {selected && <CheckCircle size={20} fill={C.primary} color={C.primary} />}
        </div>
        <p>{formatAddress(address)}</p>
        {selected && <strong>Selected</strong>}
      </div>
    </button>
  );
}

function PaymentOption({ method, selected, onSelect }) {
  const Icon = paymentIcons[method.value] || CreditCard;

  return (
    <button type="button" className={`payment-option ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="payment-option-left">
        <Icon size={21} color={selected ? C.primary : C.onSurfaceVariant} />
        <div>
          <span>{method.label}</span>
          <p>{paymentDescriptions[method.value]}</p>
        </div>
      </div>
      {selected ? <CheckCircle size={19} fill={C.primary} color={C.primary} /> : <ChevronDown size={18} color={C.outline} />}
    </button>
  );
}

function OrderSummary({ cart, items, selectedAddress, placingOrder, onPlaceOrder, disabled }) {
  const subtotal = toNumber(cart.subtotal);
  const deliveryFee = toNumber(cart.delivery_fee);
  const total = toNumber(cart.total_amount) || subtotal + deliveryFee;
  const minOrderAmount = toNumber(cart.min_order_amount);
  const belowMinimum = toBoolean(cart.is_below_minimum);
  const addMoreAmount = Math.max(minOrderAmount - subtotal, 0);

  return (
    <aside className="checkout-summary">
      <div className="summary-card">
        <h2>Order Summary</h2>

        <div className="summary-items">
          {items.map((item) => (
            <div key={item.id} className="summary-item">
              <div>
                <span>{item.item_name || item.name || 'Menu item'}</span>
                <p>
                  Qty: {item.quantity || 1}
                  {item.variant_name ? ` • ${item.variant_name}` : ''}
                </p>
              </div>
              <strong>{formatCurrency(item.subtotal || toNumber(item.unit_price) * (item.quantity || 1))}</strong>
            </div>
          ))}
        </div>

        {cart.is_premium && (
          <div className="coupon-card">
            <Ticket size={21} />
            <div>
              <span>Revolut Gold Applied</span>
              <p>Premium delivery benefit active</p>
            </div>
          </div>
        )}

        {belowMinimum && (
          <div className="minimum-card">
            Add {formatCurrency(addMoreAmount)} more to reach the minimum order value.
          </div>
        )}

        <div className="summary-lines">
          <SummaryLine label="Item Total" value={formatCurrency(subtotal)} />
          <SummaryLine label="Delivery Fee" value={deliveryFee > 0 ? formatCurrency(deliveryFee) : 'FREE'} />
          {minOrderAmount > 0 && <SummaryLine label="Minimum Order" value={formatCurrency(minOrderAmount)} muted />}
        </div>

        {selectedAddress && (
          <div className="deliver-to">
            <MapPin size={15} />
            <span>Deliver to {normalizeLabel(selectedAddress.label)}</span>
          </div>
        )}

        <div className="to-pay-row">
          <span>To Pay</span>
          <strong>{formatCurrency(total)}</strong>
        </div>

        <button type="button" onClick={onPlaceOrder} disabled={disabled} className="place-order-btn">
          {placingOrder ? (
            <span className="button-spinner" />
          ) : (
            <>
              Place Order <span>•</span> {formatCurrency(total)} <ChevronRight size={22} />
            </>
          )}
        </button>

        <p className="terms-line">By placing the order, you agree to our Terms and Conditions.</p>
      </div>

      <div className="gold-card">
        <ShieldCheck size={24} color={C.primary} />
        <div>
          <span>Join Revolut Gold</span>
          <p>Save on delivery and unlock premium offers.</p>
        </div>
      </div>
    </aside>
  );
}

function SummaryLine({ label, value, muted = false }) {
  return (
    <div className={muted ? 'summary-line muted' : 'summary-line'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="checkout-shell">
      <div className="checkout-grid">
        <div className="checkout-main">
          {[1, 2, 3].map((i) => <div key={i} className="checkout-section skeleton-section" />)}
        </div>
        <div className="summary-card skeleton-summary" />
      </div>
      <CheckoutStyles />
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <small className="field-error">{message}</small>;
}

function normalizeLabel(label) {
  if (!label) return 'Address';
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
}

function formatAddress(address) {
  return [address.flat_number, address.address_line, address.pincode].filter(Boolean).join(', ');
}

const fieldStyle = {
  ...inputStyle,
  height: 48,
  borderRadius: 10,
  background: C.surfaceContainerLow,
};

function CheckoutStyles() {
  return (
    <style>{`
      .checkout-shell {
        width: 100%;
        max-width: 1600px;
        margin: 0 auto;
        padding: 32px ${S.gutter * 1.5}px 110px;
      }

      .checkout-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 22px;
      }

      .checkout-back-link,
      .checkout-restaurant {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        text-decoration: none;
        color: ${C.primary};
        font-family: Inter, sans-serif;
        font-size: 14px;
        font-weight: 700;
      }

      .checkout-restaurant {
        color: ${C.onSurfaceVariant};
        background: ${C.surfaceContainerLow};
        border: 1px solid ${C.outlineVariant};
        border-radius: 999px;
        padding: 8px 14px;
      }

      .checkout-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 420px;
        gap: 32px;
        align-items: start;
      }

      .checkout-main {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .checkout-section,
      .summary-card {
        background: ${C.surfaceContainerLowest};
        border: 1px solid ${C.outlineVariant};
        border-radius: 18px;
        box-shadow: 0 4px 20px rgba(29, 27, 32, 0.05);
      }

      .checkout-section {
        padding: 28px 32px 32px;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 26px;
        color: ${C.onSurface};
        font-family: Plus Jakarta Sans, sans-serif;
        font-size: 30px;
        font-weight: 800;
        line-height: 1.2;
      }

      .address-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      .address-card,
      .add-address-tile {
        min-height: 138px;
        border-radius: 14px;
        padding: 22px;
        cursor: pointer;
        transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
      }

      .address-card {
        display: grid;
        grid-template-columns: 24px minmax(0, 1fr);
        gap: 16px;
        text-align: left;
        border: 1.5px solid ${C.outlineVariant};
        background: #fff;
      }

      .address-card:hover,
      .payment-option:hover,
      .add-address-tile:hover {
        transform: translateY(-2px);
      }

      .address-card.selected {
        border: 2px solid ${C.primary};
        background: ${C.surfaceContainer};
      }

      .address-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        color: ${C.onSurface};
        font-family: Plus Jakarta Sans, sans-serif;
        font-size: 22px;
        font-weight: 800;
      }

      .address-card p {
        margin: 8px 0 10px;
        color: ${C.onSurfaceVariant};
        font-family: Inter, sans-serif;
        font-size: 15px;
        line-height: 1.5;
      }

      .address-card strong {
        color: ${C.primary};
        font-family: Inter, sans-serif;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .add-address-tile {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border: 2px dashed ${C.outlineVariant};
        background: transparent;
        color: ${C.outline};
        font-family: Plus Jakarta Sans, sans-serif;
        font-size: 20px;
        font-weight: 800;
      }

      .address-form {
        margin-top: 18px;
        padding: 22px;
        border: 1px solid ${C.outlineVariant};
        border-radius: 14px;
        background: ${C.surfaceContainerLow};
      }

      .form-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        color: ${C.onSurface};
        font-family: Plus Jakarta Sans, sans-serif;
        font-weight: 800;
      }

      .form-title button {
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 8px;
        background: #fff;
        color: ${C.onSurfaceVariant};
        cursor: pointer;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 18px;
      }

      .form-grid label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: ${C.onSurfaceVariant};
        font-family: Inter, sans-serif;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .form-grid .full-row {
        grid-column: 1 / -1;
      }

      .field-error {
        color: ${C.error};
        font-family: Inter, sans-serif;
        font-size: 12px;
        text-transform: none;
        letter-spacing: 0;
      }

      .instruction-input {
        width: 100%;
        min-height: 126px;
        resize: vertical;
        border: 1px solid ${C.outlineVariant};
        border-radius: 12px;
        background: ${C.surfaceContainerLow};
        color: ${C.onSurface};
        outline: none;
        padding: 18px 20px;
        font-family: Inter, sans-serif;
        font-size: 17px;
        line-height: 1.5;
      }

      .instruction-input:focus {
        border-color: ${C.primary};
      }

      .payment-panel {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .payment-option {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border: 1.5px solid ${C.outlineVariant};
        border-radius: 14px;
        background: #fff;
        padding: 18px 20px;
        cursor: pointer;
        transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
      }

      .payment-option.selected {
        border: 2px solid ${C.primary};
        background: ${C.surfaceContainer};
      }

      .payment-option-left {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
        text-align: left;
      }

      .payment-option span {
        color: ${C.onSurface};
        font-family: Plus Jakarta Sans, sans-serif;
        font-size: 18px;
        font-weight: 800;
      }

      .payment-option p {
        margin-top: 2px;
        color: ${C.onSurfaceVariant};
        font-family: Inter, sans-serif;
        font-size: 13px;
      }

      .checkout-summary {
        position: sticky;
        top: 84px;
        display: flex;
        flex-direction: column;
        gap: 22px;
      }

      .summary-card {
        padding: 32px;
      }

      .summary-card h2 {
        margin: 0 0 24px;
        color: ${C.onSurface};
        font-family: Plus Jakarta Sans, sans-serif;
        font-size: 30px;
        font-weight: 800;
      }

      .summary-items {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .summary-item,
      .summary-line,
      .to-pay-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }

      .summary-item span {
        color: ${C.onSurface};
        font-family: Inter, sans-serif;
        font-size: 16px;
        font-weight: 600;
      }

      .summary-item p,
      .terms-line,
      .gold-card p,
      .coupon-card p,
      .deliver-to {
        color: ${C.onSurfaceVariant};
        font-family: Inter, sans-serif;
        font-size: 13px;
      }

      .summary-item strong {
        color: ${C.onSurface};
        font-family: Inter, sans-serif;
        font-size: 16px;
        font-weight: 800;
        white-space: nowrap;
      }

      .coupon-card,
      .minimum-card,
      .gold-card {
        border-radius: 12px;
        padding: 16px;
      }

      .coupon-card {
        display: flex;
        gap: 12px;
        margin: 28px 0 20px;
        border: 1px solid #e8d198;
        background: #fff6dc;
        color: #7a5b00;
      }

      .coupon-card span,
      .gold-card span {
        font-family: Plus Jakarta Sans, sans-serif;
        font-size: 18px;
        font-weight: 800;
      }

      .minimum-card {
        margin-top: 20px;
        border: 1px solid ${C.errorContainer};
        background: ${C.errorContainer};
        color: ${C.onErrorContainer};
        font-family: Inter, sans-serif;
        font-size: 14px;
        font-weight: 700;
      }

      .summary-lines {
        margin-top: 28px;
        padding-top: 22px;
        border-top: 1px solid ${C.outlineVariant};
      }

      .summary-line {
        align-items: center;
        margin-bottom: 12px;
        color: ${C.onSurfaceVariant};
        font-family: Inter, sans-serif;
        font-size: 15px;
      }

      .summary-line strong {
        color: ${C.onSurface};
        font-weight: 700;
      }

      .summary-line.muted {
        font-size: 13px;
      }

      .deliver-to {
        display: flex;
        align-items: center;
        gap: 7px;
        margin: 8px 0 16px;
      }

      .to-pay-row {
        align-items: center;
        padding-top: 18px;
        border-top: 1px solid ${C.outlineVariant};
        color: ${C.onSurface};
        font-family: Plus Jakarta Sans, sans-serif;
        font-size: 28px;
        font-weight: 800;
      }

      .to-pay-row strong {
        font-size: 32px;
      }

      .place-order-btn {
        width: 100%;
        min-height: 64px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: 28px;
        border: 0;
        border-radius: 14px;
        background: ${C.saffron};
        color: ${C.onSurface};
        box-shadow: 0 12px 24px rgba(242, 110, 33, 0.22);
        cursor: pointer;
        font-family: Plus Jakarta Sans, sans-serif;
        font-size: 25px;
        font-weight: 800;
        transition: transform 0.18s ease, opacity 0.18s ease;
      }

      .place-order-btn:hover:not(:disabled) {
        transform: translateY(-2px);
      }

      .place-order-btn:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      .button-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(255, 255, 255, 0.45);
        border-top-color: #fff;
        border-radius: 999px;
        animation: spin 0.7s linear infinite;
      }

      .terms-line {
        margin-top: 18px;
        text-align: center;
      }

      .gold-card {
        display: flex;
        align-items: center;
        gap: 16px;
        border: 1px solid ${C.primaryFixed};
        background: ${C.surfaceContainer};
      }

      .gold-card span {
        color: ${C.primary};
      }

      .checkout-empty {
        min-height: 420px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: ${C.surfaceContainerLowest};
        border: 1px solid ${C.outlineVariant};
        border-radius: 18px;
      }

      .checkout-empty-icon {
        width: 76px;
        height: 76px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        border-radius: 999px;
        background: #fff3ed;
      }

      .mini-skeleton,
      .skeleton-section,
      .skeleton-summary {
        background: linear-gradient(90deg, ${C.surfaceContainer} 25%, ${C.surfaceContainerLow} 50%, ${C.surfaceContainer} 75%);
        background-size: 200% 100%;
        animation: skeleton 1.5s ease-in-out infinite;
      }

      .mini-skeleton {
        min-height: 138px;
        border-radius: 14px;
      }

      .skeleton-section {
        min-height: 220px;
      }

      .skeleton-summary {
        min-height: 520px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 1100px) {
        .checkout-grid {
          grid-template-columns: 1fr;
        }

        .checkout-summary {
          position: static;
        }
      }

      @media (max-width: 760px) {
        .checkout-shell {
          padding: 24px ${S.gutter}px 100px;
        }

        .checkout-title-row {
          align-items: flex-start;
          flex-direction: column;
        }

        .checkout-section,
        .summary-card {
          padding: 22px;
          border-radius: 16px;
        }

        .section-title,
        .summary-card h2 {
          font-size: 24px;
        }

        .address-grid,
        .form-grid {
          grid-template-columns: 1fr;
        }

        .place-order-btn {
          min-height: 58px;
          font-size: 20px;
        }

        .to-pay-row,
        .to-pay-row strong {
          font-size: 24px;
        }
      }
    `}</style>
  );
}
