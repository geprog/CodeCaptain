import jwt_decode from 'jwt-decode';

export const useAuth = () => {
  const token = useCookie('token');
  const user = token.value ? jwt_decode(token.value) : undefined;

  function login(oauthRedirectUrl: string) {
    window.location.href = oauthRedirectUrl;
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
