// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['nuxt-icon', '@nuxt/ui'],
  telemetry: true,
  runtimeConfig: {
    ai: {
      token: '',
      model: 'gpt-3.5-turbo-1106',
      // model: 'gpt-4',
    },
    auth: {
      name: 'nuxt-session',
      password: 'my-super-secret-password-is-minimum-32-characters-long',
    },
    data_path: './.data',
    migrations_path: './server/db/migrations',
    public: {
      APP_URL: 'http://localhost:3000',
    },
  },
  $production: {
    runtimeConfig: {
      auth: {
        password: '', // This should be set with an environment variable
      },
      data_path: './data',
      migrations_path: './migrations',
    },
  },

  ignore: ['data/**/*'],
  ui: {
    icons: ['mdi', 'simple-icons', 'heroicons', 'ion'],
  },
  app: {
    head: {
      title: 'CodeCaptain.ai',
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      ],
    },
  },
  typescript: {
    strict: true,
  },
});
