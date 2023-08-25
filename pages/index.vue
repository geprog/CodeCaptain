<template>
  <div class="m-auto flex flex-col justify-center items-center">
    <span class="text-2xl font-bold mb-4">Hey 👋, I will help you understanding your own code 😜</span>

    <div class="flex flex-wrap gap-4 justify-center mt-4 min-h-fit max-w-4xl">
      <template v-if="repositories">
        <Card v-for="repo in repositories" :key="repo.id" :href="`/repos/${repo.id}/chat`">
          <div class="flex flex-col items-center p-2 gap-2 w-64 h-full justify-between">
            <span class="font-bold text-gray-300 text-xl">{{ repo.name }}</span>
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

    <div v-if="forges && forges.length > 0" class="flex flex-col mt-8">
      <span class="text-xl font-bold">Forges</span>
      <div v-for="forge in forges" :key="forge.id">
        <Button v-if="!forge.isConnected" class="flex justify-center items-center" @click="login(forge.id)"
          >Connect to {{ forge.name }}</Button
        >
        <NuxtLink v-else to="/repos/add">{{ forge.name }} {{ forge.host }} (connected)</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login } = await useAuth();

const { data: repositories } = await useFetch('/api/repos/list');
const { data: forges } = await useFetch('/api/user/forges');
</script>
