<template>
  <div class="flex w-full">
    <div class="mx-auto flex flex-col items-center max-w-2xl w-full">
      <h1 class="text-2xl mb-4">Add a new repository</h1>

      <UTabs :items="tabs" v-model="selectedTabIndex" class="w-full">
        <template #default="{ item, index, selected }">
          <div class="flex items-center gap-2 relative truncate">
            <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />

            <span class="truncate">{{ index + 1 }}. {{ item.label }}</span>

            <span v-if="selected" class="absolute -right-4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400" />
          </div>
        </template>

        <template #select_forge="{ item }">
          <UCard class="mt-4">
            <template #header>
              <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {{ item.label }}
              </p>
            </template>

            <div class="flex flex-wrap gap-4 mt-2">
              <div v-for="forge in forges" :key="forge.id">
                <a
                  :href="`/api/auth/login?forgeId=${forge.id}&redirectUrl=${urlEncoded(`/repos/add?login=successful&selectedForgeId=${forge.id}`)}`"
                >
                  <UButton
                    :icon="forge.type === 'github' ? 'i-ion-logo-github' : 'i-ion-logo-gitlab'"
                    :label="`Use ${forge.host}`"
                  />
                </a>
              </div>
            </div>
          </UCard>
        </template>

        <template #select_repo="{ item }">
          <UCard v-if="selectedForge" class="mt-4">
            <template #header>
              <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {{ item.label }} from {{ selectedForge.host }}
              </p>
            </template>

            <UInput
              color="primary"
              variant="outline"
              :model-value="search"
              placeholder="Search for a repository ..."
              :disabled="!selectedForge"
              size="lg"
              icon="i-heroicons-magnifying-glass-20-solid"
              class="w-full mb-2"
              :loading="loadingRepos"
              @update:model-value="updateSearch"
            />

            <div class="flex flex-col w-full rounded-md">
              <div v-if="!selectedForge" class="mx-auto mt-8">Select a forge first.</div>
              <div v-else-if="loadingRepos" class="mx-auto mt-8">Loading repositories ...</div>
              <div v-else-if="!repositories || repositories.length === 0" class="mx-auto mt-8">No repository found</div>

              <div
                v-else
                v-for="repo in repositories || []"
                :key="repo.remoteId"
                class="flex border-b border-zinc-200 items-center px-2 py-4 gap-2 w-full min-w-0"
              >
                <img v-if="repo.avatarUrl" :src="repo.avatarUrl" alt="icon" class="w-6 h-6 rounded-md dark:bg-white" />
                <UIcon v-else name="i-ion-git-branch" class="w-6 h-6" />
                <span class="font-bold flex-wrap truncate overflow-ellipsis">{{ repo.name }}</span>
                <div class="flex-grow" />
                <UButton v-if="repo.internalId" :to="`/repos/${repo.internalId}`" label="Open" />
                <UButton v-else @click="addRepo(repo.remoteId)" label="Add" />
              </div>
            </div>
          </UCard>
        </template>
      </UTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Forge } from '~/server/schemas';

const reposStore = await useRepositoriesStore();
const toast = useToast();
const { forges } = await useForgesStore();
const route = useRoute();

const urlEncoded = encodeURIComponent;

const tabs = [
  {
    label: 'Select a forge',
    slot: 'select_forge',
  },
  {
    label: 'Select a repository',
    icon: 'i-ion-ios-git-branch',
    slot: 'select_repo',
  },
];
const selectedForge = ref<Forge | undefined>(
  route.query.selectedForgeId
    ? forges.value.find((f) => f.id === parseInt(route.query.selectedForgeId as string, 10))
    : undefined,
);
const selectedTabIndex = ref(selectedForge.value ? 1 : 0);

const search = ref('');
const { data: repositories, pending: loadingRepos } = await useAsyncData(
  async () => {
    if (!selectedForge.value) {
      return Promise.resolve([]);
    }

    try {
      const repos = await $fetch(`/api/forges/${selectedForge.value.id}/repos/search`, {
        method: 'GET',
        query: {
          search: search.value,
          perPage: 5,
        },
        credentials: 'include',
      });

      return repos;
    } catch (error) {
      toast.add({
        title: 'Error',
        description: (error as Error).message,
        color: 'red',
      });
    }
  },
  {
    watch: [search, selectedForge],
    server: false,
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

async function addRepo(remoteRepoId: string) {
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
    await reposStore.refresh();
    await navigateTo(`/repos/${repo.id}`);
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as Error).message,
      color: 'red',
    });
  }
}
</script>
