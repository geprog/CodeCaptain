<template>
  <div v-if="repo" class="flex flex-col w-full flex-grow">
    <div class="flex w-full p-2 items-center">
      <NuxtLink :to="repo.url" target="_blank" class="flex gap-4 mr-auto items-center text-2xl">
        <img v-if="repo.avatarUrl" :src="repo.avatarUrl" alt="avatar" class="w-8 h-8 rounded-md" />
        <span>{{ repo.name }}</span>
      </NuxtLink>

      <div class="flex gap-2">
        <NuxtLink :to="repo.url" target="_blank">
          <UButton icon="i-ion-git-pull-request" variant="outline" label="Source" />
        </NuxtLink>

        <UButton
          v-if="repo.lastFetch"
          icon="i-ion-cloud-download-outline"
          label="Synchronize"
          variant="outline"
          @click="reIndex"
        />
        <UButton label="Delete" icon="i-heroicons-trash" color="red" @click="deleteRepo" />
      </div>
    </div>

    <div v-if="indexing" class="mx-auto flex flex-col items-center gap-4 pt-8 w-full">
      <span class="text-2xl">Whoho lets go and do some indexing.</span>
      <img src="~/assets/loading.gif" alt="loading" />
      <div
        v-if="indexingLog"
        class="flex flex-col w-full min-h-0 overflow-auto rounded p-2 ring-1 ring-stone-200 dark:ring-neutral-800"
      >
        <span class="whitespace-pre-wrap">{{ indexingLog.join('') }}</span>
      </div>
    </div>

    <div v-else-if="!repo.lastFetch" class="flex flex-col m-auto gap-4">
      <p class="text-2xl mx-auto">Should we start indexing your repository?</p>
      <UButton
        class="mx-auto"
        icon="i-ion-cloud-download-outline"
        label="Index repository"
        variant="outline"
        @click="reIndex"
      />
    </div>

    <div v-else>
      <h2 class="text-xl">Chats</h2>

      <div class="flex flex-wrap gap-4">
        <NuxtLink v-for="chat in repoChats" :key="chat.id" :to="`/chats/${chat.id}`">
          <Card clickable>
            <div class="flex flex-col items-center justify-between p-2 gap-2 w-64">
              <div class="flex items-center gap-2 mt-2 mx-auto w-full">
                <UIcon name="i-ion-chatbox-ellipses" class="w-6 h-6 flex-shrink-0" />
                <span class="font-semibold text-lg truncate">{{ chat.name }}</span>
              </div>
              <UButton class="mt-8" label="Open" />
            </div>
          </Card>
        </NuxtLink>

        <Card clickable @click="newChat">
          <div class="flex flex-col items-center justify-between p-2 gap-2 w-64">
            <h2 class="text-xl font-bold">Add new chat</h2>
            <UButton icon="i-heroicons-plus" class="mt-8" label="Create" />
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { refresh: refreshRepos } = await useRepositoriesStore();
const { chats, refresh: refreshChats } = await useChatsStore();

const route = useRoute();
const toast = useToast();
const repoId = computed(() => route.params.repo_id);

const { data: repo, refresh: refreshRepo } = await useFetch(() => `/api/repos/${repoId.value}`);
const repoChats = computed(() => chats.value.filter((chat) => chat.repoId === repo.value?.id));

const indexing = ref(false);
const indexingLog = ref<string[]>([]);
async function reIndex() {
  if (!repo.value) {
    throw new Error('Unexpected: Repo not loaded');
  }

  indexing.value = true;
  indexingLog.value = [];
  try {
    const stream = await $fetch<ReadableStream>(`/api/repos/${repo.value.id}/clone`, {
      method: 'POST',
      responseType: 'stream',
    });

    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const text = new TextDecoder().decode(value);
      indexingLog.value.push(text);
    }

    toast.add({
      title: 'Success',
      description: 'Repo synced successfully',
      color: 'green',
    });
  } catch (e) {
    const error = e as Error;
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red',
    });
  }
  indexing.value = false;
  await refreshRepo();
}

async function deleteRepo() {
  if (!repo.value) {
    return;
  }

  if (!confirm(`Do you want to remove the repository ${repo.value.name}`)) {
    return;
  }

  await $fetch(`/api/repos/${repo.value.id}`, {
    method: 'DELETE',
  });

  toast.add({
    title: 'Repository removed',
    description: `Repository ${repo.value!.name} removed successfully`,
    color: 'green',
  });

  await refreshRepos();
  await navigateTo('/');
}

async function newChat() {
  if (!repo.value) {
    throw new Error('Unexpected: Repo not loaded');
  }

  const chat = await $fetch('/api/chats', {
    method: 'POST',
    body: JSON.stringify({ repoId: repo.value.id }),
  });

  await navigateTo(`/chats/${chat.id}`);
  await refreshChats();
}
</script>

<style scoped>
.fab-btn {
  transition: box-shadow 0.4s ease;
}

input:checked + .fab-btn span {
  transform: rotate(360deg);
}
</style>
