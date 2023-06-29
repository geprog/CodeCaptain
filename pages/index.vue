<template>
  <div class="m-auto flex flex-col justify-center items-center">
    <span class="text-2xl font-bold mb-4"
      >Hey 👋, I will help you understanding your own code 😜</span
    >

    <div class="flex flex-wrap gap-4 justify-center mt-4 min-h-fit">
      <template v-if="repositories">
        <span v-if="repositories.length === 0">No repositories found!</span>
        <div class="flex-col">
          <Card>
            <div
              class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64"
            >
              <span class="font-bold text-gray-300 text-2xl"
                >Add repositories</span
              >
              <Button href="/repos/add" class="flex justify-center items-center"
                >+ Add</Button
              >
            </div>
          </Card>

          <div class="flex gap-3 mt-5">
            <Card
              v-for="repo in repositories.filter((r) => r.active)"
              :key="repo.id"
            >
              <div
                class="flex flex-col items-start p-2 gap-2 w-64 h-full justify-between"
              >
                <span class="font-bold text-gray-300">{{
                  repo.full_name
                }}</span>
                <Button :href="`/repos/${repo.id}/chat`" class="items-end"
                  >Open</Button
                >
              </div>
            </Card>
          </div>
        </div>
      </template>
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
