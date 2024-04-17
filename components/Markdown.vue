<template>
  <div class="prose dark:text-white w-full">
    <vue-markdown :source="source" />
  </div>
</template>

<script lang="ts" setup>
import VueMarkdown from 'vue-markdown-render';

defineProps<{
  source: string;
}>();
</script>

<style scoped>
.prose :deep(p) {
  @apply m-0;
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3) {
  @apply dark:text-white mb-4 text-2xl;
}
</style>
