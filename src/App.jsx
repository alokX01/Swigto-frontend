import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute, PublicRoute } from '@/routes/ProtectedRoute';

// Layouts
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { RestaurantLayout, AgentLayout } from '@/components/layouts/PortalLayouts';

// Customer Pages
import LoginPage from '@/pages/customer/LoginPage';
import HomePage from '@/pages/customer/HomePage';
import SearchPage from '@/pages/customer/SearchPage';
import RestaurantPage from '@/pages/customer/RestaurantPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrdersPage from '@/pages/customer/OrdersPage';
import OrderDetailPage from '@/pages/customer/OrderDetailPage';
import TrackOrderPage from '@/pages/customer/TrackOrderPage';
import ProfilePage from '@/pages/customer/ProfilePage';
import ReviewSubmitPage from '@/pages/customer/ReviewSubmitPage';

// Restaurant Pages
import RestaurantDashboard from '@/pages/restaurant/DashboardPage';
import RestaurantOrdersPage from '@/pages/restaurant/OrdersPage';
import RestaurantMenuPage from '@/pages/restaurant/RestaurantMenuPage';
import MenuItemFormPage from '@/pages/restaurant/MenuItemFormPage';
import VariantsManagementPage from '@/pages/restaurant/VariantsManagementPage';
import RestaurantOwnerProfilePage from '@/pages/restaurant/RestaurantOwnerProfilePage';
import RestaurantManagementPage from '@/pages/restaurant/RestaurantManagementPage';
import RestaurantReviewsPage from '@/pages/restaurant/RestaurantReviewsPage';

// Agent Pages
import AgentDashboard from '@/pages/agent/DashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <Routes>
      {/* Public Auth */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* Customer Portal */}
      <Route element={<CustomerLayout />}>
        {/* Public customer routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        
        {/* Protected customer routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer']}><Outlet /></ProtectedRoute>}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/track" element={<TrackOrderPage />} />
          <Route path="/orders/:orderId/review" element={<ReviewSubmitPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Restaurant Portal */}
      <Route element={<ProtectedRoute allowedRoles={['restaurant_owner', 'restaurant']}><RestaurantLayout /></ProtectedRoute>}>
        <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
        <Route path="/restaurant/profile" element={<RestaurantOwnerProfilePage />} />
        <Route path="/restaurant/management" element={<RestaurantManagementPage />} />
        <Route path="/restaurant/menu" element={<RestaurantMenuPage />} />
        <Route path="/restaurant/menu/add" element={<MenuItemFormPage />} />
        <Route path="/restaurant/menu/edit/:itemId" element={<MenuItemFormPage />} />
        <Route path="/restaurant/menu/:itemId/variants" element={<VariantsManagementPage />} />
        <Route path="/restaurant/orders" element={<RestaurantOrdersPage />} />
        <Route path="/restaurant/reviews" element={<RestaurantReviewsPage />} />
      </Route>

      {/* Agent Portal */}
      <Route element={<ProtectedRoute allowedRoles={['delivery_agent', 'agent']}><AgentLayout /></ProtectedRoute>}>
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: {
                fontFamily: 'var(--font-sans)',
                borderRadius: '12px',
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
