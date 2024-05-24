<template>
  <div class="flex flex-col w-full">
    <div class="flex w-full">
      <h1 class="text-2xl font-bold">New chat</h1>
    </div>

    <div class="flex flex-wrap gap-4 mt-4">
      <Card v-for="repo in repos.filter((r) => !!r.lastFetch)" :key="repo.id" clickable>
        <div class="flex flex-col items-center justify-between p-2 gap-2 w-64">
          <div class="flex justify-center gap-2 mt-2 w-full">
            <img
              v-if="repo.avatarUrl"
              :src="repo.avatarUrl"
              alt="icon"
              class="w-6 h-6 flex-shrink-0 rounded-md dark:bg-white"
            />
            <UIcon v-else name="i-ion-git-branch" class="w-6 h-6 flex-shrink-0" />
            <span class="font-semibold text-lg truncate">{{ repo.name }}</span>
          </div>
          <UButton icon="i-heroicons-pencil-square" class="mt-8" label="New chat" @click="newChat(repo.id)" />
        </div>
      </Card>

      <NuxtLink to="/repos/add">
        <Card clickable>
          <div class="flex flex-col items-center justify-between p-2 gap-2 w-64">
            <div class="flex justify-center gap-2 mt-2 w-full">
              <h2 class="font-semibold text-lg truncate">Add new repo</h2>
            </div>

            <UButton icon="i-heroicons-plus" class="mt-8" label="Add repo" />
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
