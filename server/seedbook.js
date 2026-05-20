require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");

const connectDatabase = require("./config/database");
const Book = require("./models/Book");

const categories = [
  "fantasy",
  "romance",
  "science_fiction",
  "mystery",
  "horror",
  "history",
  "biography",
  "adventure",
  "children",
  "classics",
];

async function seedBooks() {
  await connectDatabase();

  try {
    let addedCount = 0;
    let skippedCount = 0;

    for (const category of categories) {
      console.log(`\n📚 Завантаження категорії: ${category}`);

      const response = await axios.get(
        `https://openlibrary.org/subjects/${category}.json?limit=50`
      );

      const works = response.data.works || [];

      for (const work of works) {
        const title = work.title;
        const author = work.authors?.[0]?.name || "Unknown";

        if (!title) continue;

        const exists = await Book.findOne({
          title,
          author,
        });

        if (exists) {
          skippedCount++;
          continue;
        }

        const subjects = work.subject || [];

        const book = new Book({
          title,
          author,
          description:
            subjects.length > 0
              ? subjects.slice(0, 10).join(", ")
              : `Книга з категорії ${category}`,
          year: work.first_publish_year || null,
          language: "en",

          // головний жанр
          genre: category,

          // додаткові теги
          tags: [
            category,
            ...subjects.slice(0, 8),
          ],
        });

        await book.save();
        addedCount++;

        console.log(`✅ Додано: ${title}`);
      }
    }

    console.log("\n🎉 Seed завершено!");
    console.log(`✅ Додано книг: ${addedCount}`);
    console.log(`⏭️ Пропущено дублікатів: ${skippedCount}`);
  } catch (error) {
    console.error("❌ Помилка:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB відключено");
  }
}

seedBooks();