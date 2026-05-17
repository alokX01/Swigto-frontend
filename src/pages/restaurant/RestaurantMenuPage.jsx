import { useEffect, useState } from 'react';
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { useMenuManagementStore } from '@/store/menuManagementStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, AlertCircle, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { T, C, S } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';
import { formatCurrency } from '@/lib/utils';

export default function RestaurantMenuPage() {
  const navigate = useNavigate();
  const { restaurant } = useRestaurantOwnerStore();
  const { 
    menuItems, 
    isLoading, 
    error, 
    fetchMenuItems, 
    deleteMenuItem, 
    toggleMenuItem 
  } = useMenuManagementStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  useEffect(() => {
    if (restaurant?.id) {
      fetchMenuItems(restaurant.id).catch((err) => 
        toast.error(getApiError(err, 'Failed to load menu'))
      );
    }
  }, [restaurant?.id, fetchMenuItems]);

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await deleteMenuItem(restaurant.id, itemId);
      toast.success('Menu item deleted');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to delete item'));
    }
  };

  const handleToggle = async (itemId) => {
    try {
      await toggleMenuItem(restaurant.id, itemId);
      toast.success('Availability updated');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update'));
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (!restaurant) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${S.gutter}px`, textAlign: 'center' }}>
        <h1 style={{ ...T.headlineMd, color: C.onSurface, marginBottom: 8 }}>Register Your Restaurant First</h1>
        <p style={{ ...T.bodyMd, color: C.onSurfaceVariant, marginBottom: 24 }}>You must register your restaurant details before managing the menu.</p>
        <button 
          onClick={() => navigate('/restaurant/management')}
          style={{
            padding: '12px 24px',
            background: C.saffron || '#F26E21',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            ...T.labelLg,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Register Restaurant
        </button>
      </div>
    );
  }

  if (isLoading && !menuItems.length) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${S.gutter}px` }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 100, background: C.surfaceContainer, borderRadius: 12, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${S.gutter}px` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ ...T.headlineLg, color: C.onSurface, margin: 0 }}>Menu Items</h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 0 0' }}>
            Manage your restaurant's menu
          </p>
        </div>
        <button
          onClick={() => navigate('/restaurant/menu/add')}
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
          }}
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            height: 44,
            padding: '8px 12px',
            background: '#fff',
            border: `1px solid ${C.outline}`,
            borderRadius: 8,
            ...T.bodySm,
            fontFamily: 'inherit',
          }}
        />
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          style={{
            height: 44,
            padding: '8px 12px',
            background: '#fff',
            border: `1px solid ${C.outline}`,
            borderRadius: 8,
            ...T.bodySm,
            fontFamily: 'inherit',
          }}
        >
          <option value="all">All Categories</option>
          {/* Categories will be populated from API */}
        </select>
      </div>

      {/* Error State */}
      {error && !menuItems.length && (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <AlertCircle size={48} color={C.error} style={{ margin: '0 auto 16px' }} />
          <p style={{ ...T.bodyMd, color: C.onSurfaceVariant }}>
            {getApiError(error, 'Failed to load menu items')}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !menuItems.length && !error && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ ...T.headlineMd, color: C.onSurfaceVariant, margin: 0 }}>No menu items yet</p>
          <button
            onClick={() => navigate('/restaurant/menu/add')}
            style={{
              marginTop: 16,
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
            Add First Item
          </button>
        </div>
      )}

      {/* Menu Items List */}
      <div style={{ display: 'grid', gap: 12 }}>
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onEdit={() => navigate(`/restaurant/menu/edit/${item.id}`)}
            onDelete={() => handleDelete(item.id)}
            onToggle={() => handleToggle(item.id)}
            onViewVariants={() => navigate(`/restaurant/menu/${item.id}/variants`)}
          />
        ))}
      </div>

      {/* Results Count */}
      {menuItems.length > 0 && (
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant }}>
            Showing {filteredItems.length} of {menuItems.length} items
          </p>
        </div>
      )}
    </div>
  );
}

function MenuItemCard({ item, onEdit, onDelete, onToggle, onViewVariants }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 16,
        padding: 16,
        background: C.surface,
        border: `1px solid ${C.outlineVariant}`,
        borderRadius: 12,
        alignItems: 'center',
      }}
    >
      {/* Item Image */}
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            objectFit: 'cover',
          }}
        />
      )}

      {/* Item Details */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h3 style={{ ...T.titleMd, fontWeight: 700, color: C.onSurface, margin: 0 }}>
            {item.name}
          </h3>
          {item.is_veg && (
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: `2px solid #4CAF50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: '#4CAF50',
                fontWeight: 700,
              }}
            >
              •
            </div>
          )}
          {item.is_bestseller && (
            <span style={{ ...T.labelXs, background: C.saffron, color: '#fff', padding: '2px 8px', borderRadius: 12 }}>
              Bestseller
            </span>
          )}
        </div>

        <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '4px 0', maxWidth: 400 }}>
          {item.description}
        </p>

        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <div>
            <span style={{ ...T.labelXs, color: C.onSurfaceVariant }}>Base Price</span>
            <p style={{ ...T.labelMd, fontWeight: 700, color: C.onSurface, margin: '2px 0 0 0' }}>
              {formatCurrency(item.base_price)}
            </p>
          </div>
          {item.has_variants && (
            <div>
              <span style={{ ...T.labelXs, color: C.onSurfaceVariant }}>Variants</span>
              <p style={{ ...T.labelMd, fontWeight: 700, color: C.primary, margin: '2px 0 0 0' }}>
                Yes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onToggle}
          title={item.is_available ? 'Mark unavailable' : 'Mark available'}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: 'none',
            background: item.is_available ? C.teal : C.surfaceContainer,
            color: item.is_available ? '#fff' : C.onSurfaceVariant,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.is_available ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>

        {item.has_variants && (
          <button
            onClick={onViewVariants}
            title="Manage variants"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: 'none',
              background: C.surfaceContainer,
              color: C.onSurfaceVariant,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={18} />
          </button>
        )}

        <button
          onClick={onEdit}
          title="Edit item"
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
          title="Delete item"
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
