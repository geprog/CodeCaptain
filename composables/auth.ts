export async function useAuth() {
  const { data: user, refresh: updateSession } = await useFetch('/api/user', { key: 'user' });

  const isAuthenticated = computed(() => !!user.value?.id);

  function login(forgeId: number) {
    window.location.href = `/api/auth/login?forgeId=${forgeId}`;
  }

  function logout() {
    window.location.href = '/api/auth/logout';
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    updateSession,
  };
}
