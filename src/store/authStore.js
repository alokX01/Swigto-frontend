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

const pickFirst = (...values) => values.find((value) => value !== null && value !== undefined && value !== '');

const getLoginTokens = (data = {}) => {
  const source = data.tokens || data.token || data;
  return {
    access: pickFirst(source.access, source.access_token, source.accessToken, data.access, data.access_token, data.accessToken),
    refresh: pickFirst(source.refresh, source.refresh_token, source.refreshToken, data.refresh, data.refresh_token, data.refreshToken),
  };
};

const getLoginUser = (data = {}) => {
  const user = data.user || data.profile || data.data?.user || data.data?.profile;
  if (user) return normalizeUser(user);
  if (data.email || data.role || data.user_type) return normalizeUser(data);
  return null;
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
    set({ accessToken: token || null });
  },

  setUser: (user) => {
    const normalized = normalizeUser(user);
    writeStorage('user', normalized ? JSON.stringify(normalized) : null);
    set({ user: normalized, isAuthenticated: Boolean(normalized), isLoading: false });
  },

  clearSession: () => {
    writeStorage('accessToken', null);
    writeStorage('refreshToken', null);
    writeStorage('user', null);
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  login: async (data, selectedRole) => {
    const res = await authAPI.login(data);
    const { access, refresh } = getLoginTokens(res.data);
    const loginUser = getLoginUser(res.data);
    const fallbackUser = loginUser
      ? { ...loginUser, role: loginUser.role || normalizeRole(selectedRole) }
      : null;

    if (access) get().setToken(access);
    if (refresh) writeStorage('refreshToken', refresh);

    try {
      const meRes = await authAPI.getMe();
      get().setUser(meRes.data);
      return meRes.data;
    } catch (error) {
      if (fallbackUser) {
        get().setUser(fallbackUser);
        return fallbackUser;
      }
      throw error;
    }
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

    if (cachedAccess) {
      set({ accessToken: cachedAccess, user: cachedUser, isAuthenticated: true, isLoading: false });
      try {
        const meRes = await authAPI.getMe();
        get().setUser(meRes.data);
        return;
      } catch (error) {
        if (error?.response?.status !== 401 || !refresh) {
          set({ isLoading: false });
          return;
        }
      }
    }

    if (!refresh) {
      if (cachedUser) set({ user: cachedUser, isAuthenticated: true, isLoading: false });
      else get().clearSession();
      return;
    }

    try {
      const tokenRes = await authAPI.refreshToken(refresh);
      const { access } = getLoginTokens(tokenRes.data);
      if (access) get().setToken(access);
      const meRes = await authAPI.getMe();
      get().setUser(meRes.data);
    } catch {
      if (cachedUser) set({ user: cachedUser, isAuthenticated: true, isLoading: false });
      else get().clearSession();
    }
  },

  getUserRole: () => {
    const user = get().user;
    return normalizeRole(user?.role || user?.user_type);
  },
}));
