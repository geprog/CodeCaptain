<template>
  <div class="m-auto flex flex-col justify-center items-center">
    <span class="text-lg"
      >Hey 👋, I will help you understanding your own code ;-)</span
    >

    <div class="flex flex-wrap gap-2 justify-center mt-4">
      <RepoList
        v-for="repo in repositories.filter((r) => r.active)"
        class="w-1/3"
        :key="repo.id"
        :repo="repo"
      />

      <a
        class="w-1/3 border border-gray-600 rounded p-2 flex items-center justify-center"
        href="/repos/add"
      >
        <Button href="">+</Button>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const githubCookie = useGithubCookie();

const repositories = ref(
  await $fetch("/api/repos/list", {
    headers: {
      gh_token: githubCookie.value!,
    },
  })
);
</script>
