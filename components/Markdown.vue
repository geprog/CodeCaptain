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
</style>
