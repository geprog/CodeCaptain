<template>
  <div class="flex flex-col">
    <span class="text-2xl font-bold mb-4">Hey 👋, I will help you understanding your own code 😜</span>

    <div class="flex flex-wrap gap-4 mt-4">
      <template v-if="repositories">
        <NuxtLink v-for="repo in repositories" :key="repo.id" :to="`/repos/${repo.id}/chat`">
          <Card>
            <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
              <span class="font-bold font-semibold text-2xl mt-2">{{ repo.name }}</span>
              <!-- <Button class="flex justify-center items-center mt-8">Chat</Button> -->
              <UButton size="md" icon="i-heroicons-pencil-square" variant="outline" class="mt-8" label="Chat" />
            </div>
          </Card>
        </NuxtLink>
        <NuxtLink to="/repos/add">
          <Card>
            <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
              <span class="font-bold font-semibold text-2xl mt-2">Add a repository</span>
              <UButton size="md" icon="i-heroicons-plus" variant="outline" class="mt-8" label="Add" />
            </div>
          </Card>
        </NuxtLink>
      </template>
    </div>

    <!-- <div v-if="forges && forges.length > 0" class="flex flex-col mt-8">
      <span class="text-xl font-bold">Forges</span>
      <div v-for="forge in forges" :key="forge.id">
        <Button v-if="!forge.isConnected" class="flex justify-center items-center" @click="login(forge.id)"
          >Connect to {{ forge.name }}</Button
        >
        <NuxtLink v-else to="/repos/add">{{ forge.name }} {{ forge.host }} (connected)</NuxtLink>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
const { login } = await useAuth();

const { data: repositories } = await useFetch('/api/repos');
const { data: forges } = await useFetch('/api/user/forges');
</script>
