<template>
  <NuxtLink
    :to="to"
    class="inline-flex items-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 duration-200 hover:bg-stone-200 hover:text-stone-900 h-9 rounded-md px-3 justify-start flex-grow gap-2 w-full"
  >
    <UIcon v-if="icon" :name="icon" />
    <span v-if="title">{{ title }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  icon?: string;
  title?: string;
}>();
</script>
