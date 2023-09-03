<template>
  <UFormGroup
    label="Auth callback url"
    :description="`Use this url when creating the oAuth application in ${forgeType}.`"
  >
    <UInput :model-value="authRedirectUrl" disabled />
  </UFormGroup>

  <UFormGroup :label="forgeLabels[forgeType].clientId" name="clientId">
    <UInput :model-value="forgeClientId" @update:model-value="$emit('update:forgeClientId', $event)" />
  </UFormGroup>

  <UFormGroup :label="forgeLabels[forgeType].clientSecret" name="clientSecret">
    <UInput :model-value="forgeClientSecret" @update:model-value="$emit('update:forgeClientSecret', $event)" />
  </UFormGroup>
</template>

<script setup lang="ts">
defineProps<{
  forgeType: string;
  forgeClientId?: string;
  forgeClientSecret?: string;
}>();

defineEmits<{
  (name: 'update:forgeClientId', value: string): void;
  (name: 'update:forgeClientSecret', value: string): void;
}>();

const forgeLabels: Record<
  string,
  {
    clientId: string;
    clientSecret: string;
  }
> = {
  gitlab: {
    clientId: 'Application ID',
    clientSecret: 'Secret',
  },
};

const config = useRuntimeConfig();
const authRedirectUrl = computed(() => {
  const url = new URL('/api/auth/callback', config.public.APP_URL);
  return url.toString();
});
</script>
