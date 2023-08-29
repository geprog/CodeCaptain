<template>
  <div class="flex w-full justify-center">
    <UForm ref="form" :schema="schema" :state="newForge" @submit.prevent="submit">
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

      <UButton type="submit" label="Add forge" icon="i-heroicons-plus" class="mt-2" />
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

const forgeTypes = ['gitlab']; // TODO: support other forges

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

  await navigateTo(`/forges/${forge.id}`);
}
</script>
