<template>
  <div class="m-auto flex flex-col justify-center items-center">
    <span class="text-2xl font-bold mb-4"
      >Hey 👋, I will help you understanding your own code ;-)</span
    >

    <Card class="m-5 flex justify-start">
      <div class="flex flex-col gap-5 p-2 justify-center w-150 items-center">
        <span class="flex justify-center items-center m-0 font-bold text-xl"
          >Add repositories</span
        >
        <Button href="/repos/add" class="flex justify-center items-center"
          >+</Button
        >
      </div>
    </Card>

    <div class="flex gap-2 justify-center mt-4">
      <span v-if="repositories.length === 0">No repositories found!</span>

      <div
        v-for="repo in repositories.filter((r) => r.active)"
        :key="repo.id"
        class="gap-5 w-80 rounded overflow-hidden shadow-lg border-gray-200"
        style="background-color: #0a0b14"
      >
        <div class="px-6 py-4">
          <div class="font-bold text-xl mb-2">Repository name</div>
          <p class="text-gray-500 text-base">
            {{ repo.full_name }}
          </p>
        </div>
        <div class="px-6 py-4">
          <Button
            :href="`/repos/${repo.id}/chat`"
            class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
            >Open</Button
          >
        </div>
      </div>
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
