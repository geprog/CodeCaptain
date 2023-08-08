// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', 'nuxt-icon'],
  runtimeConfig: {
    api: {
      url: process.env.NUXT_API_URL || 'http://localhost:8000',
    },
    data_path: process.env.DATA_PATH || 'data',
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
});
