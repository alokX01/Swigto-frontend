import { useEffect, useState } from 'react';
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Edit, LogOut, AlertCircle, CheckCircle, Building2, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { T, C, S } from '@/lib/stitch';
import { getApiError, extractInitials } from '@/lib/helpers';

const restaurantOwnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  pan_number: z.string().optional(),
  gst_number: z.string().optional(),
});

export default function RestaurantOwnerProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { profile, isLoading, error, fetchProfile, updateProfile } = useRestaurantOwnerStore();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    resolver: zodResolver(restaurantOwnerSchema),
    defaultValues: {
      name: profile?.name || '',
      pan_number: profile?.pan_number || '',
      gst_number: profile?.gst_number || '',
    },
  });

  useEffect(() => {
    fetchProfile().catch((err) => toast.error(getApiError(err, 'Failed to load profile')));
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        pan_number: profile.pan_number || '',
        gst_number: profile.gst_number || '',
      });
    }
  }, [profile, form]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update profile'));
    }
  };

  if (isLoading && !profile) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${S.gutter}px` }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 120, background: C.surfaceContainer, borderRadius: 12, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  if (error && !profile) {
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
          <h1 style={{ ...T.headlineLg, color: C.onSurface, margin: 0 }}>Restaurant Owner Profile</h1>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 24, background: C.surfaceContainerLow, borderRadius: 12, marginBottom: 16 }}>
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
            {extractInitials(user?.first_name, user?.last_name)}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ ...T.titleLg, fontWeight: 700, color: C.onSurface, margin: 0 }}>
              {user?.first_name} {user?.last_name}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <div style={{ ...T.bodySm, color: C.onSurfaceVariant }}>
                <span style={{ fontWeight: 600 }}>Email:</span> {user?.email}
              </div>
              <div style={{ ...T.bodySm, color: C.onSurfaceVariant }}>
                <span style={{ fontWeight: 600 }}>Phone:</span> {user?.phone || 'Not added'}
              </div>
            </div>
          </div>

          {profile?.is_verified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#E8F5E9', borderRadius: 12 }}>
              <CheckCircle size={20} color="#2E7D32" />
              <span style={{ ...T.labelMd, fontWeight: 700, color: '#2E7D32' }}>Verified</span>
            </div>
          )}
        </div>

        {/* Business Details */}
        <div style={{ padding: 16, background: C.surfaceContainerLow, borderRadius: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>PAN Number</p>
              <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '8px 0 0 0' }}>
                {profile?.pan_number || 'Not provided'}
              </p>
            </div>
            <div>
              <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>GST Number</p>
              <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '8px 0 0 0' }}>
                {profile?.gst_number || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ ...T.titleLg, fontWeight: 700, color: C.onSurface, margin: 0 }}>Business Information</h2>
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
              <Edit size={18} /> Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Business Name *
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
                  PAN Number
                </label>
                <input
                  {...form.register('pan_number')}
                  placeholder="ABCDE1234F"
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
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                GST Number
              </label>
              <input
                {...form.register('gst_number')}
                placeholder="18AABCU9603R1Z5"
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
            </div>

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
            <div style={{ padding: 16, background: C.surfaceContainerLow, borderRadius: 12 }}>
              <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>Business Name</p>
              <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '8px 0 0 0' }}>
                {profile?.name || 'Not set'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, background: C.surfaceContainerLow, borderRadius: 12 }}>
                <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>PAN Number</p>
                <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '8px 0 0 0' }}>
                  {profile?.pan_number || 'Not set'}
                </p>
              </div>

              <div style={{ padding: 16, background: C.surfaceContainerLow, borderRadius: 12 }}>
                <p style={{ ...T.labelSm, color: C.onSurfaceVariant, margin: 0, fontWeight: 600 }}>GST Number</p>
                <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '8px 0 0 0' }}>
                  {profile?.gst_number || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
