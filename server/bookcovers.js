require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");

const connectDatabase = require("./config/database");
const Book = require("./models/Book");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCoverUrl(coverId, size = "L") {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

async function findCoverForBook(book) {
  // 1. Якщо є ISBN — це найточніший спосіб
  if (book.isbn) {
    try {
      const isbnUrl = `https://openlibrary.org/isbn/${encodeURIComponent(
        book.isbn
      )}.json`;

      const isbnRes = await axios.get(isbnUrl);

      if (isbnRes.data?.covers?.length > 0) {
        return buildCoverUrl(isbnRes.data.covers[0]);
      }
    } catch (err) {
      // Якщо по ISBN не знайшло — йдемо далі
    }
  }

  // 2. Шукаємо по оригінальній назві + автору
  const originalQuery = `${book.title || ""} ${book.author || ""}`.trim();

  if (originalQuery) {
    try {
      const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(
        originalQuery
      )}&limit=5`;

      const searchRes = await axios.get(searchUrl);
      const docs = searchRes.data?.docs || [];

      const docWithCover = docs.find((doc) => doc.cover_i);

      if (docWithCover?.cover_i) {
        return buildCoverUrl(docWithCover.cover_i);
      }
    } catch (err) {
      // Якщо не знайшло — пробуємо українську назву
    }
  }

  // 3. Fallback: шукаємо по українській назві, якщо вона є
  if (book.titleUk) {
    try {
      const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(
        book.titleUk
      )}&limit=5`;

      const searchRes = await axios.get(searchUrl);
      const docs = searchRes.data?.docs || [];

      const docWithCover = docs.find((doc) => doc.cover_i);

      if (docWithCover?.cover_i) {
        return buildCoverUrl(docWithCover.cover_i);
      }
    } catch (err) {
      return "";
    }
  }

  return "";
}

async function updateBookCovers() {
  await connectDatabase();

  try {
    const books = await Book.find({
      $or: [
        { coverUrl: { $exists: false } },
        { coverUrl: "" },
        { coverUrl: null },
      ],
    });

    console.log(`📚 Книг без обкладинки: ${books.length}`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const book of books) {
      try {
        console.log(`\n🔎 Шукаю обкладинку для: ${book.title}`);

        const coverUrl = await findCoverForBook(book);

        if (!coverUrl) {
          console.log(`⏭️ Не знайдено обкладинку: ${book.title}`);
          skippedCount++;
          await sleep(300);
          continue;
        }

        book.coverUrl = coverUrl;
        await book.save();

        updatedCount++;

        console.log(`✅ Додано обкладинку: ${book.title}`);
        console.log(coverUrl);

        // Невелика пауза, щоб не спамити Open Library
        await sleep(400);
      } catch (err) {
        errorCount++;
        console.error(`❌ Помилка для "${book.title}":`, err.message);
        await sleep(1000);
      }
    }

    console.log("\n🎉 Готово!");
    console.log(`✅ Оновлено: ${updatedCount}`);
    console.log(`⏭️ Не знайдено: ${skippedCount}`);
    console.log(`❌ Помилок: ${errorCount}`);
  } catch (err) {
    console.error("❌ Загальна помилка:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB відключено");
  }
}

updateBookCovers();