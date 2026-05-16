# API & Store Reference - Complete Guide

## 📦 Store Exports

### useRestaurantOwnerStore
**Location:** `src/store/restaurantOwnerStore.js`

```javascript
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';

// Hook provides:
const {
  // State
  profile: {
    id,
    email,
    phone,
    name,
    pan_number,
    gst_number,
    is_verified,
    user_id,
    created_at,
    updated_at
  },
  
  restaurant: {
    id,
    name,
    description,
    cuisine_type,
    address,
    city,
    pincode,
    phone,
    avg_preparing_time,
    min_order_amount,
    is_open,
    average_rating,
    total_orders,
    created_at,
    updated_at
  },
  
  restaurants: [], // Array of restaurants (if owner has multiple)
  isLoading: boolean,
  error: null | object,
  
  // Profile Methods
  fetchProfile: async () => profile,
  updateProfile: async (data) => updatedProfile,
  patchProfile: async (data) => updatedProfile,
  
  // Restaurant Methods
  fetchMyRestaurant: async () => restaurant,
  fetchRestaurant: async (id) => restaurant,
  updateRestaurant: async (id, data) => updatedRestaurant,
  toggleRestaurantStatus: async (id) => updatedRestaurant,
  
} = useRestaurantOwnerStore();
```

---

### useAuthStore
**Location:** `src/store/authStore.js`

```javascript
import { useAuthStore } from '@/store/authStore';

const {
  // State
  accessToken: string,
  user: {
    id,
    email,
    first_name,
    last_name,
    phone,
    username,
    role // 'customer' | 'restaurant_owner' | 'delivery_agent'
  },
  isAuthenticated: boolean,
  isLoading: boolean,
  error: null | string,
  
  // Methods
  setToken: (token: string) => void,
  setUser: (userData: object) => void,
  setAuthenticated: (bool: boolean) => void,
  clearSession: () => void,
  restoreSession: () => void,
  login: async (email, password) => { token, user },
  logout: () => void,
  refreshToken: async () => newToken,
  
} = useAuthStore();
```

---

### useProfileStore
**Location:** `src/store/profileStore.js`

```javascript
import { useProfileStore } from '@/store/profileStore';

const {
  // State
  profile: {
    id,
    user,
    phone,
    is_verified,
    created_at,
    updated_at
  },
  addresses: [
    {
      id,
      user,
      label,
      phone,
      address,
      city,
      pincode,
      lat,
      lng,
      is_default,
      created_at
    }
  ],
  isLoading: boolean,
  error: null | object,
  
  // Methods
  fetchProfile: async () => profile,
  updateProfile: async (data) => updatedProfile,
  fetchAddresses: async (params) => addresses,
  addAddress: async (data) => newAddress,
  updateAddress: async (id, data) => updatedAddress,
  deleteAddress: async (id) => void,
  setDefaultAddress: async (id) => updatedAddresses,
  
} = useProfileStore();
```

---

### useCartStore
**Location:** `src/store/cartStore.js`

```javascript
import { useCartStore } from '@/store/cartStore';

const {
  // State
  cart: {
    id,
    user,
    items_count,
    total_price,
    created_at,
    updated_at
  },
  items: [
    {
      id,
      cart,
      menu_item,
      variant,
      quantity,
      price,
      special_instructions
    }
  ],
  isLoading: boolean,
  error: null | object,
  
  // Methods
  fetchCart: async () => cart,
  addItem: async (data) => newItem,
  updateItem: async (id, data) => updatedItem,
  removeItem: async (id) => void,
  clearCart: async () => void,
  getItemCount: () => number,
  
} = useCartStore();
```

---

### useOrderStore
**Location:** `src/store/orderStore.js`

```javascript
import { useOrderStore } from '@/store/orderStore';

const {
  // State
  orders: [
    {
      id,
      customer,
      restaurant,
      delivery_address,
      status,
      total_amount,
      items,
      created_at
    }
  ],
  currentOrder: {
    id,
    customer,
    restaurant,
    items,
    status,
    total_amount,
    delivery_address,
    delivery_agent,
    estimated_arrival,
    created_at
  },
  isLoading: boolean,
  error: null | object,
  
  // Methods
  fetchOrders: async (params) => orders,
  fetchOrder: async (id) => order,
  placeOrder: async (data) => newOrder,
  cancelOrder: async (id) => void,
  updateOrderStatus: async (id, status) => updatedOrder,
  
} = useOrderStore();
```

---

## 🔗 API Module Reference

### restaurantOwnerAPI
**Location:** `src/api/profiles.js`

```javascript
import { restaurantOwnerAPI } from '@/api/profiles';

restaurantOwnerAPI.getProfile()
// GET /restaurant-owner/profile/
// Returns: { id, email, phone, name, pan_number, gst_number, is_verified }

restaurantOwnerAPI.updateProfile(data)
// PUT /restaurant-owner/profile/
// Data: { name, pan_number, gst_number }
// Returns: updated profile

restaurantOwnerAPI.patchProfile(data)
// PATCH /restaurant-owner/profile/
// Data: Partial { name, pan_number, gst_number }
// Returns: updated profile
```

