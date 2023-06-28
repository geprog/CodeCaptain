<template>
  <div class="flex flex-col w-full">
    <div class="flex-1 p-4">
      <!-- Chat history section -->
      <div v-for="message in chatHistory" :key="message.id" class="mb-4" style="background-color: #10101f;">
        <div v-if="message.sender === 'user'" class="flex justify-start w-full ">
          <div class="max-w-xs p-2 rounded-lg flex gap-2">
            💁 <p>{{ message.text }}</p>
          </div>
        </div>
        <div v-else class="flex justify-start w-full" style="background-color: #1c1f37;">
          <div class="max-w-xs p-2 text-white rounded-lg flex gap-2">
            👽 <p>{{ message.text }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="p-4" style="background-color: #0a0b14;"> 
      <!-- Input field -->
      <div class="flex">
        <input v-model="inputText" @keydown.enter="sendMessage" type="text" class="flex-1 px-4 py-2 mr-12 rounded" placeholder="Type a message..." style="background-color: #1c1f37;"/>
        <!-- <button  class="px-4 py-2 text-white bg-blue-500 rounded-full">Send</button> -->
        <input type="checkbox" id="inputCheck" hidden />
        <label for="inputCheck" class="fab-btn" @click="sendMessage">
          <span>></span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chatHistory: [
        { id: 1, sender: 'user', text: 'Hello' },
        { id: 2, sender: 'assistant', text: 'Hi there! How can I assist you?' },
      ],
      inputText: ''
    };
  },
  methods: {
    sendMessage() {
      if (this.inputText.trim() !== '') {
        this.chatHistory.push({ id: Date.now(), sender: 'user', text: this.inputText.trim() });
        this.inputText = '';
        // Send the message to ChatGPT or perform any desired actions here
      }
    }
  }
};
</script>

<style scoped>
.overflow-y-scroll {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E0 #E5E7EB;
}

.overflow-y-scroll::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-scroll::-webkit-scrollbar-track {
  background-color: #E5E7EB;
}

.overflow-y-scroll::-webkit-scrollbar-thumb {
  background-color: #CBD5E0;
  border-radius: 3px;
}

.input-field:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}

.fab-btn {
  position: absolute;
  bottom: 16px;
  right: 12px;
  border-radius: 50%;
  width:40px;
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
