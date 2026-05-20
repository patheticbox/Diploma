// server/utils/nvidiaClient.js
const OpenAI = require("openai");

// Створюємо клієнт NVIDIA OpenAI-сумісний
const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY, // nvapi ключ
  baseURL: "https://integrate.api.nvidia.com/v1",
});

module.exports = client;