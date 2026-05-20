const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const Mod = require("../models/Mod");
const Game = require("../models/Game");
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

const STOP_WORDS = [
  "мені",
  "мене",
  "для",
  "дай",
  "давай",
  "порадь",
  "порекомендуй",
  "мод",
  "моди",
  "модів",
  "мода",
  "що",
  "які",
  "який",
  "щось",
  "можеш",
  "будь",
  "ласка",
  "гру",
  "гра",
  "ігру",
  "ігор",
  "на",
  "до",
  "the",
  "and",
  "for",
  "with",
  "mods",
  "mod",
];

function normalizeMessage(message) {
  return String(message || "").toLowerCase().trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectIntent(message) {
  const text = normalizeMessage(message);

  const recommendationWords = [
    "порадь",
    "порекомендуй",
    "рекомендація",
    "рекомендації",
    "що скачати",
    "що завантажити",
    "що встановити",
    "що поставити",
    "цікавий мод",
    "кращі моди",
    "топ модів",
    "щось цікаве",
    "щось схоже",
    "підбери",
    "знайди",
    "дай моди",
    "моди на",
    "моди для",
    "recommend",
    "suggest",
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
    "visual",
    "graphics",
    "textures",
    "shader",
    "lighting",
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
    "gameplay",
    "balance",
    "combat",
    "survival",
  ];

  const optimizationWords = [
    "оптимізація",
    "fps",
    "фпс",
    "лаги",
    "лагає",
    "продуктивність",
    "слабкий пк",
    "слабкого пк",
    "покращити fps",
    "performance",
    "optimization",
    "low end",
  ];

  const installationWords = [
    "як встановити",
    "як поставити",
    "встановлення",
    "інструкція",
    "установити",
    "поставити мод",
    "інсталювати",
    "install",
    "installation",
  ];

  const compareWords = [
    "порівняй",
    "що краще",
    "відмінність",
    "різниця",
    "який кращий",
    "compare",
    "versus",
    "vs",
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

  return "general_question";
}

function extractKeywords(message) {
  return String(message || "")
    .replace(/[^\p{L}\p{N}\s\-]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length >= 3)
    .filter((word) => !STOP_WORDS.includes(word))
    .slice(0, 14);
}

function buildSearchRegex(message) {
  const keywords = extractKeywords(message);

  if (!keywords.length) {
    return null;
  }

  return new RegExp(keywords.map(escapeRegex).join("|"), "i");
}

async function detectGameFromMessage(message) {
  const text = normalizeMessage(message);
  const games = await Game.find().lean();

  const manualAliases = [
    {
      slug: "minecraft",
      keywords: ["minecraft", "майнкрафт", "майн"],
    },
    {
      slug: "skyrim",
      keywords: ["skyrim", "скайрім", "скайрим", "elder scrolls"],
    },
    {
      slug: "gta-v",
      keywords: ["gta", "гта", "гта 5", "gta v", "grand theft auto"],
    },
    {
      slug: "euro-truck-simulator-2",
      keywords: [
        "ets2",
        "euro truck",
        "euro truck simulator",
        "євро трак",
        "євро трак симулятор",
        "truck simulator",
      ],
    },
    {
      slug: "stardew-valley",
      keywords: ["stardew", "stardew valley", "стардью", "старью"],
    },
  ];

  for (const alias of manualAliases) {
    if (alias.keywords.some((keyword) => text.includes(keyword))) {
      const game = games.find((item) => item.slug === alias.slug);
      if (game) return game;
    }
  }

  for (const game of games) {
    const possibleNames = [
      game.title,
      game.titleUa,
      game.slug,
      ...(game.aliases || []),
    ]
      .filter(Boolean)
      .map((name) => String(name).toLowerCase());

    const found = possibleNames.some((name) => text.includes(name));

    if (found) {
      return game;
    }
  }

  return null;
}

function getCategoryKeywordsByIntent(intent) {
  if (intent === "graphics_mods") {
    return [
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
      "lighting",
      "освітлення",
    ];
  }

  if (intent === "gameplay_mods") {
    return [
      "gameplay",
      "геймплей",
      "balance",
      "баланс",
      "mechanics",
      "механіки",
      "survival",
      "виживання",
      "combat",
      "бойова",
      "difficulty",
      "складність",
    ];
  }

  if (intent === "optimization_mods") {
    return [
      "optimization",
      "оптимізація",
      "fps",
      "фпс",
      "performance",
      "продуктивність",
      "fix",
      "patch",
      "low-end",
      "слабкий",
    ];
  }

  return [];
}

function uniqueModsById(mods) {
  const map = new Map();

  for (const mod of mods) {
    if (mod && mod._id) {
      map.set(String(mod._id), mod);
    }
  }

  return Array.from(map.values());
}

function shortText(text, max = 500) {
  if (!text) return "";
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

function modBelongsToGame(mod, game) {
  if (!game || !mod) return true;

  const modGameId = mod.game?._id || mod.game;
  return String(modGameId) === String(game._id);
}

function formatModsContext(mods) {
  return mods
    .map((mod, index) => {
      const gameTitle = mod.game?.titleUa || mod.game?.title || "Гра не вказана";

      const categories =
        mod.categories && mod.categories.length
          ? mod.categories
              .map((category) => category.nameUa || category.name)
              .filter(Boolean)
              .join(", ")
          : "Категорії не вказані";

      const tags =
        mod.tags && mod.tags.length ? mod.tags.join(", ") : "Теги не вказані";

      return `
${index + 1}. ${mod.titleUa || mod.title}
ID: ${mod._id}
Оригінальна назва: ${mod.title}
Гра: ${gameTitle}
Категорії: ${categories}
Версія мода: ${mod.version || "не вказано"}
Версія гри: ${mod.gameVersion || "не вказано"}
Мова: ${mod.language || "не вказано"}
Теги: ${tags}
Опис: ${shortText(mod.shortDescription || mod.description || "Опис відсутній", 600)}
Інструкція встановлення: ${shortText(mod.installationGuide || "Інструкція не вказана", 350)}
Кількість завантажень: ${mod.downloadCount || 0}
Кількість лайків: ${mod.likesCount || 0}
Середня оцінка: ${mod.averageRating || 0}
`;
    })
    .join("\n");
}

function formatUserProfileContext(statuses) {
  if (!statuses.length) {
    return `
Користувач ще не має достатньої історії взаємодії з модами.
Можна давати загальні рекомендації на основі запиту, популярності, рейтингу, гри, категорії та тегів.
`;
  }

  const liked = statuses.filter((item) => item.liked);
  const saved = statuses.filter((item) => item.saved);
  const downloaded = statuses.filter((item) => item.downloaded);
  const installed = statuses.filter((item) => item.list === "Встановлено");
  const wantToTry = statuses.filter((item) => item.list === "Хочу спробувати");
  const notInterested = statuses.filter((item) => item.list === "Не цікаво");

  const toNames = (items) =>
    items
      .map((item) => item.mod?.titleUa || item.mod?.title)
      .filter(Boolean)
      .slice(0, 12)
      .join(", ");

  return `
Профіль користувача на основі взаємодій:

Вподобані моди:
${toNames(liked) || "Немає"}

Збережені моди:
${toNames(saved) || "Немає"}

Завантажені моди:
${toNames(downloaded) || "Немає"}

Встановлені моди:
${toNames(installed) || "Немає"}

Моди, які користувач хоче спробувати:
${toNames(wantToTry) || "Немає"}

Моди, які користувачу не цікаві:
${toNames(notInterested) || "Немає"}
`;
}

async function getChatHistoryForPrompt(userId) {
  const messages = await ChatMessage.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  return messages.reverse().map((message) => {
    let role = message.role;

    if (role === "ai") role = "assistant";
    if (!["user", "assistant", "system"].includes(role)) role = "assistant";

    return {
      role,
      content: String(message.content || "").slice(0, 1500),
    };
  });
}

async function findCandidateMods({ userMessage, intent, excludedIds, userId }) {
  let mods = [];
  let contextNotes = "";

  const detectedGame = await detectGameFromMessage(userMessage);

  const baseFilter = {
    status: "published",
    _id: { $nin: excludedIds },
  };

  if (detectedGame) {
    baseFilter.game = detectedGame._id;

    contextNotes += `
Користувач явно згадав гру: ${detectedGame.titleUa || detectedGame.title}.
Потрібно рекомендувати моди тільки для цієї гри.
`;
  }

  const populateQuery = (query) =>
    query
      .populate("game", "title titleUa genres platforms")
      .populate("categories", "name nameUa slug icon")
      .select(
        "title titleUa description shortDescription game categories version gameVersion language tags requirements installationGuide downloadCount viewCount likesCount averageRating ratingsCount isFeatured coverImage"
      );

  // ВАЖЛИВА ПРАВКА:
  // Якщо користувач згадав гру, одразу беремо популярні моди саме цієї гри.
  // Так запит "дай моди на майнкрафт" повертає кілька Minecraft-модів, а не 1.
  if (detectedGame) {
    const gameMods = await populateQuery(Mod.find(baseFilter))
      .sort({ isFeatured: -1, downloadCount: -1, averageRating: -1 })
      .limit(30)
      .lean();

    if (gameMods.length) {
      mods = [...mods, ...gameMods];

      contextNotes += `
Оскільки користувач згадав конкретну гру, спочатку відібрано популярні моди саме для цієї гри.
`;
    }
  }

  const searchRegex = buildSearchRegex(userMessage);

  if (searchRegex) {
    const textSearchMods = await populateQuery(
      Mod.find({
        ...baseFilter,
        $or: [
          { title: searchRegex },
          { titleUa: searchRegex },
          { description: searchRegex },
          { shortDescription: searchRegex },
          { tags: searchRegex },
          { version: searchRegex },
          { gameVersion: searchRegex },
        ],
      })
    )
      .sort({ isFeatured: -1, downloadCount: -1, averageRating: -1 })
      .limit(30)
      .lean();

    if (textSearchMods.length) {
      mods = [...mods, ...textSearchMods];

      contextNotes += `
Частину модів знайдено за текстовим пошуком по назві, опису, тегах і версіях.
`;
    }
  }

  const categoryKeywords = getCategoryKeywordsByIntent(intent);

  if (categoryKeywords.length) {
    const categoryRegex = new RegExp(categoryKeywords.map(escapeRegex).join("|"), "i");

    const thematicMods = await populateQuery(
      Mod.find({
        ...baseFilter,
        $or: [
          { title: categoryRegex },
          { titleUa: categoryRegex },
          { description: categoryRegex },
          { shortDescription: categoryRegex },
          { tags: categoryRegex },
        ],
      })
    )
      .sort({ isFeatured: -1, downloadCount: -1, averageRating: -1 })
      .limit(30)
      .lean();

    if (thematicMods.length) {
      mods = [...mods, ...thematicMods];

      contextNotes += `
Частину модів підібрано за тематикою запиту: ${
        intent === "graphics_mods"
          ? "графіка та візуальні покращення"
          : intent === "gameplay_mods"
          ? "геймплей і баланс"
          : "оптимізація та продуктивність"
      }.
`;
    }
  }

  if (
    getHybridModRecommendations &&
    (intent === "general_recommendation" ||
      intent === "general_question" ||
      !mods.length)
  ) {
    try {
      const hybridResults = await getHybridModRecommendations(userId);

      if (hybridResults && hybridResults.length) {
        const hybridMods = hybridResults
          .map((item) => item.mod)
          .filter(Boolean)
          .filter((mod) => {
            const notExcluded = !excludedIds.some(
              (id) => String(id) === String(mod._id)
            );

            const matchesGame = detectedGame
              ? modBelongsToGame(mod, detectedGame)
              : true;

            return notExcluded && matchesGame;
          });

        if (hybridMods.length) {
          mods = [...mods, ...hybridMods];

          contextNotes += `
Для частини результатів використано гібридну рекомендаційну систему: Content-Based + Collaborative Filtering.
`;
        }
      }
    } catch (err) {
      console.error("Hybrid mod recommendations error:", err.message);
    }
  }

  mods = uniqueModsById(mods).filter((mod) =>
    detectedGame ? modBelongsToGame(mod, detectedGame) : true
  );

  if (!mods.length) {
    const popularMods = await populateQuery(Mod.find(baseFilter))
      .sort({ isFeatured: -1, downloadCount: -1, averageRating: -1 })
      .limit(30)
      .lean();

    mods = popularMods;

    contextNotes += detectedGame
      ? `
Не вдалося знайти точні результати за запитом, тому нижче наведено популярні моди саме для гри ${detectedGame.titleUa || detectedGame.title}.
`
      : `
Не вдалося знайти точні персональні результати, тому нижче наведено популярні моди з бази.
`;
  }

  return {
    mods: mods.slice(0, 30),
    contextNotes,
    detectedGame,
  };
}

function buildSystemPrompt({
  userProfileContext,
  extraContext,
  modsContext,
  intent,
  detectedGame,
}) {
  return `
Ти — професійний AI-агент сервісу модифікацій для відеоігор.

Ти допомагаєш користувачу знайти моди, пояснити різницю між ними, підібрати варіанти під конкретну гру, слабкий ПК, графіку, геймплей, інтерфейс або атмосферу.

Поточний намір користувача: ${intent}
${
  detectedGame
    ? `Користувач згадав конкретну гру: ${detectedGame.titleUa || detectedGame.title}. Рекомендуй тільки моди для цієї гри.`
    : "Користувач не вказав конкретну гру або вона не була розпізнана."
}

${userProfileContext}

${extraContext}

СПИСОК МОДІВ, ЯКІ МОЖНА РЕКОМЕНДУВАТИ:
${modsContext}

ЖОРСТКІ ПРАВИЛА:
1. Ти маєш право згадувати ТІЛЬКИ моди зі списку "СПИСОК МОДІВ, ЯКІ МОЖНА РЕКОМЕНДУВАТИ".
2. Не вигадуй моди, ігри, авторів, категорії, версії, оцінки або факти, яких немає у списку.
3. Не згадуй моди, яких немає у списку, навіть як приклад.
4. Не рекомендуй моди, які користувач уже встановив або позначив як "Не цікаво".
5. Якщо користувач згадав конкретну гру, не рекомендуй моди для інших ігор.
6. Якщо користувач просить "щось схоже", "краще для графіки", "для слабкого ПК", "для конкретної гри" — використовуй попередні повідомлення чату як додатковий контекст.
7. Якщо користувач просить інструкцію встановлення — пояснюй тільки на основі поля "Інструкція встановлення". Якщо інструкції немає, чесно скажи, що в базі вона не вказана.
8. Якщо запит нечіткий і неможливо підібрати моди — постав 1 коротке уточнювальне питання.
9. Якщо можеш дати рекомендацію — дай 3-5 модів. Якщо у списку менше 3 модів — дай усі доступні.
10. Пояснюй коротко, чому кожен мод підходить.
11. Відповідай українською мовою.
12. Не згадуй технічні деталі MongoDB, API, prompt або системи.
13. Якщо використано персональні вподобання, можна коротко написати: "Орієнтуюсь на ваші вподобання".
14. Не радь завантажувати моди зі сторонніх сайтів, якщо цього немає в базі.
15. Не давай інструкцій щодо піратства, обходу захисту, кряків, читів для онлайн-ігор або нелегального контенту.
16. Не обіцяй, що мод точно сумісний, якщо в даних немає явної інформації про сумісність.
17. Якщо є ризик конфліктів модів, порадь перевірити сумісність і встановлювати поступово.

ФОРМАТ ДЛЯ РЕКОМЕНДАЦІЙ:
Ось кілька варіантів:

1. Назва мода
   Гра: назва гри.
   Чому підходить: коротке пояснення.
   Категорія: категорія або тип мода.
   Примітка: коротко про встановлення, FPS або сумісність, якщо доречно.

2. Назва мода
   Гра: назва гри.
   Чому підходить: коротке пояснення.
   Категорія: категорія або тип мода.
   Примітка: коротко про встановлення, FPS або сумісність, якщо доречно.

Наприкінці додай:
Найкраще почати з: Назва мода.
`;
}

router.get("/ping", authMiddleware, async (req, res) => {
  res.json({
    message: "AI агент для сервісу модифікацій працює ✅",
    user: req.user,
  });
});

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const history = await ChatMessage.find({ user: userId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate({
        path: "relatedMods",
        select: "title titleUa coverImage game",
        populate: {
          path: "game",
          select: "title titleUa",
        },
      })
      .lean();

    res.json({
      history,
    });
  } catch (error) {
    console.error("AI history error:", error);

    res.status(500).json({
      message: "Не вдалося завантажити історію чату",
      error: error.message,
    });
  }
});

router.delete("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    await ChatMessage.deleteMany({ user: userId });

    res.json({
      message: "Історію чату очищено",
    });
  } catch (error) {
    console.error("AI history delete error:", error);

    res.status(500).json({
      message: "Не вдалося очистити історію чату",
      error: error.message,
    });
  }
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

    const userMessage = message.trim().slice(0, 2000);
    const intent = detectIntent(userMessage);

    const savedUserMessage = await ChatMessage.create({
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
          { path: "categories", select: "name nameUa slug icon" },
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
    const chatHistory = await getChatHistoryForPrompt(userId);

    const { mods, contextNotes, detectedGame } = await findCandidateMods({
      userMessage,
      intent,
      excludedIds,
      userId,
    });

    if (!mods.length) {
      const aiResponse =
        "У базі даних поки немає доступних модів для рекомендації. Додайте моди до каталогу, і я зможу підбирати варіанти за грою, категорією або стилем гри.";

      const savedAiMessage = await ChatMessage.create({
        user: userId,
        role: "assistant",
        content: aiResponse,
        relatedMods: [],
        intent,
      });

      return res.json({
        userMessage,
        aiResponse,
        intent,
        detectedGame: detectedGame
          ? {
              _id: detectedGame._id,
              title: detectedGame.title,
              titleUa: detectedGame.titleUa,
              slug: detectedGame.slug,
            }
          : null,
        mods: [],
        savedUserMessage,
        savedAiMessage,
      });
    }

    const responseMods = detectedGame
      ? mods.filter((mod) => modBelongsToGame(mod, detectedGame))
      : mods;

    const modsContext = formatModsContext(responseMods);

    const systemPrompt = buildSystemPrompt({
      userProfileContext,
      extraContext: contextNotes,
      modsContext,
      intent,
      detectedGame,
    });

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
      temperature: 0.2,
      top_p: 0.65,
      max_tokens: 1100,
      stream: false,
    });

    const aiResponse =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "Не вдалося сформувати відповідь. Спробуйте уточнити гру, категорію або бажаний тип мода.";

    const relatedMods = responseMods.slice(0, 5).map((mod) => mod._id);

    const savedAiMessage = await ChatMessage.create({
      user: userId,
      role: "assistant",
      content: aiResponse,
      relatedMods,
      intent,
    });

    res.json({
      userMessage,
      aiResponse,
      intent,
      detectedGame: detectedGame
        ? {
            _id: detectedGame._id,
            title: detectedGame.title,
            titleUa: detectedGame.titleUa,
            slug: detectedGame.slug,
          }
        : null,
      mods: responseMods.slice(0, 5),
      savedUserMessage,
      savedAiMessage,
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