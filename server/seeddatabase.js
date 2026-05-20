const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const mongoose = require("mongoose");
const Category = require("./models/Category");

const categories = [
  {
    name: "Graphics",
    nameUa: "Графіка",
    slug: "graphics",
    description:
      "Моди, які покращують текстури, освітлення, кольори, шейдери та загальний візуальний стиль гри.",
    icon: "🎨",
  },
  {
    name: "Gameplay",
    nameUa: "Геймплей",
    slug: "gameplay",
    description:
      "Моди, які змінюють ігрові механіки, баланс, складність, поведінку ворогів або системи гри.",
    icon: "🎮",
  },
  {
    name: "Optimization",
    nameUa: "Оптимізація",
    slug: "optimization",
    description:
      "Моди для підвищення FPS, зменшення лагів, стабільнішої роботи гри та кращої продуктивності.",
    icon: "⚙️",
  },
  {
    name: "Interface",
    nameUa: "Інтерфейс",
    slug: "interface",
    description:
      "Моди, які змінюють меню, HUD, інвентар, мапу, шрифти та інші елементи інтерфейсу.",
    icon: "🖥",
  },
  {
    name: "Sounds",
    nameUa: "Звуки",
    slug: "sounds",
    description:
      "Моди, які додають або покращують звуки, музику, атмосферу, ефекти зброї, транспорту чи довкілля.",
    icon: "🔊",
  },
  {
    name: "Maps",
    nameUa: "Карти",
    slug: "maps",
    description:
      "Моди, які додають нові локації, міста, біоми, маршрути, дороги або розширюють ігровий світ.",
    icon: "🗺",
  },
  {
    name: "Vehicles",
    nameUa: "Транспорт",
    slug: "vehicles",
    description:
      "Моди, які додають або змінюють автомобілі, вантажівки, мотоцикли, літаки та інший транспорт.",
    icon: "🚗",
  },
  {
    name: "Weapons",
    nameUa: "Зброя",
    slug: "weapons",
    description:
      "Моди, які додають нову зброю, змінюють баланс, анімації, звуки або характеристики зброї.",
    icon: "⚔️",
  },
  {
    name: "Characters",
    nameUa: "Персонажі",
    slug: "characters",
    description:
      "Моди, які додають або змінюють персонажів, NPC, портрети, моделі, скіни або зовнішність героїв.",
    icon: "🧍",
  },
  {
    name: "Quality of Life",
    nameUa: "Якість життя",
    slug: "quality-of-life",
    description:
      "Моди, які роблять гру зручнішою: швидші дії, корисні підказки, покращена навігація та дрібні зручності.",
    icon: "✨",
  },
];

const seedCategories = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI не знайдено у .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB підключено");

    await Category.deleteMany();

    const createdCategories = await Category.insertMany(categories);

    console.log(`✅ Додано категорій: ${createdCategories.length}`);

    createdCategories.forEach((category) => {
      console.log(`- ${category.nameUa}`);
    });

    await mongoose.disconnect();

    console.log("✅ Seed категорій завершено");
    process.exit(0);
  } catch (error) {
    console.error("❌ Помилка seedCategories:", error.message);
    process.exit(1);
  }
};

seedCategories();