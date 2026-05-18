import { useEffect, useMemo, useState } from 'react';
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { useMenuManagementStore } from '@/store/menuManagementStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, AlertCircle, ChevronRight, Eye, EyeOff, Store, FolderPlus } from 'lucide-react';
import { T, C, S } from '@/lib/stitch';
import { getApiError } from '@/lib/helpers';
import { formatCurrency, resolveMediaUrl } from '@/lib/utils';

const foodFallback = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=300&auto=format&fit=crop';

export default function RestaurantMenuPage() {
  const navigate = useNavigate();
  const { restaurant, isLoading: restaurantLoading, fetchMyRestaurant } = useRestaurantOwnerStore();
  const {
    categories,
    menuItems,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    deleteCategory,
    fetchMenuItems,
    deleteMenuItem,
    toggleMenuItemStatus,
  } = useMenuManagementStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [categoryForm, setCategoryForm] = useState({ name: '', order: 0 });

  useEffect(() => {
    fetchMyRestaurant().catch((err) => toast.error(getApiError(err, 'Failed to load restaurant')));
  }, [fetchMyRestaurant]);

  useEffect(() => {
    if (!restaurant?.id) return;
    fetchCategories(restaurant.id).catch((err) => toast.error(getApiError(err, 'Failed to load categories')));
  }, [restaurant?.id, fetchCategories]);

  useEffect(() => {
    if (!restaurant?.id) return;
    const params = selectedCategoryFilter === 'all' ? {} : { category: selectedCategoryFilter };
    fetchMenuItems(restaurant.id, params).catch((err) => toast.error(getApiError(err, 'Failed to load menu')));
  }, [restaurant?.id, selectedCategoryFilter, fetchMenuItems]);

  const filteredItems = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return menuItems;
    return menuItems.filter((item) => `${item.name || ''} ${item.description || ''}`.toLowerCase().includes(needle));
  }, [menuItems, searchTerm]);

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    const name = categoryForm.name.trim();
    if (!name) {
      toast.error('Category name is required');
      return;
    }

    try {
      await createCategory(restaurant.id, { name, order: Number(categoryForm.order || categories.length) });
      setCategoryForm({ name: '', order: 0 });
      toast.success('Category created');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to create category'));
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Delete this category? Menu items inside it may also be affected.')) return;
    try {
      await deleteCategory(restaurant.id, categoryId);
      if (selectedCategoryFilter === categoryId) setSelectedCategoryFilter('all');
      toast.success('Category deleted');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to delete category'));
    }
  };

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
      await toggleMenuItemStatus(restaurant.id, itemId);
      toast.success('Availability updated');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update item'));
    }
  };

  if (restaurantLoading && !restaurant) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${S.gutter}px`, display: 'grid', gap: 16 }}>
        {[1, 2, 3].map((i) => <div key={i} style={{ height: 120, background: C.surfaceContainer, borderRadius: 16 }} />)}
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ maxWidth: 760, margin: '48px auto', padding: `${S.gutter}px`, textAlign: 'center', background: '#fff', border: `1px solid ${C.outlineVariant}`, borderRadius: 16 }}>
        <Store size={44} color={C.saffron} style={{ margin: '0 auto 16px' }} />
        <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>Register Your Restaurant First</h1>
        <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 24px' }}>After setup, you can create categories, dishes, and variants here.</p>
        <button onClick={() => navigate('/restaurant/management')} style={{ padding: '12px 24px', background: C.saffron, color: '#fff', border: 'none', borderRadius: 12, ...T.labelLg, fontWeight: 700, cursor: 'pointer' }}>
          Register Restaurant
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S.gutter}px` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ ...T.headlineMd, color: C.onSurface, margin: 0 }}>Menu Management</h1>
          <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '6px 0 0' }}>{restaurant.name}</p>
        </div>
        <button
          onClick={() => navigate('/restaurant/menu/add')}
          disabled={categories.length === 0}
          title={categories.length === 0 ? 'Create a category first' : 'Add item'}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: categories.length ? C.saffron : C.surfaceContainer, color: categories.length ? '#fff' : C.onSurfaceVariant, border: 'none', borderRadius: 10, ...T.labelLg, fontWeight: 700, cursor: categories.length ? 'pointer' : 'not-allowed' }}
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', gap: 20, alignItems: 'start' }}>
        <aside style={{ background: '#fff', border: `1px solid ${C.outlineVariant}`, borderRadius: 16, padding: 18 }}>
          <h2 style={{ ...T.headlineSm, color: C.onSurface, margin: '0 0 14px' }}>Categories</h2>
          <form onSubmit={handleCreateCategory} style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            <input
              value={categoryForm.name}
              onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Add category, e.g. Starters"
              style={{ height: 42, padding: '0 12px', border: `1px solid ${C.outlineVariant}`, borderRadius: 10, ...T.bodySm, outline: 'none' }}
            />
            <button type="submit" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, height: 42, border: 'none', borderRadius: 10, background: C.primary, color: '#fff', ...T.labelLg, fontWeight: 700, cursor: 'pointer' }}>
              <FolderPlus size={16} /> Create Category
            </button>
          </form>

          <div style={{ display: 'grid', gap: 8 }}>
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: selectedCategoryFilter === 'all' ? C.primaryFixed : C.surfaceContainerLow, color: selectedCategoryFilter === 'all' ? C.primary : C.onSurfaceVariant, ...T.labelLg, fontWeight: 700 }}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: selectedCategoryFilter === cat.id ? C.primaryFixed : C.surfaceContainerLow, color: selectedCategoryFilter === cat.id ? C.primary : C.onSurfaceVariant, ...T.labelLg, fontWeight: 700 }}
                >
                  {cat.name}
                </button>
                <button onClick={() => handleDeleteCategory(cat.id)} title="Delete category" style={{ width: 38, height: 38, border: 'none', borderRadius: 10, background: C.errorContainer, color: C.onErrorContainer, cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(180px, 240px)', gap: 12, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search menu items"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={{ height: 46, padding: '0 14px', background: '#fff', border: `1px solid ${C.outlineVariant}`, borderRadius: 12, ...T.bodySm, outline: 'none' }}
            />
            <button onClick={() => navigate('/restaurant/menu/add')} disabled={categories.length === 0} style={{ height: 46, border: 'none', borderRadius: 12, background: categories.length ? C.saffron : C.surfaceContainer, color: categories.length ? '#fff' : C.onSurfaceVariant, ...T.labelLg, fontWeight: 700, cursor: categories.length ? 'pointer' : 'not-allowed' }}>
              Add Dish
            </button>
          </div>

          {error && !menuItems.length && (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <AlertCircle size={44} color={C.error} style={{ margin: '0 auto 16px' }} />
              <p style={{ ...T.bodySm, color: C.onSurfaceVariant }}>{getApiError(error, 'Failed to load menu items')}</p>
            </div>
          )}

          {!isLoading && categories.length === 0 && (
            <div style={{ background: '#fff', border: `1px solid ${C.outlineVariant}`, borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <h3 style={{ ...T.headlineSm, color: C.onSurface, margin: 0 }}>Create a category first</h3>
              <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '8px 0 0' }}>Menu items need a backend category id before they can be saved.</p>
            </div>
          )}

          {!isLoading && categories.length > 0 && filteredItems.length === 0 && !error && (
            <div style={{ background: '#fff', border: `1px solid ${C.outlineVariant}`, borderRadius: 16, padding: 40, textAlign: 'center' }}>
              <p style={{ ...T.headlineSm, color: C.onSurfaceVariant, margin: 0 }}>No menu items found</p>
              <button onClick={() => navigate('/restaurant/menu/add')} style={{ marginTop: 16, padding: '10px 22px', background: C.saffron, color: '#fff', border: 'none', borderRadius: 10, ...T.labelLg, fontWeight: 700, cursor: 'pointer' }}>
                Add First Dish
              </button>
            </div>
          )}

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
        </section>
      </div>
    </div>
  );
}

