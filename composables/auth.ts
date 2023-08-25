export async function useAuth() {
  // TODO: use store
  const { data: user, refresh: updateSession } = await useFetch('/api/user');

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
