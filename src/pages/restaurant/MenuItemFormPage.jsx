import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { useMenuManagementStore } from '@/store/menuManagementStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, AlertCircle, Store } from 'lucide-react';
import { T, C, S } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';
import { resolveMediaUrl } from '@/lib/utils';
import { toFormData } from '@/lib/formData';

const imageFallback = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop';

const menuItemSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  base_price: z.coerce.number().positive('Price must be greater than 0'),
  is_veg: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_available: z.boolean().default(true),
  category: z.string().min(1, 'Select a category'),
  order: z.coerce.number().min(0).optional(),
});

export default function MenuItemFormPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const { restaurant, isLoading: restaurantLoading, fetchMyRestaurant } = useRestaurantOwnerStore();
  const {
    categories,
    selectedMenuItem,
    isLoading,
    error,
    fetchCategories,
    fetchMenuItem,
    createMenuItem,
    updateMenuItem,
  } = useMenuManagementStore();

  const form = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      base_price: 1,
      is_veg: false,
      is_bestseller: false,
      is_available: true,
      category: '',
      order: 0,
    },
  });

  const imagePreview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ''), [imageFile]);
  const currentImage = imagePreview || selectedMenuItem?.image || '';

  useEffect(() => {
    fetchMyRestaurant().catch((err) => toast.error(getApiError(err, 'Failed to load restaurant')));
  }, [fetchMyRestaurant]);

  useEffect(() => {
    if (restaurant?.id) {
      fetchCategories(restaurant.id).catch((err) => toast.error(getApiError(err, 'Failed to load categories')));
    }
  }, [restaurant?.id, fetchCategories]);

  useEffect(() => {
    if (itemId && restaurant?.id) {
      fetchMenuItem(restaurant.id, itemId).catch((err) => toast.error(getApiError(err, 'Failed to load item')));
    }
  }, [itemId, restaurant?.id, fetchMenuItem]);

  useEffect(() => {
    if (!itemId && categories.length && !form.getValues('category')) {
      form.setValue('category', categories[0].id, { shouldValidate: true });
    }
  }, [itemId, categories, form]);

  useEffect(() => {
    if (!itemId || !selectedMenuItem) return;
    const inferredCategory = categories.find((cat) => (cat.items || []).some((item) => item.id === selectedMenuItem.id))?.id || selectedMenuItem.category || '';
    form.reset({
      name: selectedMenuItem.name || '',
      description: selectedMenuItem.description || '',
      base_price: Number.parseFloat(selectedMenuItem.base_price || selectedMenuItem.effective_price || 1),
      is_veg: Boolean(selectedMenuItem.is_veg),
      is_bestseller: Boolean(selectedMenuItem.is_bestseller),
      is_available: selectedMenuItem.is_available !== false,
      category: inferredCategory,
      order: Number(selectedMenuItem.order || 0),
    });
  }, [itemId, selectedMenuItem, categories, form]);

  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      event.target.value = '';
      return;
    }
    setImageFile(file);
  };

  const onSubmit = async (data) => {
    if (!restaurant?.id) {
      toast.error('Register your restaurant first');
      return;
    }

    const payload = toFormData({
      name: data.name.trim(),
      description: data.description?.trim() || '',
      image: imageFile,
      base_price: String(data.base_price),
      is_veg: Boolean(data.is_veg),
      is_bestseller: Boolean(data.is_bestseller),
      is_available: Boolean(data.is_available),
      order: Number(data.order || 0),
      category: data.category,
    });

    try {
      if (itemId) {
        await updateMenuItem(restaurant.id, itemId, payload);
        toast.success('Menu item updated');
      } else {
        await createMenuItem(restaurant.id, payload);
        toast.success('Menu item created');
      }
      navigate('/restaurant/menu');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save item'));
    }
  };

  if (restaurantLoading && !restaurant) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: `${S.gutter}px`, display: 'grid', gap: 16 }}>
        {[1, 2, 3].map((i) => <div key={i} style={{ height: 120, background: C.surfaceContainer, borderRadius: 16 }} />)}
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ maxWidth: 720, margin: '48px auto', padding: `${S.gutter}px`, textAlign: 'center', background: '#fff', border: `1px solid ${C.outlineVariant}`, borderRadius: 16 }}>
        <Store size={44} color={C.saffron} style={{ margin: '0 auto 16px' }} />
        <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>Register Your Restaurant First</h1>
        <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 24px' }}>You need a restaurant profile before adding dishes.</p>
        <button onClick={() => navigate('/restaurant/management')} style={{ padding: '12px 24px', background: C.saffron, color: '#fff', border: 'none', borderRadius: 12, ...T.labelLg, fontWeight: 700, cursor: 'pointer' }}>
          Register Restaurant
        </button>
      </div>
    );
  }

  if (error && !selectedMenuItem && itemId) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: `${S.gutter}px`, textAlign: 'center' }}>
        <AlertCircle size={48} color={C.error} style={{ margin: '24px auto' }} />
        <p style={{ ...T.bodySm, color: C.onSurfaceVariant }}>{getApiError(error, 'Failed to load item')}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: `${S.gutter}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/restaurant/menu')} style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: C.surfaceContainer, color: C.onSurface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>{itemId ? 'Edit Menu Item' : 'Add Menu Item'}</h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '4px 0 0' }}>{restaurant.name}</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div style={{ background: '#fff', border: `1px solid ${C.outlineVariant}`, borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <h2 style={{ ...T.headlineSm, color: C.onSurface, margin: 0 }}>Create a category first</h2>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 20px' }}>The backend requires every menu item to belong to a category.</p>
          <button onClick={() => navigate('/restaurant/menu')} style={{ padding: '10px 20px', background: C.saffron, color: '#fff', border: 'none', borderRadius: 10, ...T.labelLg, fontWeight: 700, cursor: 'pointer' }}>
            Go to Categories
          </button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'grid', gap: 18 }}>
          <section style={sectionStyle}>
            <h2 style={sectionHeading}>Image</h2>
            <img src={resolveMediaUrl(currentImage) || imageFallback} alt="Menu preview" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 12, background: C.surfaceContainer }} onError={(event) => { event.currentTarget.src = imageFallback; }} />
            <Field label="Item Image">
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ ...inputStyle, paddingTop: 10 }} />
            </Field>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionHeading}>Basic Information</h2>
            <Field label="Item Name" error={form.formState.errors.name?.message}>
              <input {...form.register('name')} placeholder="e.g. Paneer Tikka Platter" style={inputStyle} />
            </Field>
            <Field label="Description">
              <textarea {...form.register('description')} placeholder="Ingredients, taste notes, portion size" style={{ ...inputStyle, height: 96, paddingTop: 12, resize: 'vertical' }} />
            </Field>
            <Field label="Base Price (INR)" error={form.formState.errors.base_price?.message}>
              <input {...form.register('base_price')} type="number" step="0.01" min="1" style={inputStyle} />
            </Field>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionHeading}>Category & Attributes</h2>
            <Field label="Category" error={form.formState.errors.category?.message}>
              <select {...form.register('category')} style={inputStyle}>
                <option value="">Select Category</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
              <CheckField label="Vegetarian" register={form.register('is_veg')} />
              <CheckField label="Bestseller" register={form.register('is_bestseller')} />
              <CheckField label="Available" register={form.register('is_available')} />
            </div>

            <div style={{ marginTop: 14 }}>
              <Field label="Display Order">
                <input {...form.register('order')} type="number" min="0" style={inputStyle} />
              </Field>
            </div>
          </section>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={isLoading} style={{ flex: 1, padding: '12px 24px', background: C.saffron, color: '#fff', border: 'none', borderRadius: 10, ...T.labelLg, fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.65 : 1 }}>
              {isLoading ? 'Saving...' : itemId ? 'Update Item' : 'Create Item'}
            </button>
            <button type="button" onClick={() => navigate('/restaurant/menu')} style={{ flex: 1, padding: '12px 24px', background: C.surfaceContainer, color: C.onSurface, border: 'none', borderRadius: 10, ...T.labelLg, fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const sectionStyle = {
  background: '#fff',
  border: `1px solid ${C.outlineVariant}`,
  borderRadius: 16,
  padding: 20,
};

const sectionHeading = {
  ...T.headlineSm,
  color: C.onSurface,
  margin: '0 0 16px',
};

const inputStyle = {
  width: '100%',
  minHeight: 46,
  padding: '0 14px',
  background: '#fff',
  border: `1px solid ${C.outlineVariant}`,
  borderRadius: 10,
  ...T.bodySm,
  outline: 'none',
};

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 800, textTransform: 'uppercase' }}>{label}</label>
      {children}
      {error && <small style={{ color: C.error, display: 'block', marginTop: 4 }}>{error}</small>}
    </div>
  );
}

function CheckField({ label, register }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: C.surfaceContainerLow, borderRadius: 10, cursor: 'pointer' }}>
      <input {...register} type="checkbox" style={{ width: 18, height: 18, cursor: 'pointer' }} />
      <span style={{ ...T.labelSm, fontWeight: 800, color: C.onSurface }}>{label}</span>
    </label>
  );
}
