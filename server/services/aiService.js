const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateResponse(userMessage) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", 
    messages: [
      {
        role: "system",
        content: "Ти ШІ агент онлайн-бібліотеки. Рекомендуй книги, пояснюй коротко та по суті."
      },
      {
        role: "user",
        content: userMessage
      }
    ],
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}

module.exports = { generateResponse };