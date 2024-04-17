<template>
  <div class="flex flex-col w-full">
    <div class="flex w-full">
      <h1 class="text-2xl font-bold">New chat</h1>
    </div>

    <div class="flex flex-wrap gap-4 mt-4">
      <Card v-for="repo in repos.filter((r) => !!r.lastFetch)" :key="repo.id">
        <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
          <div class="flex items-center gap-2 mt-2 mx-auto">
            <img v-if="repo.avatarUrl" :src="repo.avatarUrl" alt="icon" class="w-6 h-6 rounded-md" />
            <UIcon v-else name="i-ion-git-branch" class="w-6 h-6" />
            <span class="font-semibold text-lg truncate">{{ repo.name }}</span>
          </div>
          <UButton
            size="md"
            icon="i-heroicons-pencil-square"
            variant="outline"
            class="mt-8"
            label="New chat"
            @click="newChat(repo.id)"
          />
        </div>
      </Card>

      <NuxtLink to="/repos/add">
        <Card>
          <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
            <div>
              <h2>Add new repo</h2>
            </div>

            <UButton size="md" icon="i-heroicons-plus" variant="outline" class="mt-8" label="Add repo" />
          </div>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { refresh: refreshChats } = await useChatsStore();
const { repos } = await useRepositoriesStore();

async function newChat(repoId: number) {
  const chat = await $fetch('/api/chats', {
    method: 'POST',
    body: JSON.stringify({ repoId }),
  });

  await refreshChats();

  await navigateTo(`/chats/${chat.id}`);
}
</script>
