import jwt_decode from 'jwt-decode';

export const useAuth = () => {
  const token = useCookie('token');
  const user = ref<{ name: string; avatar_url: string }>();

  if (token.value) {
    user.value = token.value ? jwt_decode(token.value) : undefined;

    // (async () => {
    //   user.value = await $fetch('/api/user');
    // })();
  }

  function login(forgeId: number) {
    window.location.href = `/api/auth/login?forgeId=${forgeId}`;
  }

  function logout() {
    window.location.href = '/api/auth/logout';
  }

  return {
    isAuthenticated: !!token.value,
    user,
    login,
    logout,
  };
};
