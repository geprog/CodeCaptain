<template>
  <div v-if="loading" class="flex w-full">
    <span class="m-auto text-2xl">Cloning and indexing repo ...</span>
  </div>

  <div v-else-if="!selectedForgeId">
    <li
      v-for="forge in forges?.filter((f) => f.isConnected)"
      :key="forge.id"
      class="cursor-pointer hover:underline"
      @click="selectedForgeId = forge.id"
    >
      {{ forge.name }} - {{ forge.host }}
    </li>
  </div>

  <div v-else class="mx-auto flex flex-col items-center max-w-2xl">
    <div v-if="selectedForge" class="flex items-center gap-2">
      <span class="text-xl font-bold">{{ selectedForge?.name }} - {{ selectedForge.host }}</span>
      <div @click="selectedForgeId = undefined" class="cursor-pointer">x</div>
    </div>

    <TextInput
      :model-value="search"
      placeholder="Search for a repo ..."
      class="my-4"
      @update:model-value="updateSearch"
    />

    <div v-if="!repositories || repositories.length === 0">No repos found</div>
    <div class="flex flex-col border border-gray-200 rounded-md gap-4 overflow-y-auto">
      <div
        v-for="repo in repositories"
        :key="repo.id"
        class="flex border-b border-gray-200 items-center p-2 gap-2 w-full justify-between min-w-0"
      >
        <span class="font-bold text-gray-300 flex-wrap truncate overflow-ellipsis">{{ repo.name }}</span>
        <Button v-if="repo.active" :href="`/repos/${repo.id}/chat`">Open</Button>
        <Button v-else @click="cloneRepo(repo.id)">Import</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false);
const { user } = useAuth();
const { data: forges } = await useFetch('/api/user/forges', {
  server: false,
});
const selectedForgeId = ref<number>();
const selectedForge = computed(() => forges.value?.find((f) => f.id === selectedForgeId.value));

const search = ref('');
const { data: repositories } = await useAsyncData(
  'repositories',
  () =>
    $fetch(`/api/forges/${selectedForgeId.value}/repos/search`, {
      query: {
        search: search.value,
      },
    }),
  {
    server: false,
    watch: [search, selectedForgeId],
  },
);

function debounce<T extends Function>(cb: T, wait = 20) {
  let h = 0;
  let callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait) as unknown as number;
  };
  return <T>(<any>callable);
}

const updateSearch = debounce((_search: string) => {
  search.value = _search;
  console.log('search', _search);
}, 1000);

async function cloneRepo(repoId: string) {
  loading.value = true;
  const forgeId = selectedForgeId.value;
  console.log("🚀 ~ file: add.vue:86 ~ cloneRepo ~ forgeId:", forgeId)
  try {
    await $fetch(`/api/forges/${forgeId}/repos/add`, {
      method: 'POST',
      body: {
        repoId,
      },
    });
  } catch (error) {
    console.log(error);
  }
  try {
    await navigateTo(`/repos/${repoId}/chat`);
  } catch (error) {
    console.error(error);
  }
  loading.value = false;
}
</script>
