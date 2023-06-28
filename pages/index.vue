<template>
  <div class="m-auto flex flex-col justify-center items-center">
    <span class="text-lg"
      >Hey 👋, I will help you understanding your own code ;-)</span
    >

    <div class="flex flex-wrap gap-2 justify-center mt-4">
      <span v-if="repositories.length === 0">No repositories found!</span>

      <Card v-for="repo in repositories.filter((r) => r.active)" :key="repo.id">
        <div class="flex flex-col justify-center items-center">
          <span class="mb-4">{{ repo.full_name }}</span>
          <Button :href="`/repos/${repo.id}/chat`">Open</Button>
        </div>
      </Card>

      <Card>
        <div class="flex flex-col justify-center items-center">
          <span class="mb-4">Add repo</span>
          <Button href="/repos/add">+</Button>
        </div>
      </Card>
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
