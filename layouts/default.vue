<template>
  <div class="flex flex-col h-screen w-screen text-gray-200 bg-gray-700">
    <header
      class="flex w-full h-16 border-gray-700 bg-gray-900 border-b p-4 items-center"
    >
      <a class="text-xl flex gap-2 items-center" href="/">
        <img src="/icon.svg" alt="CodeCaptain logo" class="w-10 -rotate-45" />
        codecaptain.ai</a
      >
      <div class="ml-auto flex gap-4 items-center">
        <template v-if="user">
          <img
            :src="user.avatar_url"
            alt="User profile icon"
            class="w-8 h-auto rounded-full"
          />
          <button
            class="border rounded px-2 py-1 flex items-center justify-center gap-1 hover:bg-black hover:text-white"
            @click="logout"
          >
            Logout
          </button>
        </template>
        <Button v-else @click="login">
          <Icon name="fa-brands:github" /> Login with GitHub
        </Button>
      </div>
    </header>

    <main class="flex w-full h-full flex-grow overflow-auto">
      <template v-if="user">
        <slot />
      </template>
      <div v-else>
        <span>Please login ;-)</span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const login = githubLogin;
const logout = githubLogout;
const user = await fetchGithubUser();
</script>

<style>
* {
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
