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
  },
  ignore: [
    '**/*.stories.{js,ts,jsx,tsx}',
    '**/*.{spec,test}.{js,ts,jsx,tsx}',
    '**/*.d.ts',
    '.output',
    '.git',
    '.cache',
    '/<rootDir>/.nuxt/analyze',
    '/<rootDir>/.nuxt',
    '**/-*.*',
    '/<rootDir>/data',
  ],
  ui: {
    icons: ['mdi', 'simple-icons', 'heroicons', 'ion'],
  },
});
