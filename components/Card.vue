<template>
  <div>
    <a
      :href="href"
      class="block w-150 p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 r"
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
