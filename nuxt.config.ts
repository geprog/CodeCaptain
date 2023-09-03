// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['nuxt-icon', '@nuxthq/ui'],
  runtimeConfig: {
    api: {
      url: process.env.NUXT_API_URL ?? 'http://localhost:8000',
    },
    auth: {
      name: 'nuxt-session',
      password: process.env.NUXT_AUTH_PASSWORD ?? 'my-super-secret-password-is-minimum-32-characters-long',
    },
    data_path: process.env.DATA_PATH ?? 'data',
    public: {
      APP_URL: process.env.NUXT_APP_URL ?? 'http://localhost:3000',
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
