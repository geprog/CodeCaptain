<template>
  <div
    class="rounded-lg shadow ring-1 ring-stone-200 dark:ring-neutral-800 bg-stone-100 dark:bg-neutral-900"
    :class="{
      'cursor-pointer dark:hover:ring-stone-500 hover:ring-stone-300 hover:drop-shadow-md': clickable,
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  href?: string;
  title?: string;
  subtitle?: string;
  clickable?: boolean;
}>();
</script>
