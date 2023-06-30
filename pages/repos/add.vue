<template>
  <div v-if="loading" class="flex w-full">
    <span class="m-auto text-lg">Cloning and indexing repo ...</span>
  </div>

  <div v-else class="mx-auto flex flex-col items-center max-w-2xl">
    <TextInput
      model-value="search"
      placeholder="Search for a repo ..."
      class="my-4"
      @update:model-value="updateSearch"
    />

    <div v-if="!repositories || repositories.length === 0">No repos found</div>
    <div
      class="flex flex-wrap gap-4 m-4 max-w-2xl overflow-y-auto justify-between items-start"
    >
      <Card v-for="repo in repositories" :key="repo.id">
        <div
          class="flex flex-col items-center p-2 gap-2 w-64 h-full justify-between"
        >
          <span class="font-bold text-gray-300 flex-wrap">{{
            repo.full_name
          }}</span>
          <Button v-if="repo.active" :href="`/repos/${repo.id}/chat`"
            >Open</Button
          >
          <Button v-else @click="cloneRepo(repo.id)">Activate</Button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const githubCookie = useGithubCookie();
const loading = ref(false);

const search = ref("");
const { data: repositories } = await useAsyncData(
  "repositories",
  () =>
    $fetch("/api/repos/search", {
      headers: {
        gh_token: githubCookie.value!,
      },
      query: {
        search: search.value,
      },
    }),
  {
    watch: [search],
  }
);

function debounce<T extends (...args: any) => any>(func: T, timeout = 300) {
  let timer: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(func(args), timeout) as unknown as number;
  };
}

const updateSearch = debounce((_search: string) => {
  search.value = _search;
  return _search;
}, 300);

async function cloneRepo(repoId: string) {
  loading.value = true;
  try {
    await $fetch(`/api/repos/${repoId}/clone`, {
      key: `cloneRepo-${repoId}`,
      method: "POST",
      headers: {
        gh_token: githubCookie.value!,
      },
    });
    await router.push(`/repos/${repoId}/chat`);
  } catch (error) {
    console.error(error);
  }
  loading.value = false;
}
</script>
