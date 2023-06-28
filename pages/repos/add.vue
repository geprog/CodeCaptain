<template>
  <div v-if="loading" class="flex w-full">
    <span class="m-auto text-lg">Cloning and indexing repo ...</span>
  </div>

  <div v-else class="mx-auto flex flex-col items-center">
    <span class="mt-4 text-lg">Repos</span>
    <div v-if="repositories.length === 0">No repos found</div>
    <div class="flex flex-col gap-4 m-4 overflow-y-auto">
      <Card v-for="repo in repositories" :key="repo.id">
        <div class="flex flex-col justify-center items-center">
          <span class="mb-4">{{ repo.full_name }}</span>
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

const repositories = ref(
  await $fetch("/api/repos/list", {
    headers: {
      gh_token: githubCookie.value!,
    },
  })
);

async function cloneRepo(repoId: number) {
  loading.value = true;
  try {
    await $fetch(`/api/repos/${repoId}/clone`, {
      key: `cloneRepo-${repoId}`,
      method: "POST",
      headers: {
        gh_token: githubCookie.value!,
      },
    });
  } catch (error) {
    console.error(error);
  }
  loading.value = false;
  await router.push(`/repos/${repoId}/chat`);
}
</script>
