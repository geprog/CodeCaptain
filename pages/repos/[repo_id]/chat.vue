<template>
  <div v-if="loading || !repo" class="flex w-full items-center justify-center">
    <span class="text-2xl">loading ...</span>
  </div>
  <div v-else class="flex items-center flex-col w-full">
    <div class="flex w-full p-2 items-center">
      <span class="mx-auto text-2xl">{{ repo.name }}</span>
      <Button :href="repo.url" target="_blank">Open repo</Button>
      <Button @click="reIndex">re-index</Button>
    </div>

    <div class="flex-1 flex w-full max-w-4xl flex-col p-4 gap-4 items-center overflow-y-auto">
      <!-- Chat history section -->
      <div
        v-for="message in chatHistory"
        :key="message.id"
        class="flex w-full gap-2"
        :class="{
          'justify-end': message.sender === 'user',
        }"
      >
        <template v-if="message.sender === 'user'">
          <div class="w-10" />
          <div class="rounded bg-gray-600 flex-1 p-2">
            <vue-markdown :source="message.text" />
          </div>
          <div class="flex items-center justify-center rounded w-10 h-10 p-2">
            <span class="text-2xl">💁</span>
          </div>
        </template>
        <template v-else-if="message.sender === 'error'">
          <div class="flex items-center justify-center w-10 h-10 p-2">
            <span class="text-2xl">❌</span>
          </div>
          <div class="rounded bg-red-600 flex-1 p-2">
            <vue-markdown :source="message.text" />
          </div>
          <div class="w-10" />
        </template>
        <template v-else>
          <div class="flex items-center justify-center rounded w-10 h-10 p-2">
            <span class="text-2xl">🤖</span>
          </div>
          <div class="rounded bg-gray-500 flex-1 p-2">
            <vue-markdown :source="message.text" />
          </div>
          <div class="w-10" />
        </template>
      </div>

      <div v-if="thinking" class="flex w-full p-2 gap-2">
        <div class="w-10" />
        <span class="text-2xl">🤔</span>
        <p>Thinking ...</p>
      </div>
    </div>

    <div class="flex my-4 mx-12 w-full max-w-4xl justify-center gap-2">
      <div class="w-14" />
      <TextInput
        v-model="inputText"
        @keydown.enter="sendMessage"
        type="text"
        class="flex-1 px-4 h-12 mr-6"
        placeholder="Type a message..."
      />
      <input type="checkbox" id="inputCheck" hidden />
      <label
        for="inputCheck"
        class="fab-btn flex items-center justify-center w-12 h-12 cursor-pointer bg-blue-500 rounded-full"
        @click="sendMessage"
      >
        <span class="text-2xl font-bold text-white">&gt;</span>
      </label>
    </div>
  </div>
</template>

<script lang="ts" setup>
import VueMarkdown from 'vue-markdown-render';

const chatHistory = ref([{ id: 2, sender: 'assistant', text: 'Hi there! How can I assist you?' }]);
const inputText = ref('');
const thinking = ref(false);
const route = useRoute();
const repoId = route.params.repo_id;

const { data: repo } = await useFetch(`/api/repos/${repoId}`);

async function sendMessage() {
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

  const res = await $fetch(`/api/repos/${repoId}/chat`, {
    method: 'POST',
    body: JSON.stringify({
      message,
    }),
    ignoreResponseError: true,
  });

  if (res.error) {
    chatHistory.value.push({
      id: Date.now(),
      sender: 'error',
      text: res.error,
    });
  }

  if (res.answer) {
    chatHistory.value.push({
      id: Date.now(),
      sender: 'assistant',
      text: res.answer,
    });
  }

  thinking.value = false;
}

const loading = ref(false);
async function reIndex() {
  loading.value = true;
  try {
    await $fetch(`/api/repos/${repoId}/clone`, {
      method: 'POST',
    });
    await navigateTo(`/repos/${repoId}/chat`);
  } catch (error) {
    console.error(error);
  }
  loading.value = false;
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
