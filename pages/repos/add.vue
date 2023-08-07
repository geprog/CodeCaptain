<template>
  <div v-if="loading" class="flex w-full">
    <span class="m-auto text-2xl">Cloning and indexing repo ...</span>
  </div>

  <div v-else class="mx-auto flex flex-col items-center max-w-2xl">
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
        <span class="font-bold text-gray-300 flex-wrap truncate overflow-ellipsis">{{ repo.full_name }}</span>
        <Button v-if="repo.active" :href="`/repos/${repo.id}/chat`">Open</Button>
        <Button v-else @click="cloneRepo(repo.id)">Activate</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const githubCookie = useGithubCookie();
const user = await fetchGithubUser();
const loading = ref(false);

const search = ref(`user:${user.value?.login}`);
const { data: repositories } = await useAsyncData(
  'repositories',
  () =>
    $fetch('/api/repos/search', {
      headers: {
        gh_token: githubCookie.value!,
      },
      query: {
        search: search.value,
      },
    }),
  {
    watch: [search],
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
}, 500);

async function cloneRepo(repoId: string) {
  loading.value = true;
  try {
    await $fetch(`/api/repos/${repoId}/clone`, {
      key: `cloneRepo-${repoId}`,
      method: 'POST',
      headers: {
        gh_token: githubCookie.value!,
      },
    });
    await navigateTo(`/repos/${repoId}/chat`);
  } catch (error) {
    console.error(error);
  }
  loading.value = false;
}
</script>
