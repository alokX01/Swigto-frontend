import { create } from 'zustand';
import { authAPI } from '@/api/auth';
import { normalizeRole } from '@/lib/helpers';

const normalizeUser = (user) => {
  if (!user) return null;
  const role = normalizeRole(user.role || user.user_type);
  return { ...user, role };
};

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Ignore private-mode storage failures.
  }
};

const readStoredUser = () => {
  try {
    const value = readStorage('user');
    return value ? normalizeUser(JSON.parse(value)) : null;
  } catch {
    return null;
  }
};

const storedAccessToken = readStorage('accessToken');
const storedUser = readStoredUser();

export const useAuthStore = create((set, get) => ({
  user: storedUser,
  accessToken: storedAccessToken,
  isAuthenticated: Boolean(storedAccessToken && storedUser),
  isLoading: true,

  setToken: (token) => {
    writeStorage('accessToken', token);
    set({ accessToken: token });
  },

  setUser: (user) => {
    const normalized = normalizeUser(user);
    writeStorage('user', JSON.stringify(normalized));
    set({ user: normalized, isAuthenticated: true, isLoading: false });
  },

  clearSession: () => {
    writeStorage('accessToken', null);
    writeStorage('refreshToken', null);
    writeStorage('user', null);
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  login: async (data) => {
    const res = await authAPI.login(data);
    const { access, refresh } = res.data.tokens || res.data;
    get().setToken(access);
    writeStorage('refreshToken', refresh);

    // Fetch user info
    const meRes = await authAPI.getMe();
    get().setUser(meRes.data);
    return meRes.data;
  },

  logout: async () => {
    const refresh = readStorage('refreshToken');
    get().clearSession();
    try {
      if (refresh) await authAPI.logout(refresh);
    } catch {
      // silent fail
    }
  },

  restoreSession: async () => {
    const refresh = readStorage('refreshToken');
    const cachedAccess = readStorage('accessToken');
    const cachedUser = readStoredUser();

    if (cachedAccess && cachedUser) {
      set({ accessToken: cachedAccess, user: cachedUser, isAuthenticated: true, isLoading: false });
    }

    if (!refresh) {
      if (!cachedAccess) get().clearSession();
      else set({ isLoading: false });
      return;
    }

    try {
      const tokenRes = await authAPI.refreshToken(refresh);
      const newAccess = tokenRes.data.access;
      get().setToken(newAccess);

      const meRes = await authAPI.getMe();
      get().setUser(meRes.data);
    } catch (error) {
      const status = error?.response?.status;
      if (!status || status >= 500) {
        set({ isLoading: false });
        return;
      }
      get().clearSession();
    }
  },

  getUserRole: () => {
    const user = get().user;
    return normalizeRole(user?.role || user?.user_type);
  },
}));
