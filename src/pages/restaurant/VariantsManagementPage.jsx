import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { useMenuManagementStore } from '@/store/menuManagementStore';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { T, C, S } from '@/lib/stitch';
import { getApiError, formatCurrency } from '@/lib/helpers';

export default function VariantsManagementPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { restaurant } = useRestaurantOwnerStore();
  const { selectedMenuItem, variants, isLoading, error, fetchMenuItem, fetchVariants, createVariant, updateVariant, deleteVariant } = useMenuManagementStore();
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: 0, is_available: true });

  useEffect(() => {
    if (restaurant?.id && itemId) {
      fetchMenuItem(restaurant.id, itemId);
      fetchVariants(restaurant.id, itemId);
    }
  }, [restaurant?.id, itemId, fetchMenuItem, fetchVariants]);

  const handleSaveVariant = async () => {
    if (!formData.name || formData.price < 0) {
      toast.error('Please fill all fields correctly');
      return;
    }

    try {
      if (editingId) {
        await updateVariant(restaurant.id, itemId, editingId, formData);
        toast.success('Variant updated');
      } else {
        await createVariant(restaurant.id, itemId, formData);
        toast.success('Variant created');
      }
      setFormData({ name: '', price: 0, is_available: true });
      setIsAddingVariant(false);
      setEditingId(null);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save variant'));
    }
  };

  const handleDelete = async (variantId) => {
    if (!window.confirm('Delete this variant?')) return;
    try {
      await deleteVariant(restaurant.id, itemId, variantId);
      toast.success('Variant deleted');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to delete variant'));
    }
  };

  const handleEdit = (variant) => {
    setFormData({ name: variant.name, price: variant.price, is_available: variant.is_available });
    setEditingId(variant.id);
    setIsAddingVariant(true);
  };

  if (isLoading && !selectedMenuItem) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: `${S.gutter}px` }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ height: 120, background: C.surfaceContainer, borderRadius: 12, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  if (error && !selectedMenuItem) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: `${S.gutter}px`, textAlign: 'center' }}>
        <AlertCircle size={48} color={C.error} style={{ margin: '24px auto' }} />
        <p style={{ ...T.bodyMd, color: C.onSurfaceVariant }}>{getApiError(error, 'Failed to load item')}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: `${S.gutter}px` }}>
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
            {selectedMenuItem?.name}
          </h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '4px 0 0 0' }}>
            Base Price: {formatCurrency(selectedMenuItem?.base_price || 0)}
          </p>
        </div>
      </div>

      {/* Add/Edit Variant Form */}
      {isAddingVariant && (
        <div style={{ background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '0 0 16px 0' }}>
            {editingId ? 'Edit Variant' : 'Add New Variant'}
          </h2>

          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Variant Name (e.g., Small, Large)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Large, Extra Cheese"
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

            <div>
              <label style={{ ...T.labelSm, color: C.onSurfaceVariant, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Price (₹)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                step="0.01"
                min="0"
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

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: C.surfaceContainerLow, borderRadius: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ ...T.labelSm, fontWeight: 600, color: C.onSurface }}>Available</span>
            </label>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSaveVariant}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px 16px',
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
                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Add Variant'}
              </button>
              <button
                onClick={() => {
                  setIsAddingVariant(false);
                  setEditingId(null);
                  setFormData({ name: '', price: 0, is_available: true });
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
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
          </div>
        </div>
      )}

      {/* Variants List */}
      {!isAddingVariant && (
        <button
          onClick={() => {
            setIsAddingVariant(true);
            setEditingId(null);
            setFormData({ name: '', price: 0, is_available: true });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: C.saffron,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            ...T.labelMd,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 24,
          }}
        >
          <Plus size={18} /> Add Variant
        </button>
      )}

      {/* Variants Grid */}
      <div style={{ display: 'grid', gap: 12 }}>
        {variants.map((variant) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            onEdit={() => handleEdit(variant)}
            onDelete={() => handleDelete(variant.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {!isAddingVariant && variants.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ ...T.headlineMd, color: C.onSurfaceVariant, margin: 0 }}>
            No variants added yet
          </p>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 0 0' }}>
            Create variants like Small, Large, etc.
          </p>
        </div>
      )}
    </div>
  );
}

function VariantCard({ variant, onEdit, onDelete }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        background: C.surface,
        border: `1px solid ${C.outlineVariant}`,
        borderRadius: 12,
      }}
    >
      <div>
        <h3 style={{ ...T.titleMd, fontWeight: 700, color: C.onSurface, margin: 0 }}>
          {variant.name}
        </h3>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <div>
            <span style={{ ...T.labelXs, color: C.onSurfaceVariant }}>Price</span>
            <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '2px 0 0 0' }}>
              ₹{variant.price}
            </p>
          </div>
          <div>
            <span style={{ ...T.labelXs, color: C.onSurfaceVariant }}>Status</span>
            <p style={{ ...T.labelMd, fontWeight: 700, color: variant.is_available ? C.teal : C.error, margin: '2px 0 0 0' }}>
              {variant.is_available ? 'Available' : 'Unavailable'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onEdit}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: 'none',
            background: C.primary,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Edit size={18} />
        </button>
        <button
          onClick={onDelete}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: 'none',
            background: C.error,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
