<template>
  <div
    class="rounded-lg border bg-transparent border-stone-300 dark:border-stone-800 dark:hover:border-stone-500 relative overflow-hidden duration-500 hover:border-primary/10 group hover:drop-shadow-md"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  href?: string;
  title?: string;
  subtitle?: string;
}>();
</script>
