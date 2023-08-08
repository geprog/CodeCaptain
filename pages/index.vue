<template>
  <div class="m-auto flex flex-col justify-center items-center">
    <span class="text-2xl font-bold mb-4">Hey 👋, I will help you understanding your own code 😜</span>

    <div class="flex flex-wrap gap-4 justify-center mt-4 min-h-fit max-w-4xl">
      <template v-if="repositories">
        <Card v-for="repo in repositories.filter((r) => r.active)" :key="repo.id" :href="`/repos/${repo.id}/chat`">
          <div class="flex flex-col items-center p-2 gap-2 w-64 h-full justify-between">
            <span class="font-bold text-gray-300 text-xl">{{ repo.full_name }}</span>
            <Button class="flex justify-center items-center">Open</Button>
          </div>
        </Card>

        <Card href="/repos/add">
          <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
            <span class="font-bold text-gray-300 text-xl">Add a repository</span>
            <Button class="flex justify-center items-center">+ Add</Button>
          </div>
        </Card>
      </template>
    </div>

    <div v-if="unconnectedForges && unconnectedForges.length > 0">
      <span>Connect to</span>
      <Button
        v-for="forge in unconnectedForges"
        :key="forge.id"
        class="flex justify-center items-center"
        @click="connectForge(forge.oauthRedirectUrl)"
        >Connect to {{ forge.name }}</Button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
const githubCookie = useGithubCookie();

// TODO: get repos via api
const repositories = ref(
  await $fetch('/api/repos/list', {
    headers: {
      gh_token: githubCookie.value!,
    },
  }),
);

const forges = await useFetch('/api/user/forges', {
  server: false,
});
const unconnectedForges = computed(() => forges.data.value?.filter((f) => !f.isConnected));

function connectForge(oauthRedirectUrl: string) {
  window.location.href = oauthRedirectUrl;
}
</script>
