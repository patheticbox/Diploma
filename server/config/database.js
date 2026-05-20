const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI не знайдено у .env файлі");
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB підключено успішно");
  } catch (error) {
    console.error("❌ Помилка підключення до MongoDB:", error.message);
    console.log("URI:", process.env.MONGO_URI);
    process.exit(1);
  }
};

module.exports = connectDatabase;