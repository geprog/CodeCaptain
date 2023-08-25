export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user } = await useAuth();

  if (!user.value && to.path !== '/auth/login') {
    return navigateTo('/auth/login');
  }

  if (user.value && to.path === '/auth/login') {
    return navigateTo('/');
  }
});
