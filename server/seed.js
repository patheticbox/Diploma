require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("./config/database");
const Book = require("./models/Book");

async function seed() {
  await connectDatabase();

  const book = new Book({
    title: "1984",
    author: "George Orwell",
    description: "Антиутопія про тоталітарний режим",
    year: 1949,
    tags: ["антиутопія", "тоталітаризм"]
  });

  await book.save();
  console.log("✅ Книга додана");

  mongoose.disconnect();
}

seed();