---

### restaurantAPI
**Location:** `src/api/restaurants.js`

```javascript
import { restaurantAPI } from '@/api/restaurants';

// Basic CRUD
restaurantAPI.list(params)
// GET /restaurants/
// Params: { city, cuisine_type, is_open, max_delivery_time, min_rating, search }
// Returns: { count, next, results: [...] }

restaurantAPI.get(id)
// GET /restaurants/{id}/
// Returns: single restaurant object

restaurantAPI.create(data)
// POST /restaurants/
// Data: { name, cuisine_type, address, city, pincode, phone, ... }
// Returns: new restaurant

restaurantAPI.updateRestaurant(id, data)
// PUT /restaurants/{id}/
// Data: Full restaurant data
// Returns: updated restaurant

restaurantAPI.patchRestaurant(id, data)
// PATCH /restaurants/{id}/
// Data: Partial restaurant data
// Returns: updated restaurant

restaurantAPI.deleteRestaurant(id)
// DELETE /restaurants/{id}/
// Returns: no content

// Restaurant Owner
restaurantAPI.getMyRestaurant()
// GET /restaurants/mine/
// Returns: owner's restaurant

restaurantAPI.toggleRestaurantStatus(id)
// PATCH /restaurants/{id}/toggle-status/
// Returns: updated restaurant with is_open toggled

// Categories
restaurantAPI.getCategories(restaurantId, params)
restaurantAPI.getCategory(restaurantId, categoryId)
restaurantAPI.createCategory(restaurantId, data)
restaurantAPI.updateCategory(restaurantId, catId, data)
restaurantAPI.patchCategory(restaurantId, catId, data)
restaurantAPI.deleteCategory(restaurantId, catId)

// Menu Items
restaurantAPI.getMenuItems(restaurantId, params)
restaurantAPI.getMenuItem(restaurantId, itemId)
restaurantAPI.createMenuItem(restaurantId, data)
restaurantAPI.updateMenuItem(restaurantId, itemId, data)
restaurantAPI.patchMenuItem(restaurantId, itemId, data)
restaurantAPI.deleteMenuItem(restaurantId, itemId)
restaurantAPI.toggleMenuItem(restaurantId, itemId)

// Variants
restaurantAPI.getVariants(restaurantId, itemId, params)
restaurantAPI.createVariant(restaurantId, itemId, data)
restaurantAPI.updateVariant(restaurantId, itemId, variantId, data)
restaurantAPI.deleteVariant(restaurantId, itemId, variantId)
```

---

### customerAPI
**Location:** `src/api/profiles.js`

```javascript
import { customerAPI } from '@/api/profiles';

// Profile
customerAPI.getProfile()
// GET /customer/profile/
// Returns: customer profile

customerAPI.updateProfile(data)
// PUT /customer/profile/
// Returns: updated profile

customerAPI.patchProfile(data)
// PATCH /customer/profile/
// Returns: updated profile

// Addresses
customerAPI.getAddresses(params)
// GET /customer/addresses/
// Params: { is_default, search }
// Returns: list of addresses

customerAPI.addAddress(data)
// POST /customer/addresses/
// Data: { label, phone, address, city, pincode, lat, lng }
// Returns: new address

customerAPI.getAddress(id)
// GET /customer/addresses/{id}/
// Returns: single address

customerAPI.updateAddress(id, data)
// PUT /customer/addresses/{id}/
// Returns: updated address

customerAPI.patchAddress(id, data)
// PATCH /customer/addresses/{id}/
// Returns: updated address

customerAPI.deleteAddress(id)
// DELETE /customer/addresses/{id}/
// Returns: no content

customerAPI.setDefaultAddress(id)
// POST /customer/addresses/{id}/set-default/
// Returns: updated address list
```

---

### cartAPI
**Location:** `src/api/cart.js`

```javascript
import { cartAPI } from '@/api/cart';

cartAPI.getCart()
// GET /cart/
// Returns: full cart with items

cartAPI.addItem(data)
// POST /cart/items/
// Data: { menu_item, variant, quantity, special_instructions }
// Returns: updated cart

cartAPI.updateItem(id, data)
// PATCH /cart/items/{id}/
// Data: { quantity, special_instructions }
// Returns: updated item

cartAPI.removeItem(id)
// DELETE /cart/items/{id}/
// Returns: no content

cartAPI.clearCart()
// DELETE /cart/
// Returns: no content
```

---

### ordersAPI
**Location:** `src/api/orders.js`

