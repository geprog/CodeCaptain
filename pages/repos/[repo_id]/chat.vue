<template>
  <div class="flex flex-col w-full">
    <div class="flex-1 p-4">
      <!-- Chat history section -->
      <div
        v-for="message in chatHistory"
        :key="message.id"
        class="mb-4 rounded-md"
        style="background-color: #10101f"
      >
        <div v-if="message.sender === 'user'" class="flex justify-start w-full">
          <div class="max-w-15 p-2 rounded-lg flex gap-2">
            💁
            <vue-markdown :source="message.text"></vue-markdown>
          </div>
        </div>
        <div
          v-else-if="message.sender === 'error'"
          class="flex justify-start w-full bg-red-700 rounded-md"
        >
          <div class="max-w-15 p-2 text-white rounded-lg flex gap-2">
            ❌
            <vue-markdown :source="message.text"></vue-markdown>
          </div>
        </div>
        <div
          v-else
          class="flex justify-start w-full rounded-md"
          style="background-color: #1c1f37"
        >
          <div class="max-w-15 p-2 text-white rounded-lg flex gap-2">
            🤖
            <vue-markdown :source="message.text"></vue-markdown>
          </div>
        </div>
      </div>

      <div v-if="thinking" class="mb-4" style="background-color: #10101f">
        <div
          class="flex justify-start w-full rounded-md"
          style="background-color: #1c1f37"
        >
          <div class="max-w-15 p-2 text-white rounded-lg flex gap-2">
            🤔
            <p>Thinking ...</p>
          </div>
        </div>
      </div>
    </div>
    <div class="p-4">
      <!-- Input field -->
      <div class="flex">
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
  </div>
</template>

<script lang="ts" setup>
import VueMarkdown from "vue-markdown-render";

const chatHistory = ref([
  { id: 2, sender: "assistant", text: "Hi there! How can I assist you?" },
]);
const inputText = ref("");
const githubToken = useGithubCookie();
const route = useRoute();
const thinking = ref(false);

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
    const res: { answer: string } = await $fetch(
      `/api/repos/${route.params.repo_id}/chat`,
      {
        method: "POST",
        body: JSON.stringify({
          message,
        }),
        headers: {
          gh_token: githubToken.value!,
        },
      }
    );

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
  position: absolute;
  bottom: 20px;
  right: 12px;
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
