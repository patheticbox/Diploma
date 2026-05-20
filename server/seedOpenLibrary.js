require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");

const connectDatabase = require("./config/database");
const Book = require("./models/Book");

async function seedBooks() {
  await connectDatabase();

  try {
    // Отримуємо книги по темі
    const response = await axios.get(
      "https://openlibrary.org/subjects/fiction.json?limit=50"
    );

    const works = response.data.works;

    for (let work of works) {
      const book = new Book({
        title: work.title,
        author: work.authors?.[0]?.name || "Unknown",
        description: work.subject
          ? work.subject.slice(0, 5).join(", ")
          : "No description",
        year: work.first_publish_year || null,
        language: "en",
        genre: "fiction",
        tags: work.subject ? work.subject.slice(0, 5) : []
      });

      await book.save();
      console.log("Додано:", book.title);
    }

    console.log("✅ Seed завершено!");
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Помилка:", error.message);
    mongoose.disconnect();
  }
}

seedBooks();