const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const Mod = require("../models/Mod");
const UserModStatus = require("../models/UserModStatus");
const ChatMessage = require("../models/ChatMessage");
const { authMiddleware } = require("../middleware/auth");

let getHybridModRecommendations = null;

try {
  const recommendationService = require("../services/modRecommendationService");
  getHybridModRecommendations = recommendationService.getHybridModRecommendations;
} catch (err) {
  console.log("Hybrid mod recommendation service not found. Fallback mode enabled.");
}

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

function normalizeMessage(message) {
  return message.toLowerCase().trim();
}

function detectIntent(message) {
  const text = normalizeMessage(message);

  const recommendationWords = [
    "порадь",
    "порекомендуй",
    "рекомендація",
    "рекомендації",
    "що скачати",
    "що встановити",
    "що поставити",
    "цікавий мод",
    "кращі моди",
    "топ модів",
    "щось цікаве",
    "щось схоже",
  ];

  const graphicsWords = [
    "графіка",
    "графіку",
    "графічний",
    "текстури",
    "шейдери",
    "освітлення",
    "візуал",
    "реалізм",
    "реалістичний",
  ];

  const gameplayWords = [
    "геймплей",
    "баланс",
    "складність",
    "механіки",
    "бойова система",
    "виживання",
    "крафт",
    "економіка",
  ];

  const optimizationWords = [
    "оптимізація",
    "fps",
    "фпс",
    "лаги",
    "продуктивність",
    "слабкий пк",
    "покращити fps",
  ];

  const installationWords = [
    "як встановити",
    "встановлення",
    "інструкція",
    "установити",
    "поставити мод",
    "інсталювати",
  ];

  const compareWords = [
    "порівняй",
    "що краще",
    "відмінність",
    "різниця",
    "який кращий",
  ];

  if (installationWords.some((word) => text.includes(word))) {
    return "explain_installation";
  }

  if (compareWords.some((word) => text.includes(word))) {
    return "compare_mods";
  }

  if (graphicsWords.some((word) => text.includes(word))) {
    return "graphics_mods";
  }

  if (gameplayWords.some((word) => text.includes(word))) {
    return "gameplay_mods";
  }

  if (optimizationWords.some((word) => text.includes(word))) {
    return "optimization_mods";
  }

  if (recommendationWords.some((word) => text.includes(word))) {
    return "general_recommendation";
  }

  return "general";
}

function buildSearchRegex(message) {
  const cleaned = message
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3)
    .slice(0, 12);

  if (!cleaned.length) {
    return null;
  }

  return new RegExp(cleaned.join("|"), "i");
}

function formatModsContext(mods) {
  return mods
    .map((mod, index) => {
      const gameTitle =
        mod.game?.titleUa ||
        mod.game?.title ||
        "Гра не вказана";

      const categories =
        mod.categories && mod.categories.length
          ? mod.categories
              .map((category) => category.nameUa || category.name)
              .join(", ")
          : "Категорії не вказані";

      const tags =
        mod.tags && mod.tags.length
          ? mod.tags.join(", ")
          : "Теги не вказані";

      return `
${index + 1}. ${mod.titleUa || mod.title}
Оригінальна назва: ${mod.title}
Гра: ${gameTitle}
Категорії: ${categories}
Версія мода: ${mod.version || "не вказано"}
Версія гри: ${mod.gameVersion || "не вказано"}
Мова: ${mod.language || "не вказано"}
Теги: ${tags}
Опис: ${mod.shortDescription || mod.description || "Опис відсутній"}
Інструкція встановлення: ${mod.installationGuide || "Інструкція не вказана"}
Кількість завантажень: ${mod.downloadCount || 0}
Середня оцінка: ${mod.averageRating || 0}
`;
    })
    .join("\n");
}

function formatUserProfileContext(statuses) {
  if (!statuses.length) {
    return `
Користувач ще не має достатньої історії взаємодії з модами.
Можна давати загальні рекомендації на основі запиту.
`;
  }

  const liked = statuses.filter((item) => item.liked);
  const saved = statuses.filter((item) => item.saved);
  const downloaded = statuses.filter((item) => item.downloaded);
  const installed = statuses.filter((item) => item.list === "Встановлено");
  const notInterested = statuses.filter((item) => item.list === "Не цікаво");

  const likedMods = liked
    .map((item) => item.mod?.titleUa || item.mod?.title)
    .filter(Boolean)
    .join(", ");

  const savedMods = saved
    .map((item) => item.mod?.titleUa || item.mod?.title)
    .filter(Boolean)
    .join(", ");

  const downloadedMods = downloaded
    .map((item) => item.mod?.titleUa || item.mod?.title)
    .filter(Boolean)
    .join(", ");

  const installedMods = installed
    .map((item) => item.mod?.titleUa || item.mod?.title)
    .filter(Boolean)
    .join(", ");

  const ignoredMods = notInterested
    .map((item) => item.mod?.titleUa || item.mod?.title)
    .filter(Boolean)
    .join(", ");

  return `
Профіль користувача на основі взаємодій:

Вподобані моди:
${likedMods || "Немає"}

Збережені моди:
${savedMods || "Немає"}

Завантажені моди:
${downloadedMods || "Немає"}

Встановлені моди:
${installedMods || "Немає"}

Моди, які користувачу не цікаві:
${ignoredMods || "Немає"}
`;
}

