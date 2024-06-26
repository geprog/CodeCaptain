<template>
  <div class="flex flex-col w-full">
    <h1 class="text-2xl font-bold">Settings</h1>

    <h2 class="text-xl font-bold mt-4">Forges</h2>

    <div class="flex flex-wrap gap-4 mt-2">
      <Card v-for="forge in forges" :key="forge.id">
        <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
          <div class="flex items-center gap-2 mt-2 mx-auto">
            <UIcon v-if="forge.type === 'github'" name="i-ion-logo-github" class="w-6 h-6 flex-shrink-0" />
            <UIcon v-if="forge.type === 'gitlab'" name="i-ion-logo-gitlab" class="w-6 h-6 flex-shrink-0" />
            <span class="font-semibold text-xl truncate text-center">{{ forge.host }}</span>
          </div>

          <div class="flex gap-2">
            <UButton
              v-if="forge.isOwner"
              icon="i-heroicons-pencil-square"
              class="mt-8"
              label="Edit"
              :to="`/forges/${forge.id}`"
            />

            <a
              :href="`/api/auth/login?forgeId=${forge.id}&redirectUrl=${urlEncoded(`/settings?successful=true&forgeId=${forge.id}`)}`"
            >
              <UButton icon="i-ion-log-in-outline" class="mt-8" label="Login" />
            </a>
          </div>
        </div>
      </Card>

      <NuxtLink to="/forges/add" class="flex">
        <Card clickable>
          <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
            <h2 class="text-xl font-bold">Add new forge</h2>

            <UButton icon="i-heroicons-plus" class="mt-8" label="Create" />
          </div>
        </Card>
      </NuxtLink>
    </div>

    <h2 class="text-xl font-bold mt-4">Repos</h2>

    <div class="flex flex-wrap gap-4 mt-2">
      <NuxtLink v-for="repo in repos" :key="repo.id" :to="`/repos/${repo.id}`" :title="repo.name">
        <Card clickable>
          <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
            <div class="flex items-center gap-2 mt-2 mx-auto w-full">
              <img
                v-if="repo.avatarUrl"
                :src="repo.avatarUrl"
                alt="icon"
                class="w-6 h-6 rounded-md flex-shrink-0 dark:bg-white"
              />
              <UIcon v-else name="i-mdi-source-branch" class="w-6 h-6 flex-shrink-0" />
              <span class="font-semibold text-xl truncate text-center">{{ repo.name }}</span>
            </div>

            <UButton icon="i-heroicons-pencil-square" class="mt-8" label="Edit" />
          </div>
        </Card>
      </NuxtLink>

      <NuxtLink to="/repos/add" class="flex">
        <Card clickable>
          <div class="flex flex-col items-center justify-between p-2 h-full gap-2 w-64">
            <h2 class="text-xl font-bold">Add new repo</h2>

            <UButton icon="i-heroicons-plus" class="mt-8" label="Create" />
          </div>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const toast = useToast();
const { forges } = await useForgesStore();
const { repos } = await useRepositoriesStore();

const urlEncoded = encodeURIComponent;

onMounted(() => {
  if (route.query.successful) {
    const forge = forges.value.find((forge) => forge.id.toString() === route.query.forgeId);
    if (!forge) return;
    toast.add({
      title: `Successfully logged in to ${forge.host}`,
      color: 'green',
    });
  }
});
</script>
