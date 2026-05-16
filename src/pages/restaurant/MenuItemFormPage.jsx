import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { useMenuManagementStore } from '@/store/menuManagementStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { T, C, S } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  base_price: z.coerce.number().min(0, 'Price must be positive'),
  is_veg: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_available: z.boolean().default(true),
  category: z.string().optional(),
  order: z.coerce.number().optional(),
  image: z.string().optional(),
});

export default function MenuItemFormPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { restaurant } = useRestaurantOwnerStore();
  const { categories, selectedMenuItem, isLoading, error, fetchCategories, fetchMenuItem, createMenuItem, updateMenuItem } = useMenuManagementStore();
  const [imagePreview, setImagePreview] = useState('');

  const form = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      base_price: 0,
      is_veg: false,
      is_bestseller: false,
      is_available: true,
      category: '',
      order: 0,
      image: '',
    },
  });

  useEffect(() => {
    if (restaurant?.id) {
      fetchCategories(restaurant.id);
    }
  }, [restaurant?.id, fetchCategories]);

  useEffect(() => {
    if (itemId && restaurant?.id) {
      fetchMenuItem(restaurant.id, itemId).then((item) => {
        form.reset({
          name: item.name,
          description: item.description,
          base_price: item.base_price,
          is_veg: item.is_veg,
          is_bestseller: item.is_bestseller,
          is_available: item.is_available,
          category: item.category || '',
          order: item.order || 0,
          image: item.image || '',
        });
        if (item.image) setImagePreview(item.image);
      });
    }
  }, [itemId, restaurant?.id, fetchMenuItem, form]);

  const onSubmit = async (data) => {
    try {
      if (itemId) {
        await updateMenuItem(restaurant.id, itemId, data);
        toast.success('Menu item updated');
      } else {
        await createMenuItem(restaurant.id, data);
        toast.success('Menu item created');
      }
      navigate('/restaurant/menu');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save item'));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        form.setValue('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (error && !selectedMenuItem && itemId) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: `${S.gutter}px` }}>
        <AlertCircle size={48} color={C.error} style={{ margin: '24px auto' }} />
        <p style={{ ...T.bodyMd, color: C.onSurfaceVariant, textAlign: 'center' }}>
          {getApiError(error, 'Failed to load item')}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: `${S.gutter}px` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => navigate('/restaurant/menu')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: 'none',
            background: C.surfaceContainer,
            color: C.onSurface,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>
            {itemId ? 'Edit Menu Item' : 'Add Menu Item'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'grid', gap: 24 }}>
        {/* Image Upload */}
        <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 20 }}>
          <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 12, fontWeight: 600 }}>
            Item Image
          </label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              border: `2px dashed ${C.outline}`,
              borderRadius: 8,
              background: C.surfaceContainerLow,
              cursor: 'pointer',
              ...T.bodySm,
            }}
          />
        </div>

        {/* Basic Info */}
        <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 20 }}>
          <h2 style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>Basic Information</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Item Name *
            </label>
            <input
              {...form.register('name')}
              placeholder="e.g., Butter Chicken, Margherita Pizza"
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

          <div style={{ marginBottom: 16 }}>
            <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Description
            </label>
            <textarea
              {...form.register('description')}
              placeholder="Describe your item... (ingredients, preparation details, etc.)"
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

          <div style={{ marginBottom: 16 }}>
            <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Base Price (₹) *
            </label>
            <input
              {...form.register('base_price')}
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
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
            {form.formState.errors.base_price && (
              <small style={{ color: C.error, display: 'block', marginTop: 4 }}>
                {form.formState.errors.base_price.message}
              </small>
            )}
          </div>
        </div>

        {/* Category & Attributes */}
        <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 20 }}>
          <h2 style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>Category & Attributes</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Category
            </label>
            <select
              {...form.register('category')}
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
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: C.surfaceContainerLow, borderRadius: 8, cursor: 'pointer' }}>
              <input
                {...form.register('is_veg')}
                type="checkbox"
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ ...T.labelSm, fontWeight: 600, color: C.onSurface }}>Vegetarian</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: C.surfaceContainerLow, borderRadius: 8, cursor: 'pointer' }}>
              <input
                {...form.register('is_bestseller')}
                type="checkbox"
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ ...T.labelSm, fontWeight: 600, color: C.onSurface }}>Bestseller</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: C.surfaceContainerLow, borderRadius: 8, cursor: 'pointer' }}>
              <input
                {...form.register('is_available')}
                type="checkbox"
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ ...T.labelSm, fontWeight: 600, color: C.onSurface }}>Available</span>
            </label>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Display Order
            </label>
            <input
              {...form.register('order')}
              type="number"
              min="0"
              placeholder="0"
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
            <small style={{ ...T.labelXs, color: C.onSurfaceVariant, display: 'block', marginTop: 4 }}>
              Lower numbers appear first
            </small>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 24px',
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
            {isLoading ? 'Saving...' : itemId ? 'Update Item' : 'Create Item'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/restaurant/menu')}
            style={{
              flex: 1,
              padding: '12px 24px',
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
    </div>
  );
}
