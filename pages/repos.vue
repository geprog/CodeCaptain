<template>
  <div>
    <span>Repos:</span>

    <li v-for="repo in repositories.filter((r) => !r.active)" :key="repo.id">
      <button @click="cloneRepo(repo.id)">
        {{ repo.full_name }}
      </button>
    </li>
  </div>
</template>

<script setup lang="ts">
const githubCookie = useGithubCookie();

const repositories = ref(await $fetch("/api/repos/list"));

async function cloneRepo(repoId: number) {
  await useFetch(`/api/repos/${repoId}/clone`, {
    key: `cloneRepo-${repoId}`,
    method: "POST",
  });
}
</script>