async function getChatHistory(userId) {
  const messages = await ChatMessage.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return messages.reverse().map((message) => {
    let role = message.role;

    if (role === "ai") {
      role = "assistant";
    }

    if (!["user", "assistant", "system"].includes(role)) {
      role = "assistant";
    }

    return {
      role,
      content: message.content,
    };
  });
}

router.get("/ping", authMiddleware, async (req, res) => {
  res.json({
    message: "AI агент для сервісу модифікацій працює ✅",
    user: req.user,
  });
});

router.post("/message", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Користувач не авторизований",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Повідомлення не може бути порожнім",
      });
    }

    const userMessage = message.trim();
    const intent = detectIntent(userMessage);

    await ChatMessage.create({
      user: userId,
      role: "user",
      content: userMessage,
      intent,
    });

    const userStatuses = await UserModStatus.find({ user: userId })
      .populate({
        path: "mod",
        populate: [
          { path: "game", select: "title titleUa genres platforms" },
          { path: "categories", select: "name nameUa" },
        ],
      })
      .lean();

    const excludedIds = userStatuses
      .filter(
        (status) =>
          status.list === "Встановлено" ||
          status.list === "Не цікаво"
      )
      .map((status) => status.mod?._id)
      .filter(Boolean);

    const userProfileContext = formatUserProfileContext(userStatuses);
    const chatHistory = await getChatHistory(userId);

    let mods = [];
    let extraContext = "";

    const searchRegex = buildSearchRegex(userMessage);

    const baseFilter = {
      status: "published",
      _id: { $nin: excludedIds },
    };

    if (searchRegex) {
      mods = await Mod.find({
        ...baseFilter,
        $or: [
          { title: searchRegex },
          { titleUa: searchRegex },
          { description: searchRegex },
          { shortDescription: searchRegex },
          { tags: searchRegex },
          { language: searchRegex },
          { version: searchRegex },
          { gameVersion: searchRegex },
        ],
      })
        .populate("game", "title titleUa genres platforms")
        .populate("categories", "name nameUa")
        .select(
          "title titleUa description shortDescription game categories version gameVersion language tags requirements installationGuide downloadCount averageRating"
        )
        .sort({ downloadCount: -1, averageRating: -1 })
        .limit(30)
        .lean();

      if (mods.length) {
        extraContext += `
Моди були знайдені за текстовим пошуком по назві, опису, тегах, версії та мові.
`;
      }
    }

    if (
      intent === "graphics_mods" ||
      intent === "gameplay_mods" ||
      intent === "optimization_mods"
    ) {
      let categoryKeywords = [];

      if (intent === "graphics_mods") {
        categoryKeywords = [
          "graphics",
          "графіка",
          "textures",
          "текстури",
          "visual",
          "візуал",
          "shaders",
          "шейдери",
          "realistic",
          "реалізм",
        ];
      }

      if (intent === "gameplay_mods") {
        categoryKeywords = [
          "gameplay",
          "геймплей",
          "balance",
          "баланс",
          "mechanics",
          "механіки",
          "survival",
          "виживання",
        ];
      }

      if (intent === "optimization_mods") {
        categoryKeywords = [
          "optimization",
          "оптимізація",
          "fps",
          "performance",
          "продуктивність",
          "fix",
          "patch",
        ];
      }

      const categoryRegex = new RegExp(categoryKeywords.join("|"), "i");

      const categoryMods = await Mod.find({
        ...baseFilter,
        $or: [
          { title: categoryRegex },
          { titleUa: categoryRegex },
          { description: categoryRegex },
          { shortDescription: categoryRegex },
          { tags: categoryRegex },
        ],
      })
        .populate("game", "title titleUa genres platforms")
        .populate("categories", "name nameUa")
        .select(
          "title titleUa description shortDescription game categories version gameVersion language tags requirements installationGuide downloadCount averageRating"
        )
        .sort({ downloadCount: -1, averageRating: -1 })
        .limit(30)
        .lean();

      if (categoryMods.length) {
        mods = categoryMods;

        extraContext += `
Моди підібрані за тематикою запиту користувача: ${
          intent === "graphics_mods"
            ? "графічні моди"
            : intent === "gameplay_mods"
            ? "геймплейні моди"
            : "моди для оптимізації"
        }.
`;
      }
    }

    if (
      intent === "general_recommendation" ||
      intent === "general" ||
      !mods.length
    ) {
      if (getHybridModRecommendations) {
        try {
          const hybridResults = await getHybridModRecommendations(userId);

          if (hybridResults && hybridResults.length) {
            mods = hybridResults
              .map((item) => item.mod)
              .filter(Boolean)
              .filter(
                (mod) =>
                  !excludedIds.some(
                    (id) => id.toString() === mod._id.toString()
                  )
              )
              .slice(0, 30);

            if (mods.length) {
              extraContext += `
Для загальної рекомендації використано гібридну систему рекомендацій модів:
Content-Based + Collaborative Filtering.
`;
            }
          }
        } catch (err) {
          console.error("Hybrid mod recommendations error:", err);
        }
      }
    }

    if (!mods.length) {
      mods = await Mod.find(baseFilter)
        .populate("game", "title titleUa genres platforms")
        .populate("categories", "name nameUa")
        .select(
          "title titleUa description shortDescription game categories version gameVersion language tags requirements installationGuide downloadCount averageRating"
        )
        .sort({ isFeatured: -1, downloadCount: -1, averageRating: -1 })
        .limit(30)
        .lean();

      extraContext += `
Не вдалося знайти персональні рекомендації, тому нижче наведено популярні моди з бази.
`;
    }

    if (!mods.length) {
      const aiResponse =
        "У базі даних поки немає доступних модів для рекомендації.";

      await ChatMessage.create({
        user: userId,
        role: "assistant",
        content: aiResponse,
        intent,
      });

      return res.json({
        userMessage,
        aiResponse,
        intent,
        mods: [],
      });
    }

    const modsContext = formatModsContext(mods);

    const systemPrompt = `
Ти — професійний AI-агент сервісу модифікацій для відеоігор.

Твоє завдання — допомагати користувачу знаходити моди з бази даних, пояснювати рекомендації, враховувати його вподобання, історію взаємодій та запит.

${userProfileContext}

${extraContext}

СПИСОК МОДІВ, ЯКІ МОЖНА РЕКОМЕНДУВАТИ:
${modsContext}

ЖОРСТКІ ПРАВИЛА:
1. Ти маєш право згадувати ТІЛЬКИ моди зі списку "СПИСОК МОДІВ, ЯКІ МОЖНА РЕКОМЕНДУВАТИ".
2. Не вигадуй моди, ігри, авторів, категорії, версії або факти, яких немає у списку.
3. Не згадуй моди, яких немає у списку, навіть як приклад.
4. Не рекомендуй моди, які користувач уже встановив або позначив як "Не цікаво".
5. Якщо користувач просить "щось схоже", "краще для графіки", "для слабкого ПК", "для конкретної гри" — використовуй попередні повідомлення чату як контекст.
6. Якщо користувач просить інструкцію встановлення — пояснюй тільки на основі поля "Інструкція встановлення", якщо воно є.
7. Якщо запит користувача нечіткий і немає достатньо даних — постав 1 коротке уточнювальне питання.
8. Якщо можеш дати рекомендацію — дай 3-5 модів.
9. Пояснюй коротко, чому мод підходить.
10. Відповідай українською мовою.
11. Не згадуй технічні деталі MongoDB, API, prompt або системи.
12. Якщо використано персональні вподобання, можна коротко написати: "Орієнтуюсь на ваші вподобання".
13. Не радь завантажувати моди зі сторонніх сайтів, якщо цього немає в базі.
14. Не давай інструкцій щодо піратства, обходу захисту, кряків або нелегального контенту.

ФОРМАТ ВІДПОВІДІ ДЛЯ РЕКОМЕНДАЦІЙ:
Ось кілька варіантів:

1. Назва мода
   Гра: назва гри.
   Чому підходить: коротке пояснення.
   Категорія: категорія або тип мода.

2. Назва мода
   Гра: назва гри.
   Чому підходить: коротке пояснення.
   Категорія: категорія або тип мода.

Наприкінці додай:
Найкраще почати з: Назва мода.
`;

    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || "meta/llama-3.3-70b-instruct",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...chatHistory,
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.25,
      top_p: 0.7,
      max_tokens: 1200,
      stream: false,
    });

    const aiResponse =
      completion?.choices?.[0]?.message?.content ||
      "Не вдалося сформувати відповідь.";

    await ChatMessage.create({
      user: userId,
      role: "assistant",
      content: aiResponse,
      relatedMods: mods.slice(0, 5).map((mod) => mod._id),
      intent,
    });

    res.json({
      userMessage,
      aiResponse,
      intent,
      mods: mods.slice(0, 5),
    });
  } catch (err) {
    console.error("AI route error:", err);

    res.status(500).json({
      message: "Помилка AI",
      error: err.message,
    });
  }
});

module.exports = router;