<template>
  <div class="h-40 text-wrap">
    <a
      :href="href"
      class="flex justify-center w-60 p-2 h-full rounded-lg border bg-gray-800 border-gray-800"
      :class="{
        'hover:border-gray-400': href,
      }"
    >
      <slot />
    </a>
  </div>
</template>

<script setup lang="ts">
defineProps<{ href?: string }>();
</script>
