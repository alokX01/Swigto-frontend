import { useEffect, useState } from 'react';
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Edit, Power, AlertCircle, MapPin, Clock, DollarSign, UtensilsCrossed, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { T, C, S } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';

const CUISINE_TYPES = [
  { value: 'NORTH_INDIAN', label: 'North Indian' },
  { value: 'SOUTH_INDIAN', label: 'South Indian' },
  { value: 'CHINESE', label: 'Chinese' },
  { value: 'ITALIAN', label: 'Italian' },
  { value: 'STREET_FOOD', label: 'Street Food & Chaat' },
  { value: 'BIRYANI', label: 'Biryani' },
  { value: 'PIZZA', label: 'Pizza' },
  { value: 'BURGER', label: 'Burgers & Fast Food' },
  { value: 'DESSERTS', label: 'Desserts & Mithai' },
  { value: 'BEVERAGES', label: 'Beverages' },
  { value: 'VEGETARIAN', label: 'Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
  { value: 'OTHER', label: 'Other' },
];

const restaurantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  cuisine_type: z.string().min(1, 'Select a cuisine type'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  phone: z.string().length(10, 'Phone must be 10 digits'),
  avg_preparing_time: z.coerce.number().min(5, 'Min preparing time is 5 mins'),
  min_order_amount: z.coerce.number().min(0, 'Min order must be positive'),
});

