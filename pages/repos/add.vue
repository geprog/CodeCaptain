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

const repositories = ref(
  await $fetch("/api/repos/list", {
    headers: {
      gh_token: githubCookie.value,
    },
  })
);

async function cloneRepo(repoId: number) {
  await $fetch(`/api/repos/${repoId}/clone`, {
    key: `cloneRepo-${repoId}`,
    method: "POST",
    headers: {
      gh_token: githubCookie.value,
    },
  });
}
</script>
