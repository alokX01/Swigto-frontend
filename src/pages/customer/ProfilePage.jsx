import { useEffect, useState } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Edit, Plus, Trash2, MapPin, LogOut, AlertCircle, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@/lib/validators';
import { T, C, S } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { profile, addresses, isLoading, error, fetchProfile, fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useProfileStore();
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
    fetchProfile().catch((err) => toast.error(getApiError(err, 'Failed to load profile')));
    fetchAddresses().catch((err) => toast.error(getApiError(err, 'Failed to load addresses')));
  }, [fetchProfile, fetchAddresses]);

  const handleAddAddress = async (data) => {
    try {
      await addAddress(data);
      toast.success('Address added');
      setShowAddForm(false);
      addressForm.reset();
      await fetchAddresses();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to add address'));
    }
  };

  const handleUpdateAddress = async (id, data) => {
    try {
      await updateAddress(id, data);
      toast.success('Address updated');
      setEditingAddressId(null);
      addressForm.reset();
      await fetchAddresses();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update address'));
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      toast.success('Address deleted');
      await fetchAddresses();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to delete address'));
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      toast.success('Default address updated');
      await fetchAddresses();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to set default address'));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${S.gutter}px` }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 120, background: C.surfaceContainer, borderRadius: 12, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${S.gutter}px`, textAlign: 'center' }}>
        <AlertCircle size={48} color={C.error} style={{ margin: '24px auto' }} />
        <p style={{ ...T.bodyMd, color: C.onSurfaceVariant }}>{getApiError(error, 'Failed to load profile')}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${S.gutter}px` }}>
      {/* Profile Header */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ ...T.headlineLg, color: C.onSurface, margin: 0 }}>My Profile</h1>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: C.error,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              ...T.labelMd,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Profile Info Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 24, background: C.surfaceContainerLow, borderRadius: 12 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: C.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              ...T.headlineMd,
              fontWeight: 700,
            }}
          >
            {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ ...T.titleLg, fontWeight: 700, color: C.onSurface, margin: 0 }}>
              {user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...T.bodySm, color: C.onSurfaceVariant }}>
                <Mail size={16} /> {user?.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...T.bodySm, color: C.onSurfaceVariant }}>
                <Phone size={16} /> {user?.phone || 'Not added'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ ...T.titleLg, fontWeight: 700, color: C.onSurface, margin: 0 }}>Saved Addresses</h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
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
              <Plus size={18} /> Add Address
            </button>
          )}
        </div>

        {/* Add/Edit Address Form */}
        {(showAddForm || editingAddressId) && (
          <form
            onSubmit={addressForm.handleSubmit((data) => {
              if (editingAddressId) {
                handleUpdateAddress(editingAddressId, data);
              } else {
                handleAddAddress(data);
              }
            })}
            style={{ background: C.surfaceContainerLow, padding: 20, borderRadius: 12, marginBottom: 24 }}
          >
            <h3 style={{ ...T.labelLg, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>
              {editingAddressId ? 'Edit Address' : 'New Address'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Type
                </label>
                <select
                  {...addressForm.register('label')}
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
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Flat/House No
                </label>
                <input
                  {...addressForm.register('flat_number')}
                  placeholder="42, Silver Oak"
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
                {addressForm.formState.errors.flat_number && (
                  <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                    {addressForm.formState.errors.flat_number.message}
                  </small>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Address Line
              </label>
              <input
                {...addressForm.register('address_line')}
                placeholder="Street, area, city"
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
              {addressForm.formState.errors.address_line && (
                <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                  {addressForm.formState.errors.address_line.message}
                </small>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Pincode
                </label>
                <input
                  {...addressForm.register('pincode')}
                  placeholder="208001"
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
                {addressForm.formState.errors.pincode && (
                  <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                    {addressForm.formState.errors.pincode.message}
                  </small>
                )}
              </div>

              <div>
                <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Phone
                </label>
                <input
                  {...addressForm.register('receiver_phone')}
                  placeholder="9876543210"
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
                {addressForm.formState.errors.receiver_phone && (
                  <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                    {addressForm.formState.errors.receiver_phone.message}
                  </small>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  background: C.saffron,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  ...T.labelMd,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {editingAddressId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAddressId(null);
                  addressForm.reset();
                }}
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
        )}

        {/* Addresses List */}
        {addresses.length === 0 && !showAddForm && !editingAddressId ? (
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, textAlign: 'center', padding: 32 }}>
            No addresses added yet. Add one to make ordering faster!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {addresses.map((addr) => (
              <div key={addr.id} style={{ padding: 16, background: C.surfaceContainerLow, borderRadius: 12, border: `2px solid ${addr.is_default ? C.saffron : C.outlineVariant}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div>
                    <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: 0 }}>
                      {addr.label === 'HOME' ? 'ðŸ ' : addr.label === 'WORK' ? 'ðŸ’¼' : 'ðŸ“'} {addr.label}
                      {addr.is_default && <span style={{ ...T.labelXs, color: C.saffron, fontWeight: 700, marginLeft: 8 }}>DEFAULT</span>}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setEditingAddressId(addr.id);
                        addressForm.reset(addr);
                      }}
                      style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: C.primary }}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: C.error }}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0' }}>
                  {addr.flat_number}, {addr.address_line}, {addr.pincode}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...T.bodySm, color: C.onSurfaceVariant, marginTop: 8 }}>
                  <Phone size={14} /> {addr.receiver_phone}
                </div>

                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    style={{
                      marginTop: 12,
                      padding: '8px 12px',
                      background: C.surfaceContainer,
                      color: C.onSurface,
                      border: `1px solid ${C.outline}`,
                      borderRadius: 6,
                      ...T.labelXs,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
