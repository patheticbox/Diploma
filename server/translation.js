require("dotenv").config();
const mongoose = require("mongoose");

const connectDatabase = require("./config/database");
const Book = require("./models/Book");
const client = require("./utils/nvidiaAI");

const BATCH_SIZE = 10;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanTitle(text = "") {
  return String(text)
    .replace(/^["'«»“”]+|["'«»“”]+$/g, "")
    .replace(/^Українська назва:\s*/i, "")
    .replace(/^Назва українською:\s*/i, "")
    .replace(/^Переклад:\s*/i, "")
    .trim();
}

function chunkArray(array, size) {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

async function translateBatch(books) {
  const booksList = books
    .map((book, index) => {
      return `${index + 1}. "${book.title}" — ${book.author || "Unknown"}`;
    })
    .join("\n");

  const completion = await client.chat.completions.create({
    model: "meta/llama-3.3-70b-instruct",
    messages: [
      {
        role: "system",
        content: `
Ти професійний перекладач назв книжок українською мовою.

Правила:
1. Переклади кожну назву українською.
2. Якщо існує усталена українська назва — використай її.
3. Якщо усталеної назви немає — зроби природний український переклад.
4. Не додавай пояснень.
5. Поверни тільки JSON-масив.
6. Кількість елементів у масиві має точно відповідати кількості книг.
7. Формат кожного елемента:
{
  "index": номер,
  "titleUk": "українська назва"
}
`,
      },
      {
        role: "user",
        content: `
Переклади українською назви цих книг:

${booksList}

Поверни тільки JSON-масив без markdown.
`,
      },
    ],
    temperature: 0.1,
    top_p: 0.7,
    max_tokens: 1200,
    stream: false,
  });

  const raw = completion?.choices?.[0]?.message?.content || "";

  try {
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Не вдалося розпарсити JSON:");
    console.error(raw);
    throw err;
  }
}

async function translateAllBookTitles() {
  await connectDatabase();

  try {
    const books = await Book.find({
      $or: [
        { titleUk: { $exists: false } },
        { titleUk: "" },
        { titleUk: null },
      ],
    });

    console.log(`Знайдено книг без української назви: ${books.length}`);

    const batches = chunkArray(books, BATCH_SIZE);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      console.log(`\nПачка ${i + 1}/${batches.length}`);
      console.log(`Книг у пачці: ${batch.length}`);

      try {
        const translations = await translateBatch(batch);

        for (const item of translations) {
          const bookIndex = item.index - 1;
          const book = batch[bookIndex];

          if (!book) {
            errorCount++;
            continue;
          }

          const titleUk = cleanTitle(item.titleUk);

          if (!titleUk) {
            console.log(`⚠️ Порожній переклад для: ${book.title}`);
            errorCount++;
            continue;
          }

          book.titleUk = titleUk;
          book.language = book.language || "uk";

          await book.save();

          successCount++;

          console.log(`✅ ${book.title} → ${titleUk}`);
        }

        await sleep(1000);
      } catch (err) {
        console.error(`❌ Помилка пачки ${i + 1}:`, err.message);
        errorCount += batch.length;

        await sleep(3000);
      }
    }

    console.log("\nГотово!");
    console.log(`✅ Успішно перекладено: ${successCount}`);
    console.log(`❌ Помилок: ${errorCount}`);
  } catch (err) {
    console.error("Загальна помилка:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB відключено");
  }
}

translateAllBookTitles();