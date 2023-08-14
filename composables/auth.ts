import jwt_decode from 'jwt-decode';
import { browser } from 'process';

export const useAuth = () => {
  const token = useCookie('token');
  const user = ref<{
    name: string;
    avatarUrl: string;
    email: string;
  }>();

  function login(forgeId: number) {
    window.location.href = `/api/auth/login?forgeId=${forgeId}`;
    
  }

  function logout() {
    window.location.href = '/api/auth/logout';
  }

  if (token.value) {
    const decodedToken = jwt_decode(token.value) as { userId: string; exp: number; iat: number };

    // TODO: logout if token is expired
    if (decodedToken.exp * 1000 < Date.now()) {
      logout();
    }

    // TODO: load user data
    (async () => {
      user.value = await $fetch('/api/user');
    })();
  }

  return {
    isAuthenticated: !!token.value,
    user,
    login,
    logout,
  };
};
