<template>
  <div v-if="repo && chat" class="flex items-center flex-col w-full flex-grow">
    <div class="flex w-full p-2 items-center">
      <NuxtLink :to="repo.url" target="_blank" class="flex gap-4 mr-auto items-center text-2xl">
        <img v-if="repo.avatarUrl" :src="repo.avatarUrl" alt="avatar" class="w-8 h-8 rounded-md" />
        <span>{{ chat.name }}</span>
      </NuxtLink>

      <div class="flex gap-2">
        <NuxtLink :to="repo.url" target="_blank">
          <UButton icon="i-ion-git-pull-request" variant="outline" label="Source" />
        </NuxtLink>

        <UButton
          v-if="repo.lastFetch"
          icon="i-ion-cloud-download-outline"
          label="Synchronize"
          variant="outline"
          @click="reIndex"
        />
        <UButton label="Delete" icon="i-heroicons-trash" color="red" @click="deleteChat" />
      </div>
    </div>

    <div v-if="indexing" class="mx-auto flex flex-col gap-4 pt-8">
      <span class="text-2xl mx-auto">Whoho lets go and do some indexing.</span>
      <img src="~/assets/loading.gif" alt="loading" />
      <div class="flex flex-col gap-0">
        <span v-if="indexingLog">{{ indexingLog }}</span>
      </div>
    </div>

    <div v-else-if="!repo.lastFetch" class="flex flex-col m-auto gap-4">
      <p class="text-2xl mx-auto">Should we start indexing your repository?</p>
      <UButton
        class="mx-auto"
        icon="i-ion-cloud-download-outline"
        label="Index repository"
        variant="outline"
        @click="reIndex"
      />
    </div>

    <template v-else>
      <div class="flex-1 flex w-full max-w-4xl flex-col p-4 gap-4 items-center overflow-y-auto">
        <!-- Chat history section -->
        <div
          v-for="message in chat.messages"
          :key="message.id"
          class="flex w-full gap-2"
          :class="{
            'justify-end': message.from === 'user',
          }"
        >
          <template v-if="message.from === 'user'">
            <div class="w-10 flex-shrink-0" />
            <UAlert title="" color="primary" variant="subtle">
              <template #title>
                <Markdown :source="message.content" />
              </template>
            </UAlert>
            <div class="flex items-center justify-center rounded w-10 h-10 p-2 flex-shrink-0">
              <span class="text-2xl">💁</span>
            </div>
          </template>
          <template v-else-if="message.from === 'error'">
            <div class="flex items-center justify-center w-10 h-10 p-2 flex-shrink-0">
              <span class="text-2xl">❌</span>
            </div>
            <UAlert title="" color="red" variant="subtle">
              <template #title>
                <Markdown :source="message.content" />
              </template>
            </UAlert>
            <div class="w-10 flex-shrink-0" />
          </template>
          <template v-else>
            <div class="flex items-center justify-center rounded w-10 h-10 p-2 flex-shrink-0">
              <span class="text-2xl">🤖</span>
            </div>
            <UAlert title="" color="violet" variant="subtle">
              <template #title>
                <Markdown :source="message.content" />
              </template>
            </UAlert>
            <div class="w-10 flex-shrink-0" />
          </template>
        </div>

        <div v-if="thinking" class="flex w-full p-2 gap-2">
          <div class="w-10" />
          <span class="text-2xl">🤔</span>
          <p>Thinking ...</p>
        </div>
      </div>

      <div v-if="chat.messages.length < 2" class="flex gap-4">
        <UButton size="lg" label="What is this project about?" @click="askQuestion('What is this project about?')" />
        <UButton
          size="lg"
          label="Which programming languages are used in this project?"
          @click="askQuestion('Which programming languages are used in this project?')"
        />
        <UButton
          size="lg"
          label="Could you explain the technical project structure to me?"
          @click="askQuestion('Could you explain the technical project structure to me?')"
        />
      </div>

      <div class="flex my-4 mx-12 w-full max-w-4xl justify-center gap-2">
        <div class="flex-grow">
          <UInput
            v-model="inputText"
            color="primary"
            variant="outline"
            size="lg"
            placeholder="Type a message ..."
            @keydown.enter="sendMessage"
          />
        </div>

        <input type="checkbox" id="inputCheck" hidden />

        <label for="inputCheck" class="fab-btn flex items-center justify-center cursor-pointer" @click="sendMessage">
          <UButton icon="i-mdi-send" size="lg" :ui="{ rounded: 'rounded-full' }" @click="sendMessage" />
        </label>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import Markdown from '~/components/Markdown.vue';

const chatsStore = await useChatsStore();

const chatHistory = ref([{ id: 2, sender: 'assistant', text: 'Hi there! How can I assist you?' }]);
const inputText = ref('');
const thinking = ref(false);
const route = useRoute();
const toast = useToast();
const chatId = computed(() => route.params.chat_id);

const { data: chat, refresh: refreshChat } = await useFetch(() => `/api/chats/${chatId.value}`);
const { data: repo } = await useFetch(() => `/api/repos/${chat.value?.repoId}`);

async function askQuestion(message: string) {
  inputText.value = message;
  await sendMessage();
}

async function sendMessage() {
  if (!chat.value) {
    throw new Error('Unexpected: Chat not found');
  }

  if (thinking.value) {
    return;
  }

  const message = inputText.value;
  if (message === '') {
    return;
  }

  chatHistory.value.push({
    id: Date.now(),
    sender: 'user',
    text: message,
  });
  inputText.value = '';

  thinking.value = true;

  try {
    const res = await $fetch(`/api/chats/${chat.value.id}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message,
      }),
    });

    if (res.answer) {
      chatHistory.value.push({
        id: Date.now(),
        sender: 'assistant',
        text: res.answer,
      });
    }
  } catch (e) {
    const error = e as Error;
    chatHistory.value.push({
      id: Date.now(),
      sender: 'error',
      text: error.message,
    });
  }

  thinking.value = false;
  await refreshChat();
}

const indexing = ref(false);
const indexingLog = ref<string>();
async function reIndex() {
  if (!repo.value) {
    throw new Error('Unexpected: Repo not found');
  }

  indexing.value = true;
  indexingLog.value = undefined;
  try {
    const stream = await $fetch<ReadableStream>(`/api/repos/${repo.value.id}/clone`, {
      method: 'POST',
      responseType: 'stream',
    });

    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const text = new TextDecoder().decode(value);
      indexingLog.value = text;
    }

    toast.add({
      title: 'Success',
      description: 'Repo synced successfully',
      color: 'green',
    });
  } catch (e) {
    const error = e as Error;
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red',
    });
  }
  indexing.value = false;
}

async function deleteChat() {
  if (!chat.value) {
    return;
  }

  if (!confirm(`Do you want to remove the chat "${chat.value.name}"`)) {
    return;
  }

  await $fetch(`/api/chats/${chat.value.id}`, {
    method: 'DELETE',
  });

  toast.add({
    title: 'Chat removed',
    description: `Chat ${chat.value!.name} removed successfully`,
    color: 'green',
  });

  await chatsStore.refresh();

  await navigateTo('/');
}
</script>

<style scoped>
.fab-btn {
  transition: box-shadow 0.4s ease;
}

input:checked + .fab-btn span {
  transform: rotate(360deg);
}
</style>
