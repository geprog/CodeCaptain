<template>
  <div>
    <h1 class="text-2xl font-bold">Settings</h1>

    <h1 class="text-xl font-bold mt-4">Forges</h1>

    <div class="flex flex-wrap gap-4 mt-2">
      <NuxtLink v-for="forge in forges" :key="forge.id" :to="`/forges/${forge.id}`" :title="forge.host">
        <Card>
          <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
            <span class="font-semibold text-2xl mt-2 w-full truncate text-center">{{ forge.host }}</span>
            <UButton size="md" icon="i-heroicons-pencil-square" variant="outline" class="mt-8" label="Edit" />
          </div>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { forges } = await useForgesStore();
</script>
