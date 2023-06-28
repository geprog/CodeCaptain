<template>
  <a
    class="border border-gray-600 p-4 rounded-md flex flex-col items-center gap-2"
    :href="`/repos/${repo.id}/chat`"
  >
    <span>{{ repo.full_name }}</span>
    <Button>Open</Button>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  repo: {
    id: number;
    full_name: string;
    active: boolean;
  };
}>();
</script>
