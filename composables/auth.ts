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
