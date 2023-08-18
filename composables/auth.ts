import jwt_decode from 'jwt-decode';

export const useAuth = () => {
  const token = useCookie('token');
  const user = ref<{
    name: string;
    avatarUrl: string;
    email: string;
  }>();

  function login(forgeId: number) {
    //TODO: find a better way to share the forge id that is connected.
    localStorage.setItem('forgeId',String(forgeId))
    window.location.href = `/api/auth/login?forgeId=${forgeId}`;
  }

  function logout() {
    localStorage.removeItem('forgeId');
    window.location.href = '/api/auth/logout';
  }

  if (token.value) {
    const decodedToken = jwt_decode(token.value) as { userId: string; exp: number; iat: number };

    // TODO: logout if token is expired and we are in the browser => check if there is a better way
    if (decodedToken.exp * 1000 < Date.now() && globalThis.window) {
      logout();
    }

    // TODO: load user data
    // TODO: fix for SSR
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
