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
  },
});
