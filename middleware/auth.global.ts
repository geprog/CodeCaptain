export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('before auth');

  const { user } = await useAuth();

  console.log('user', user.value, !!user.value, to.path);

  if (!user.value && to.path !== '/auth/login') {
    return navigateTo('/auth/login');
  }

  if (user.value && to.path === '/auth/login') {
    return navigateTo('/');
  }
});