function MenuItemCard({ item, onEdit, onDelete, onToggle, onViewVariants }) {
  const variants = item.variants || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr auto', gap: 16, padding: 16, background: '#fff', border: `1px solid ${C.outlineVariant}`, borderRadius: 16, alignItems: 'center' }}>
      <img src={resolveMediaUrl(item.image) || foodFallback} alt={item.name} style={{ width: 96, height: 96, borderRadius: 12, objectFit: 'cover', background: C.surfaceContainer }} onError={(event) => { event.currentTarget.src = foodFallback; }} />

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ width: 18, height: 18, border: `2px solid ${item.is_veg ? '#16A34A' : C.error}`, color: item.is_veg ? '#16A34A' : C.error, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, ...T.labelSm, fontWeight: 800 }}>
            {item.is_veg ? 'V' : 'N'}
          </span>
          <h3 style={{ ...T.titleMd, fontWeight: 800, color: C.onSurface, margin: 0 }}>{item.name}</h3>
          {item.is_bestseller && <span style={{ ...T.labelSm, background: '#FFF3E8', color: C.saffron, padding: '3px 8px', borderRadius: 999, fontWeight: 800 }}>Bestseller</span>}
          <span style={{ ...T.labelSm, background: item.is_available ? '#D1FAE5' : C.errorContainer, color: item.is_available ? '#065F46' : C.onErrorContainer, padding: '3px 8px', borderRadius: 999, fontWeight: 800 }}>
            {item.is_available ? 'Available' : 'Hidden'}
          </span>
        </div>

        <p style={{ ...T.bodySm, color: C.onSurfaceVariant, margin: '4px 0', maxWidth: 560 }}>{item.description || 'No description added'}</p>
        <div style={{ display: 'flex', gap: 18, marginTop: 10, flexWrap: 'wrap' }}>
          <p style={{ ...T.labelLg, fontWeight: 800, color: C.onSurface, margin: 0 }}>{formatCurrency(item.effective_price || item.base_price)}</p>
          <p style={{ ...T.labelMd, color: C.onSurfaceVariant, margin: 0 }}>{variants.length} variants</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <IconButton onClick={onToggle} title={item.is_available ? 'Mark unavailable' : 'Mark available'} bg={item.is_available ? C.teal : C.surfaceContainer} color={item.is_available ? '#fff' : C.onSurfaceVariant}>
          {item.is_available ? <Eye size={18} /> : <EyeOff size={18} />}
        </IconButton>
        <IconButton onClick={onViewVariants} title="Manage variants" bg={C.surfaceContainer} color={C.primary}>
          <ChevronRight size={18} />
        </IconButton>
        <IconButton onClick={onEdit} title="Edit item" bg={C.primary} color="#fff">
          <Edit size={18} />
        </IconButton>
        <IconButton onClick={onDelete} title="Delete item" bg={C.error} color="#fff">
          <Trash2 size={18} />
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({ children, onClick, title, bg, color }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: bg, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </button>
  );
}
