<template>
  <div v-if="loading || !repo" class="flex w-full items-center justify-center">
    <span class="text-2xl">loading ...</span>
  </div>
  <div v-else class="flex items-center flex-col w-full">
    <div class="flex w-full p-2 items-center">
      <span class="mx-auto text-2xl">{{ repo.full_name }}</span>
      <Button :href="repo.link" target="_blank">Github</Button>
      <Button @click="reIndex">re-index</Button>
    </div>

    <div
      class="flex-1 flex w-full max-w-4xl flex-col p-4 gap-4 items-center overflow-y-auto"
    >
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

    <div class="flex my-4 w-full max-w-4xl items-center">
      <!-- Input field -->
      <TextInput
        v-model="inputText"
        @keydown.enter="sendMessage"
        type="text"
        class="flex-1 px-4 h-12 py-2 mr-12"
        placeholder="Type a message..."
      />
      <input type="checkbox" id="inputCheck" hidden />
      <label for="inputCheck" class="fab-btn" @click="sendMessage">
        <span>></span>
      </label>
    </div>
  </div>
</template>

<script lang="ts" setup>
import VueMarkdown from "vue-markdown-render";

const chatHistory = ref([
  { id: 2, sender: "assistant", text: "Hi there! How can I assist you?" },
]);
const inputText = ref("");
const githubCookie = useGithubCookie();
const thinking = ref(false);
const route = useRoute();
const repoId = route.params.repo_id;

const { data: repo } = await useAsyncData("repo", () =>
  $fetch(`/api/repos/${repoId}`, {
    headers: {
      gh_token: githubCookie.value!,
    },
  })
);

async function sendMessage() {
  if (thinking.value) {
    return;
  }

  const message = inputText.value;
  if (message === "") {
    return;
  }

  chatHistory.value.push({
    id: Date.now(),
    sender: "user",
    text: message,
  });
  inputText.value = "";

  thinking.value = true;

  try {
    const res: { answer: string } = await $fetch(`/api/repos/${repoId}/chat`, {
      method: "POST",
      body: JSON.stringify({
        message,
      }),
      headers: {
        gh_token: githubCookie.value!,
      },
    });

    chatHistory.value.push({
      id: Date.now(),
      sender: "assistant",
      text: res.answer,
    });

    console.log(res.answer);
  } catch (error) {
    console.error(error);

    chatHistory.value.push({
      id: Date.now(),
      sender: "error",
      text: (error as Error).message,
    });
  }

  thinking.value = false;
}

const loading = ref(false);
async function reIndex() {
  loading.value = true;
  try {
    await $fetch(`/api/repos/${repoId}/clone`, {
      key: `cloneRepo-${repoId}`,
      method: "POST",
      headers: {
        gh_token: githubCookie.value!,
      },
    });
    await navigateTo(`/repos/${repoId}/chat`);
  } catch (error) {
    console.error(error);
  }
  loading.value = false;
}
</script>

<style scoped>
.overflow-y-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #e5e7eb;
}

.overflow-y-scroll::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-scroll::-webkit-scrollbar-track {
  background-color: #e5e7eb;
}

.overflow-y-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.input-field:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}

.fab-btn {
  position: relative;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  transition: box-shadow 0.4s ease;
  background: #4610f5;
  color: #fff;
  font-size: 1.7rem;
  font-weight: bold;
  cursor: pointer;
}

.fab-btn span {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  transition: transform 0.5s ease;
  font-size: 1.5rem;
}

input:checked + .fab-btn span {
  transform: rotate(360deg);
}
</style>
