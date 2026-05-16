import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';

export function RestaurantLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar variant="restaurant" />
      <main style={{ marginLeft: 260, padding: 24, transition: 'margin 0.3s' }}>
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar variant="admin" />
      <main style={{ marginLeft: 260, padding: 24, transition: 'margin 0.3s' }}>
        <Outlet />
      </main>
    </div>
  );
}

export function AgentLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <main style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