export default function RestaurantManagementPage() {
  const navigate = useNavigate();
  const { restaurant, isLoading, error, fetchMyRestaurant, updateRestaurant, toggleRestaurantStatus } = useRestaurantOwnerStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const form = useForm({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant?.name || '',
      description: restaurant?.description || '',
      cuisine_type: restaurant?.cuisine_type || '',
      address: restaurant?.address || '',
      city: restaurant?.city || '',
      pincode: restaurant?.pincode || '',
      phone: restaurant?.phone || '',
      avg_preparing_time: restaurant?.avg_preparing_time || 30,
      min_order_amount: restaurant?.min_order_amount || 0,
    },
  });

  useEffect(() => {
    fetchMyRestaurant().catch((err) => toast.error(getApiError(err, 'Failed to load restaurant')));
  }, [fetchMyRestaurant]);

  useEffect(() => {
    if (restaurant) {
      form.reset({
        name: restaurant.name || '',
        description: restaurant.description || '',
        cuisine_type: restaurant.cuisine_type || '',
        address: restaurant.address || '',
        city: restaurant.city || '',
        pincode: restaurant.pincode || '',
        phone: restaurant.phone || '',
        avg_preparing_time: restaurant.avg_preparing_time || 30,
        min_order_amount: restaurant.min_order_amount || 0,
      });
    }
  }, [restaurant, form]);

  const onSubmit = async (data) => {
    try {
      await updateRestaurant(restaurant.id, data);
      toast.success('Restaurant updated successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update restaurant'));
    }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm(`${restaurant?.is_open ? 'Close' : 'Open'} your restaurant?`)) return;
    setIsTogglingStatus(true);
    try {
      await toggleRestaurantStatus(restaurant.id);
      toast.success(`Restaurant ${restaurant?.is_open ? 'closed' : 'opened'}`);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update status'));
    } finally {
      setIsTogglingStatus(false);
    }
  };

  if (isLoading && !restaurant) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${S.gutter}px` }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 150, background: C.surfaceContainer, borderRadius: 12, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${S.gutter}px`, textAlign: 'center' }}>
        <AlertCircle size={48} color={C.error} style={{ margin: '24px auto' }} />
        <p style={{ ...T.bodyMd, color: C.onSurfaceVariant }}>{getApiError(error, 'Failed to load restaurant')}</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${S.gutter}px`, textAlign: 'center' }}>
        <UtensilsCrossed size={48} color={C.onSurfaceVariant} style={{ margin: '24px auto' }} />
        <p style={{ ...T.bodyMd, color: C.onSurfaceVariant }}>No restaurant found. Create one first.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${S.gutter}px` }}>
      {/* Restaurant Header */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ ...T.headlineLg, color: C.onSurface, margin: 0 }}>{restaurant.name}</h1>
            <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 0 0' }}>Manage your restaurant</p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: C.saffron,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  ...T.labelMd,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Edit size={18} /> Edit
              </button>
            )}

            <button
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: restaurant.is_open ? C.error : '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                ...T.labelMd,
                fontWeight: 600,
                cursor: isTogglingStatus ? 'not-allowed' : 'pointer',
                opacity: isTogglingStatus ? 0.6 : 1,
              }}
            >
              <Power size={18} /> {restaurant.is_open ? 'Close' : 'Open'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, background: C.surfaceContainerLow, borderRadius: 8 }}>
            <p style={{ ...T.labelXs, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>Cuisine</p>
            <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '6px 0 0 0' }}>
              {CUISINE_TYPES.find((c) => c.value === restaurant.cuisine_type)?.label || 'Other'}
            </p>
          </div>

          <div style={{ padding: 12, background: C.surfaceContainerLow, borderRadius: 8 }}>
            <p style={{ ...T.labelXs, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>Avg Rating</p>
            <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '6px 0 0 0' }}>
              {restaurant.average_rating || 'N/A'} ⭐
            </p>
          </div>

          <div style={{ padding: 12, background: C.surfaceContainerLow, borderRadius: 8 }}>
            <p style={{ ...T.labelXs, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>Avg Prep Time</p>
            <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '6px 0 0 0' }}>
              {restaurant.avg_preparing_time} mins
            </p>
          </div>

          <div style={{ padding: 12, background: C.surfaceContainerLow, borderRadius: 8 }}>
            <p style={{ ...T.labelXs, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>Min Order</p>
            <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '6px 0 0 0' }}>
              ₹{restaurant.min_order_amount}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form or Details */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24 }}>
        <h2 style={{ ...T.titleLg, fontWeight: 700, color: C.onSurface, margin: '0 0 24px 0' }}>
          {isEditing ? 'Edit Restaurant Details' : 'Restaurant Details'}
        </h2>

        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Basic Info */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Restaurant Name *
                  </label>
                  <input
                    {...form.register('name')}
                    placeholder="Your restaurant name"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '8px 12px',
                      background: '#fff',
                      border: `1px solid ${C.outline}`,
                      borderRadius: 8,
                      ...T.bodySm,
                      fontFamily: 'inherit',
                    }}
                  />
                  {form.formState.errors.name && (
                    <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                      {form.formState.errors.name.message}
                    </small>
                  )}
                </div>

                <div>
                  <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Cuisine Type *
                  </label>
                  <select
                    {...form.register('cuisine_type')}
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '8px 12px',
                      background: '#fff',
                      border: `1px solid ${C.outline}`,
                      borderRadius: 8,
                      ...T.bodySm,
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="">Select Cuisine</option>
                    {CUISINE_TYPES.map((cuisine) => (
                      <option key={cuisine.value} value={cuisine.value}>
                        {cuisine.label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.cuisine_type && (
                    <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                      {form.formState.errors.cuisine_type.message}
                    </small>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  {...form.register('description')}
                  placeholder="Tell customers about your restaurant"
                  style={{
                    width: '100%',
                    height: 100,
                    padding: '8px 12px',
                    background: '#fff',
                    border: `1px solid ${C.outline}`,
                    borderRadius: 8,
                    ...T.bodySm,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Address Info */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>Address Information</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Address *
                </label>
                <input
                  {...form.register('address')}
                  placeholder="Street address"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '8px 12px',
                    background: '#fff',
                    border: `1px solid ${C.outline}`,
                    borderRadius: 8,
                    ...T.bodySm,
                    fontFamily: 'inherit',
                  }}
                />
                {form.formState.errors.address && (
                  <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                    {form.formState.errors.address.message}
                  </small>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    City *
                  </label>
                  <input
                    {...form.register('city')}
                    placeholder="City"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '8px 12px',
                      background: '#fff',
                      border: `1px solid ${C.outline}`,
                      borderRadius: 8,
                      ...T.bodySm,
                      fontFamily: 'inherit',
                    }}
                  />
                  {form.formState.errors.city && (
                    <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                      {form.formState.errors.city.message}
                    </small>
                  )}
                </div>

                <div>
                  <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Pincode *
                  </label>
                  <input
                    {...form.register('pincode')}
                    placeholder="208001"
                    maxLength="6"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '8px 12px',
                      background: '#fff',
                      border: `1px solid ${C.outline}`,
                      borderRadius: 8,
                      ...T.bodySm,
                      fontFamily: 'inherit',
                    }}
                  />
                  {form.formState.errors.pincode && (
                    <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                      {form.formState.errors.pincode.message}
                    </small>
                  )}
                </div>

                <div>
                  <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Phone *
                  </label>
                  <input
                    {...form.register('phone')}
                    placeholder="9876543210"
                    maxLength="10"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '8px 12px',
                      background: '#fff',
                      border: `1px solid ${C.outline}`,
                      borderRadius: 8,
                      ...T.bodySm,
                      fontFamily: 'inherit',
                    }}
                  />
                  {form.formState.errors.phone && (
                    <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                      {form.formState.errors.phone.message}
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* Operations Info */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>Operations</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Avg Preparing Time (mins) *
                  </label>
                  <input
                    {...form.register('avg_preparing_time')}
                    type="number"
                    min="5"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '8px 12px',
                      background: '#fff',
                      border: `1px solid ${C.outline}`,
                      borderRadius: 8,
                      ...T.bodySm,
                      fontFamily: 'inherit',
                    }}
                  />
                  {form.formState.errors.avg_preparing_time && (
                    <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                      {form.formState.errors.avg_preparing_time.message}
                    </small>
                  )}
                </div>

                <div>
                  <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Min Order Amount (₹) *
                  </label>
                  <input
                    {...form.register('min_order_amount')}
                    type="number"
                    min="0"
                    step="10"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '8px 12px',
                      background: '#fff',
                      border: `1px solid ${C.outline}`,
                      borderRadius: 8,
                      ...T.bodySm,
                      fontFamily: 'inherit',
                    }}
                  />
                  {form.formState.errors.min_order_amount && (
                    <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                      {form.formState.errors.min_order_amount.message}
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '10px 24px',
                  background: C.saffron,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  ...T.labelMd,
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '10px 24px',
                  background: C.surfaceContainer,
                  color: C.onSurface,
                  border: 'none',
                  borderRadius: 8,
                  ...T.labelMd,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Basic Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <DetailCard icon={<UtensilsCrossed size={20} />} label="Cuisine Type" value={CUISINE_TYPES.find((c) => c.value === restaurant.cuisine_type)?.label || 'Other'} />
              <DetailCard label="Description" value={restaurant.description || 'Not provided'} />
            </div>

            {/* Address Info */}
            <DetailCard
              icon={<MapPin size={20} />}
              label="Address"
              value={`${restaurant.address}, ${restaurant.city}, ${restaurant.pincode}`}
            />

            {/* Contact Info */}
            <DetailCard icon={<Phone size={20} />} label="Phone" value={restaurant.phone} />

            {/* Operations Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <DetailCard icon={<Clock size={20} />} label="Avg Preparing Time" value={`${restaurant.avg_preparing_time} mins`} />
              <DetailCard icon={<DollarSign size={20} />} label="Min Order Amount" value={`₹${restaurant.min_order_amount}`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value }) {
  return (
    <div style={{ padding: 16, background: C.surfaceContainerLow, borderRadius: 12, display: 'flex', alignItems: 'start', gap: 12 }}>
      {icon && <div style={{ color: C.primary, marginTop: 2 }}>{icon}</div>}
      <div style={{ flex: 1 }}>
        <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '6px 0 0 0' }}>{value}</p>
      </div>
    </div>
  );
}