```javascript
import { ordersAPI } from '@/api/orders';

// Customer Orders
ordersAPI.getOrders(params)
// GET /orders/
// Params: { status, restaurant, limit, offset, search_date }
// Returns: { count, next, results: [...] }

ordersAPI.getOrder(id)
// GET /orders/{id}/
// Returns: single order with all details

ordersAPI.placeOrder(data)
// POST /orders/
// Data: { delivery_address, payment_method, special_instructions }
// Returns: new order

ordersAPI.cancelOrder(id, data)
// PATCH /orders/{id}/cancel/
// Data: { reason }
// Returns: cancelled order

// Restaurant Orders
ordersAPI.restaurantOrders(params)
// GET /orders/restaurant/
// Returns: orders for restaurant owner's restaurant

ordersAPI.restaurantUpdateOrder(id, data)
// PATCH /orders/{id}/
// Data: { status, estimated_time }
// Returns: updated order

// Delivery Agent Orders
ordersAPI.agentOrders(params)
// GET /orders/agent/
// Returns: orders assigned to agent

ordersAPI.agentAcceptOrder(id)
// PATCH /orders/{id}/accept/
// Returns: updated order

ordersAPI.agentRejectOrder(id)
// PATCH /orders/{id}/reject/
// Returns: no content

// Payments
ordersAPI.initiatePayment(orderId, data)
// POST /payments/initiate/
// Data: { amount, method }
// Returns: { order_id, payment_id, amount, ... }

ordersAPI.verifyPayment(data)
// POST /payments/verify/
// Data: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Returns: { success, message, order }
```

---

## 🔐 Authentication Flow

### Login
```javascript
import { useAuthStore } from '@/store/authStore';

const { login } = useAuthStore();
const response = await login('email@example.com', 'password');
// Returns: { accessToken, user: {...} }
// Stores JWT in localStorage
// Sets isAuthenticated to true
```

### JWT Token Injection
```javascript
// src/api/axios.js automatically:
// 1. Injects Authorization: Bearer {token} header
// 2. Handles 401 responses
// 3. Refreshes token if expired
// 4. Retries failed requests
```

### Logout
```javascript
const { logout } = useAuthStore();
logout();
// Clears localStorage
// Clears auth state
// Redirects to login
```

---

## 🔄 Error Handling Pattern

All API errors are handled consistently:

```javascript
import { getApiError } from '@/lib/helpers';

try {
  await updateProfile(data);
  toast.success('Updated successfully');
} catch (err) {
  const errorMsg = getApiError(err, 'Failed to update');
  toast.error(errorMsg);
}
```

### Error Response Formats Handled
```javascript
// Format 1: error string
{ "error": "Invalid input" }

// Format 2: detail string
{ "detail": "Not found" }

// Format 3: field errors
{ "field": ["error message"] }

// Format 4: nested errors
{ "nested": { "field": ["error"] } }

// All converted to human-readable message via getApiError()
```

---

## 🧪 Quick Test Examples

### Test Restaurant Owner Profile Update
```javascript
import { useRestaurantOwnerStore } from '@/store/restaurantOwnerStore';
import { toast } from 'sonner';

const { profile, updateProfile, fetchProfile } = useRestaurantOwnerStore();

// Load profile
await fetchProfile();
console.log('Profile:', profile);

// Update
await updateProfile({
  name: 'New Name',
  pan_number: 'ABCDE1234F',
  gst_number: '18AABCU9603R1Z5'
});
console.log('Updated:', profile);
```

### Test Restaurant Status Toggle
```javascript
const { restaurant, toggleRestaurantStatus } = useRestaurantOwnerStore();

// Toggle status
await toggleRestaurantStatus(restaurant.id);
console.log('Is Open:', restaurant.is_open);
```

---

## 📊 Data Type Reference

### Restaurant Object
```javascript
{
  id: number,
  owner: number,
  name: string,
  description: string,
  cuisine_type: string,
  address: string,
  city: string,
  pincode: string,
  latitude: number,
  longitude: number,
  phone: string,
  avg_preparing_time: number, // minutes
  min_order_amount: number, // rupees
  is_open: boolean,
  is_verified: boolean,
  average_rating: number, // 0-5
  total_orders: number,
  total_reviews: number,
  is_deleted: boolean,
  created_at: string, // ISO datetime
  updated_at: string  // ISO datetime
}
```

### Order Object
```javascript
{
  id: number,
  order_number: string,
  customer: number,
  restaurant: number,
  items: [
    {
      id: number,
      menu_item: number,
      quantity: number,
      price: number,
      variant: number | null
    }
  ],
  delivery_address: {
    address: string,
    city: string,
    pincode: string,
    phone: string
  },
  delivery_agent: number | null,
  status: string, // PLACED, ACCEPTED, PREPARING, READY, PICKED_UP, DELIVERED, CANCELLED
  subtotal: number,
  delivery_fee: number,
  platform_fee: number,
  gst: number,
  total_amount: number,
  payment_method: string,
  payment_status: string,
  special_instructions: string,
  estimated_arrival: string | null,
  created_at: string,
  updated_at: string
}
```

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Status:** ✅ Production Ready
