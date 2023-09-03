// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['nuxt-icon', '@nuxthq/ui'],
  runtimeConfig: {
    ai: {
      url: 'http://localhost:8000',
    },
    auth: {
      name: 'nuxt-session',
      password: 'my-super-secret-password-is-minimum-32-characters-long',
    },
    data_path: 'data',
    public: {
      APP_URL: 'http://localhost:3000',
    },
  },
  imports: {
    dirs: ['stores'],
  },
  ignore: ['data/**/*'],
  ui: {
    icons: ['mdi', 'simple-icons', 'heroicons', 'ion'],
  },
});
