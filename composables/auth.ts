import jwt_decode from 'jwt-decode';

export const useAuth = () => {
  const token = useCookie('token');
  const userIdFromToken = ref<{ userId: string }>();


  if (token.value) {
    userIdFromToken.value = token.value ? jwt_decode(token.value) : undefined;
  }

  function login(forgeId: number) {
    window.location.href = `/api/auth/login?forgeId=${forgeId}`;
  }

  function logout() {
    window.location.href = '/api/auth/logout';
  }

  return {
    isAuthenticated: !!token.value,
    userIdFromToken,
    login,
    logout,
  };
};
