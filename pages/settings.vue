<template>
  <div class="flex flex-col w-full">
    <h1 class="text-2xl font-bold">Settings</h1>

    <h2 class="text-xl font-bold mt-4">Forges</h2>

    <div class="flex flex-wrap gap-4 mt-2">
      <NuxtLink v-for="forge in forges" :key="forge.id" :to="`/forges/${forge.id}`" :title="forge.host">
        <Card>
          <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
            <div class="flex items-center gap-2 mt-2 mx-auto">
              <UIcon v-if="forge.type === 'github'" name="i-ion-logo-github" class="w-6 h-6" />
              <UIcon v-if="forge.type === 'gitlab'" name="i-ion-logo-gitlab" class="w-6 h-6" />
              <span class="font-semibold text-xl truncate text-center">{{ forge.host }}</span>
            </div>

            <UButton
              size="md"
              icon="i-heroicons-pencil-square"
              variant="outline"
              class="mt-8"
              label="Edit"
              :disabled="!forge.isOwner"
            />
          </div>
        </Card>
      </NuxtLink>

      <NuxtLink to="/forges/add">
        <Card>
          <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
            <h2 class="text-xl font-bold">Add new forge</h2>

            <UButton size="md" icon="i-heroicons-plus" variant="outline" class="mt-8" label="Create" />
          </div>
        </Card>
      </NuxtLink>
    </div>

    <h2 class="text-xl font-bold mt-4">Repos</h2>

    <div class="flex flex-wrap gap-4 mt-2">
      <NuxtLink v-for="repo in repos" :key="repo.id" :to="`/repos/${repo.id}`" :title="repo.name">
        <Card>
          <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
            <div class="flex items-center gap-2 mt-2 mx-auto">
              <img v-if="repo.avatarUrl" :src="repo.avatarUrl" alt="icon" class="w-5 h-5 rounded-md" />
              <UIcon v-else name="i-mdi-source-branch" class="w-5 h-5" />
              <span class="font-semibold text-xl truncate text-center">{{ repo.name }}</span>
            </div>

            <UButton size="md" icon="i-heroicons-pencil-square" variant="outline" class="mt-8" label="Edit" />
          </div>
        </Card>
      </NuxtLink>

      <NuxtLink to="/repos/add">
        <Card>
          <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
            <h2 class="text-xl font-bold">Add new repo</h2>

            <UButton size="md" icon="i-heroicons-plus" variant="outline" class="mt-8" label="Create" />
          </div>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { forges } = await useForgesStore();

const { repos } = await useRepositoriesStore();
</script>
