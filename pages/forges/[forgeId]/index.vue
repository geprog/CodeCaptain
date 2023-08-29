<template>
  <div class="flex w-full justify-center">
    <UForm v-if="forge" ref="form" :schema="schema" :state="forge" @submit.prevent="submit">
      <UFormGroup label="Host" name="host">
        <UInput v-model="forge.host" disabled />
      </UFormGroup>

      <UFormGroup label="Type" name="type">
        <UInput v-model="forge.type" disabled />
      </UFormGroup>

      <UFormGroup label="Client ID" name="clientId">
        <UInput v-model="forge.clientId" />
      </UFormGroup>

      <UFormGroup label="Client Secret" name="clientSecret">
        <UInput v-model="forge.clientSecret" />
      </UFormGroup>

      <div class="flex mt-4 gap-2">
        <UButton label="Delete forge" icon="i-heroicons-trash" color="red" @click="deleteForge" />
        <UButton type="submit" label="Update forge" icon="i-heroicons-arrow-path-20-solid" />
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';

const schema = z.object({
  host: z.string().nonempty(),
  clientId: z.string().nonempty(),
  clientSecret: z.string().nonempty(),
});

const route = useRoute();
const forgeId = route.params.forgeId;
const { data: forge } = await useFetch(`/api/forges/${forgeId}`);

const form = ref<HTMLFormElement>();

const toast = useToast();

async function submit() {
  await form.value!.validate();

  await $fetch(`/api/forges/${forgeId}`, {
    method: 'POST',
    body: forge.value,
  });

  toast.add({
    title: 'Forge updated',
    description: `Forge ${forge.value!.host} updated successfully`,
    color: 'green',
  });
}

async function deleteForge() {
  await $fetch(`/api/forges/${forgeId}`, {
    method: 'DELETE',
  });

  toast.add({
    title: 'Forge removed',
    description: `Forge ${forge.value!.host} removed successfully`,
    color: 'green',
  });

  await navigateTo('/');
}
</script>
