<template>
  <div class="flex flex-col space-y-2 text-center justify-center items-center">
    <img src="/logo_light.svg" alt="CodeCaptain logo" class="w-32 dark:hidden" />
    <img src="/logo_dark.svg" alt="CodeCaptain dark logo" class="w-32 hidden dark:block" />

    <h1 class="text-3xl font-semibold tracking-tight">Sign In to Your Account</h1>
  </div>
  <div class="grid gap-6">
    <div class="flex flex-col gap-2">
      <button
        v-for="forge in forges"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 duration-200 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 bg-background"
        @click="login(forge.id)"
      >
        <UIcon v-if="forge.type === 'github'" name="i-ion-logo-github" class="w-4 h-4 mr-2" />
        <UIcon v-else-if="forge.type === 'gitlab'" name="i-ion-logo-gitlab" class="w-4 h-4 mr-2" />

        {{ forge.host }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { login } = await useAuth();

definePageMeta({ layout: 'auth' });

const forges = await $fetch('/api/forges');
</script>
