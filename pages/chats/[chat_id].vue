<template>
  <div v-if="repo && chat" class="flex items-center flex-col w-full flex-grow">
    <div class="flex w-full p-2 items-center">
      <NuxtLink :to="`/repos/${repo.id}`" class="flex min-w-0 gap-4 mr-auto items-center text-2xl">
        <img
          v-if="repo.avatarUrl"
          :src="repo.avatarUrl"
          alt="avatar"
          class="w-8 h-8 flex-shrink-0 rounded-md dark:bg-white"
        />
        <span class="truncate">{{ chat.name }}</span>
      </NuxtLink>

      <div class="flex gap-2">
        <NuxtLink :to="repo.url" target="_blank">
          <UButton icon="i-ion-git-pull-request" variant="outline" label="Source" />
        </NuxtLink>

        <UButton label="Delete" icon="i-heroicons-trash" color="red" @click="deleteChat" />
      </div>
    </div>

    <div class="flex-1 flex w-full max-w-4xl flex-col p-4 gap-4 items-center overflow-y-auto">
      <!-- Chat history section -->
      <div
        v-for="message in chat.messages"
        :key="message.id"
        class="flex w-full gap-2 items-center"
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
          <UAlert title="" color="primary" variant="subtle">
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
  </div>
</template>

<script lang="ts" setup>
import Markdown from '~/components/Markdown.vue';

const chatsStore = await useChatsStore();

const inputText = ref('');
const thinking = ref(false);
const route = useRoute();
const toast = useToast();
const chatId = computed(() => route.params.chat_id);

const { data: chat, refresh: refreshChat } = await useFetch(() => `/api/chats/${chatId.value}`);
const { data: repo } = await useFetch(() => `/api/repos/${chat.value?.repoId}`);

type Source = {
  url: string;
  title: string;
};

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

  chat.value.messages.push({
    id: Date.now(),
    chatId: chat.value.id,
    from: 'user',
    content: message,
    createdAt: new Date().toISOString(),
  });
  inputText.value = '';

  thinking.value = true;

  try {
    const _chatId = chat.value.id;

    const response = await fetch(`/api/chats/${chat.value.id}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.status !== 200) {
      throw new Error('Failed to send message');
    }

    const runId = response.headers.get('x-langsmith-run-id');

    thinking.value = false;
    chat.value.messages.push({
      id: Date.now(),
      chatId: _chatId,
      from: 'ai',
      content: '',
      createdAt: new Date().toISOString(),
    });
    const aiMessageIndex = chat.value!.messages.length - 1;

    function updateLastMessage(content: string) {
      const _chat = chat.value!;
      _chat.messages[aiMessageIndex].content += content;
      chat.value = _chat;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to read response');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      updateLastMessage(decoder.decode(value));
    }

    // const runId = currentRunId.value;
    // if (runId) {
    //   await shareRun(runId);
    // }
    console.log('done', runId);
    thinking.value = false;
    // await refreshChat();
    await chatsStore.refresh();
  } catch (e) {
    const error = e as Error;
    chat.value.messages.push({
      id: Date.now(),
      chatId: chat.value.id,
      from: 'error',
      content: error.message,
      createdAt: new Date().toISOString(),
    });
    thinking.value = false;
  }
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
