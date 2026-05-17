import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantsAPI } from '@/api/restaurants';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { T, C, card, input as inputStyle, badge } from '@/lib/stitch';

const TEAL = '#0D9488';

export default function MenuPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { data: rData } = useQuery({ queryKey: ['myRestaurant'], queryFn: () => restaurantsAPI.getMyRestaurant().catch(err => {
    if (err.response?.status === 404) return { data: null };
    throw err;
  }) });
  const rId = rData?.data?.id;
  const { data: catData } = useQuery({ queryKey: ['categories', rId], queryFn: () => restaurantsAPI.getCategories(rId, { page_size: 50 }), enabled: !!rId });
  const { data: menuData } = useQuery({ queryKey: ['menuItems', rId], queryFn: () => restaurantsAPI.getMenuItems(rId, { page_size: 100 }), enabled: !!rId });
  const categories = catData?.data?.results || catData?.data || [];
  const menuItems = menuData?.data?.results || menuData?.data || [];
  const toggleM = useMutation({ mutationFn: (id) => restaurantsAPI.toggleMenuItem(rId, id), onSuccess: () => { toast.success('Toggled!'); queryClient.invalidateQueries(['menuItems']); } });
  const deleteM = useMutation({ mutationFn: (id) => restaurantsAPI.deleteMenuItem(rId, id), onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries(['menuItems']); } });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ ...T.headlineMd, color: C.onSurface }}>Menu Management</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', background: TEAL, color: '#fff', ...T.labelLg, fontWeight: 600 }}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      {showForm && <MenuItemForm rId={rId} categories={categories} onClose={() => setShowForm(false)} />}

      <div style={{ ...card, borderRadius: 16, overflow: 'hidden' }}>
        {menuItems.length === 0 ? <p style={{ textAlign: 'center', padding: '48px 0', ...T.bodySm, color: C.outline }}>No menu items yet. Add your first item!</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Item', 'Price', 'Type', 'Status', 'Actions'].map((h, i) => <th key={h} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '10px 16px', ...T.labelMd, fontWeight: 600, color: C.onSurfaceVariant, textTransform: 'uppercase' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id} style={{ borderTop: `1px solid ${C.surfaceContainer}` }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', background: C.surfaceContainer, flexShrink: 0 }}>
                        {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🍽️</div>}
                      </div>
                      <div>
                        <p style={{ ...T.labelLg, fontWeight: 500, color: C.onSurface }}>{item.name}</p>
                        {item.is_bestseller && <span style={{ ...T.labelSm, fontSize: 10, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 6px', borderRadius: 4 }}>★ Bestseller</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', ...T.labelLg, fontWeight: 500, color: C.onSurface }}>{formatCurrency(item.effective_price || item.base_price)}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ width: 14, height: 14, display: 'inline-block', borderRadius: 3, border: `2px solid ${item.is_veg ? '#22C55E' : '#EF4444'}` }} />
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => toggleM.mutate(item.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, ...T.labelMd, fontWeight: 600, padding: '3px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                        background: item.is_available ? '#D1FAE5' : '#FFDAD6', color: item.is_available ? '#065F46' : '#93000A' }}>
                      {item.is_available ? <><Eye size={12} /> Live</> : <><EyeOff size={12} /> Hidden</>}
                    </button>
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    <button onClick={() => deleteM.mutate(item.id)} style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: '#EF4444', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FFF1F2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MenuItemForm({ rId, categories, onClose }) {
  const [form, setForm] = useState({ name: '', description: '', base_price: '', is_veg: true, is_bestseller: false, category: categories[0]?.id || '' });
  const queryClient = useQueryClient();
  const create = useMutation({ mutationFn: (d) => restaurantsAPI.createMenuItem(rId, d), onSuccess: () => { toast.success('Created!'); onClose(); queryClient.invalidateQueries(['menuItems']); }, onError: (e) => toast.error(e.response?.data?.detail || 'Failed') });

  return (
    <div style={{ ...card, borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <h3 style={{ ...T.headlineSm, color: C.onSurface, marginBottom: 16 }}>Add Menu Item</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input placeholder="Item name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, height: 44, gridColumn: '1/-1' }} />
        <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, height: 44, gridColumn: '1/-1' }} />
        <input placeholder="Price" type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })} style={{ ...inputStyle, height: 44 }} />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, height: 44 }}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, ...T.bodySm, color: C.onSurface, cursor: 'pointer' }}><input type="checkbox" checked={form.is_veg} onChange={e => setForm({ ...form, is_veg: e.target.checked })} /> Vegetarian</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, ...T.bodySm, color: C.onSurface, cursor: 'pointer' }}><input type="checkbox" checked={form.is_bestseller} onChange={e => setForm({ ...form, is_bestseller: e.target.checked })} /> Bestseller</label>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={() => create.mutate(form)} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: TEAL, color: '#fff', ...T.labelLg, fontWeight: 600 }}>Save</button>
        <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 10, border: `1px solid ${C.outlineVariant}`, background: '#fff', cursor: 'pointer', ...T.labelLg, color: C.onSurface }}>Cancel</button>
      </div>
    </div>
  );
}
