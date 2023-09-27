<template>
  <div class="flex w-full">
    <div v-if="loading" class="flex w-full">
      <span class="m-auto text-2xl">Cloning and indexing your repository ...</span>
    </div>

    <div v-else-if="!selectedForge">
      <h1 class="text-2xl mb-4">Select a forge</h1>

      <div class="flex flex-col flex-wrap gap-4 mt-2">
        <Card v-for="forge in forges" :key="forge.id" class="flex items-center px-2 py-4 gap-2">
          <UIcon name="i-ion-git-branch" class="!w-16" />
          <span class="font-bold flex-wrap truncate overflow-ellipsis">{{ forge.host }}</span>

          <div class="flex-grow" />

          <UButton v-if="forge.isConnected" label="Select" @click="selectedForgeId = forge.id" />
          <UButton v-else label="Connect to forge" @click="login(forge.id)" />
        </Card>
      </div>
    </div>

    <div v-else class="mx-auto flex flex-col items-center max-w-2xl w-full">
      <h1 class="text-2xl mb-4">Add a new repository from {{ selectedForge.host }}</h1>

      <div class="mb-4 w-full">
        <UInput
          color="primary"
          variant="outline"
          :model-value="search"
          placeholder="Search for a repository ..."
          :disabled="!selectedForge"
          size="lg"
          icon="i-heroicons-magnifying-glass-20-solid"
          @update:model-value="updateSearch"
        />
      </div>

      <div v-if="selectedForge" class="w-full rounded-md border border-zinc-400">
        <div v-if="search.length < 3" class="p-4">Start typing to search for a repository</div>
        <div v-else-if="!repositories || repositories.length === 0" class="p-4">No repository found</div>

        <div
          v-for="repo in repositories"
          :key="repo.id"
          class="flex border-b border-zinc-200 items-center px-2 py-4 gap-2 w-full min-w-0"
        >
          <UIcon name="i-ion-git-branch" class="!w-16" />
          <span class="font-bold flex-wrap truncate overflow-ellipsis">{{ repo.name }}</span>
          <div class="flex-grow" />
          <UButton v-if="repo.active" :href="`/repos/${repo.id}/chat`" label="Open" />
          <UButton v-else @click="cloneRepo(repo.id)" label="Import" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login } = await useAuth();
const loading = ref(false);
const { data: forges } = await useFetch('/api/user/forges');
const selectedForgeId = ref();
const selectedForge = computed(() => forges.value?.find((f) => f.id === selectedForgeId.value));

const search = ref('');
const { data: repositories } = await useAsyncData(
  () => {
    if (!selectedForge.value || search.value.length < 1) {
      return Promise.resolve([]);
    }

    return $fetch(`/api/forges/${selectedForge.value.id}/repos/search`, {
      method: 'GET',
      query: {
        search: search.value,
      },
      credentials: 'include', // TODO why unauthorized?
    });
  },
  {
    watch: [search, selectedForge],
  },
);

function debounce<T extends Function>(fn: T, ms = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

const updateSearch = debounce((_search: string) => {
  search.value = _search;
}, 500);

async function cloneRepo(remoteRepoId: string) {
  loading.value = true;
  const forgeId = selectedForge.value?.id;
  if (!forgeId) {
    throw new Error('No forge selected');
  }

  try {
    const repo = await $fetch(`/api/forges/${forgeId}/repos/add`, {
      method: 'POST',
      body: {
        remoteRepoId,
      },
    });
    await navigateTo(`/repos/${repo.id}/chat`);
  } catch (error) {
    console.error(error);
  }

  loading.value = false;
}
</script>
