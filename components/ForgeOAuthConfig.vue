<template>
  <UFormGroup label="OAuth app settings" class="mb-4">
    <div class="flex flex-col border dark:border-gray-700 rounded-md p-2 gap-4">
      <p class="text-gray-500 dark:text-gray-400">
        Manage your OAuth app
        <NuxtLink :href="forgeLabels.appUrl(forgeHost)" target="_blank" class="text-blue-500 underline">here</NuxtLink>.
      </p>

      <div>
        <p class="text-gray-500 dark:text-gray-400">The redirect url needs to be set to:</p>
        <UInput :model-value="authRedirectUrl" disabled size="sm" />
      </div>

      <div>
        <p class="text-gray-500 dark:text-gray-400">Allow it to request this scopes:</p>
        <UInput :model-value="forgeLabels.scopes.join(', ')" disabled size="sm" />
      </div>
    </div>
  </UFormGroup>

  <UFormGroup :label="forgeLabels.clientId" name="clientId">
    <UInput :model-value="forgeClientId" @update:model-value="$emit('update:forgeClientId', $event)" />
  </UFormGroup>

  <UFormGroup :label="forgeLabels.clientSecret" name="clientSecret">
    <UInput :model-value="forgeClientSecret" @update:model-value="$emit('update:forgeClientSecret', $event)" />
  </UFormGroup>
</template>

<script setup lang="ts">
const props = defineProps<{
  forgeType: string;
  forgeHost: string;
  forgeClientId?: string;
  forgeClientSecret?: string;
}>();

defineEmits<{
  (name: 'update:forgeClientId', value: string): void;
  (name: 'update:forgeClientSecret', value: string): void;
}>();

const forgesLabels: Record<
  string,
  {
    appUrl: (host: string) => string;
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
    scopes: string[];
  }
> = {
  gitlab: {
    appUrl: (host) => `https://${host}/oauth/applications`,
    clientId: 'Application ID',
    clientSecret: 'Secret',
    redirectUrl: 'Redirect URI',
    scopes: ['read_user', 'read_repository', 'read_api', 'email', 'profile'],
  },
};

const forgeLabels = computed(() => forgesLabels[props.forgeType]);

const config = useRuntimeConfig();
const authRedirectUrl = computed(() => {
  const url = new URL('/api/auth/callback', config.public.APP_URL);
  return url.toString();
});
</script>
