<template>
  <NuxtLink
    :to="to"
    :title="title"
    class="inline-flex items-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 duration-200 hover:bg-stone-200 hover:text-stone-900 h-9 rounded-md px-3 justify-start flex-grow gap-2 w-full"
  >
    <img v-if="img" :src="img" alt="icon" class="w-5 h-5 flex-shrink-0 rounded-md" />
    <UIcon v-else-if="icon" :name="icon" class="w-5 h-5 flex-shrink-0" />
    <span v-if="title" class="truncate">{{ title }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  icon?: string;
  img?: string;
  title?: string;
}>();
</script>
