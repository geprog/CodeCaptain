<template>
  <div class="h-40 text-wrap">
    <a
      :href="href"
      class="flex justify-center w-60 p-2 h-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
      :class="{
        'hover:bg-gray-100 dark:hover:bg-gray-700': href,
      }"
    >
      <slot />
    </a>
  </div>
</template>

<script setup lang="ts">
defineProps<{ href?: string }>();
</script>
