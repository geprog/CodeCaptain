<template>
  <aside class="fixed h-screen pb-12 lg:inset-y-0 lg:w-72 lg:flex-col hidden lg:block">
    <NuxtLink
      class="flex items-center px-8 py-6 text-2xl font-semibold tracking-tight duration-200 cursor-pointer stroke-stone-800 dark:text-stone-200 dark:stroke-stone-500 dark:hover:stroke-white hover:stroke-stone-700 hover:text-stone-700 dark:hover:text-white"
      to="/"
    >
      <img src="/logo_light.svg" alt="CodeCaptain logo" class="w-8 mr-4 dark:hidden" />
      <img src="/logo_dark.svg" alt="CodeCaptain logo" class="w-8 mr-4 hidden dark:block" />
      <span
        class="text-transparent bg-gradient-to-tr from-gray-800 to-gray-400 dark:from-gray-100 dark:to-gray-400 bg-clip-text"
        >Code</span
      >
      <span>captain.ai</span>
    </NuxtLink>
    <div class="space-y-4">
      <div class="px-6 py-2">
        <h2 class="px-2 mb-2 text-lg font-semibold tracking-tight">Workspace</h2>
        <div class="space-y-1">
          <MenuItem to="/" title="Repos" icon="i-ion-ios-chatboxes" />
          <MenuItem to="/" title="Settings" icon="i-ion-ios-settings" />
          <MenuItem to="https://geprog.com" title="Geprog" icon="i-ion-android-favorite-outline" />
        </div>
      </div>
      <div class="py-2">
        <h2 class="relative px-8 text-lg font-semibold tracking-tight">Forges</h2>
        <div
          dir="ltr"
          class="relative overflow-hidden h-[230px] px-4"
          style="position: relative; --radix-scroll-area-corner-width: 0px; --radix-scroll-area-corner-height: 0px"
        >
          <div
            data-radix-scroll-area-viewport=""
            class="h-full w-full rounded-[inherit]"
            style="overflow: hidden scroll"
          >
            <div style="min-width: 100%; display: table">
              <div class="p-2 space-y-1">
                <a v-for="forge in forges" href="/app/api_8WAUZp23pTeXn7gcNE8xZb">
                  <button
                    class="inline-flex items-center text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 duration-200 hover:bg-stone-200 hover:text-stone-900 h-9 rounded-md justify-start w-full font-normal truncate elipsis p-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-4 h-4 mr-2"
                    >
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    {{ forge.name }}
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="user" class="absolute inset-x-0 mx-6 bottom-8">
      <button
        type="button"
        id="radix-:R1lmcr5mja:"
        aria-haspopup="menu"
        aria-expanded="false"
        data-state="closed"
        class="flex items-center justify-between gap-4 px-2 py-1 rounded lg:w-full hover:bg-stone-100 dark:hover:bg-stone-800"
        @click="logout"
      >
        <div class="flex flex-row-reverse items-center justify-start w-full gap-4 lg:flex-row">
          <span class="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8 lg:w-10 lg:h-10">
            <img v-if="user.avatarUrl" class="aspect-square h-full w-full" alt="Anbraten" :src="user?.avatarUrl" />
          </span>
          <div class="flex flex-row-reverse items-center gap-4 lg:gap-1 lg:items-start lg:flex-col">
            <span class="text-ellipsis overflow-hidden whitespace-nowrap max-w-[8rem]">{{ user.name }}</span>
            <span
              class="inline-flex items-center font-medium py-0.5 text-xs uppercase rounded-md text-stone-800 dark:text-stone-300"
              >FREE</span
            >
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="hidden w-4 h-4 md:block"
        >
          <path d="m7 15 5 5 5-5"></path>
          <path d="m7 9 5-5 5 5"></path>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { user, login, logout } = await useAuth();

const { data: forges } = await useFetch('/api/user/forges');
</script>
