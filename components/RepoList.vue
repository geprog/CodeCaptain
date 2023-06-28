<template>
  <div
    class="border border-gray-600 p-4 rounded-md flex flex-col items-center gap-2"
  >
    <span>{{ repo.full_name }}</span>
    <Button @click="cloneRepo(repo.id)"> Open </Button>
  </div>
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
