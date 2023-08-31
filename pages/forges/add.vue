<template>
  <div class="flex flex-col w-full items-center">
    <h1 class="text-2xl mb-8">Add a new forge</h1>

    <UForm
      ref="form"
      :schema="schema"
      :state="newForge"
      @submit.prevent="submit"
      class="flex flex-col gap-2 w-full max-w-2xl"
    >
      <UFormGroup label="Host" name="host">
        <UInput v-model="newForge.host" />
      </UFormGroup>

      <UFormGroup label="Type" name="type">
        <USelectMenu v-model="newForge.type" :options="forgeTypes" />
      </UFormGroup>

      <UFormGroup label="Client ID" name="clientId">
        <UInput v-model="newForge.clientId" />
      </UFormGroup>

      <UFormGroup label="Client Secret" name="clientSecret">
        <UInput v-model="newForge.clientSecret" />
      </UFormGroup>

      <UButton type="submit" label="Add forge" icon="i-heroicons-plus" class="mt-2 mx-auto" />
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';

const forgeTypes = ['gitlab']; // TODO: support other forges

const toast = useToast();
const { reloadForges } = await useForgesStore();

const schema = z.object({
  host: z.string().nonempty(),
  type: z.enum(['gitlab']),
  clientId: z.string().nonempty(),
  clientSecret: z.string().nonempty(),
});

const newForge = ref({
  host: undefined,
  type: forgeTypes[0],
  clientId: undefined,
  clientSecret: undefined,
});

const form = ref<HTMLFormElement>();

async function submit() {
  await form.value!.validate();

  const forge = await $fetch('/api/forges', {
    method: 'POST',
    body: newForge.value,
  });

  await reloadForges();

  await navigateTo(`/`);

  toast.add({
    title: 'Forge added',
    description: `Forge ${forge.host} added successfully`,
    color: 'green',
  });
}
</script>
