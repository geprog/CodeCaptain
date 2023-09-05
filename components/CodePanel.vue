<template>
  <div class="bg-zinc-900 p-4">
    <pre>{{ code }}</pre>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  code: string;
}>();
</script>
