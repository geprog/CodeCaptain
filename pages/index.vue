<template>
  <div class="m-auto flex flex-col justify-center items-center">
    <span class="text-2xl font-bold mb-4"
      >Hey 👋, I will help you understanding your own code ;-)</span
    >

    <div class="flex flex-wrap gap-4 justify-center mt-4">
      <template v-if="repositories">
        <span v-if="repositories.length === 0">No repositories found!</span>

        <Card
          v-for="repo in repositories.filter((r) => r.active)"
          :key="repo.id"
        >
          <div class="flex flex-col items-center p-2 gap-2 w-64">
            <span class="font-bold text-xl">{{ repo.full_name }}</span>
            <Button :href="`/repos/${repo.id}/chat`">Open</Button>
          </div>
        </Card>
      </template>

      <Card>
        <div class="flex flex-col items-center p-2 gap-2 w-64">
          <span class="font-bold text-xl">Add repositories</span>
          <Button href="/repos/add" class="flex justify-center items-center"
            >+ Add</Button
          >
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
