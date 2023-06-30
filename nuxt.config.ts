// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon"],
  runtimeConfig: {
    public: {
      github: {
        clientId: process.env.NUXT_PUBLIC_GITHUB_CLIENT_ID,
      },
    },
    github: {
      clientSecret: process.env.NUXT_GITHUB_CLIENT_SECRET,
    },
    api: {
      url: process.env.NUXT_API_URL || "http://localhost:8000",
    },
    data_path: process.env.DATA_PATH || "data",
  },
  vite: {
    server: {
      watch: {
        ignored: ["data/**"],
      },
    },
  },
});
