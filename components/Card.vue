<template>
  <a
    :href="href"
    class="block max-w-sm p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
    :class="{
      'hover:bg-gray-100 dark:hover:bg-gray-700': href,
    }"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
defineProps<{ href?: string }>();
</script>
