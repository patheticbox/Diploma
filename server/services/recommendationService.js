const Book = require("../models/Book");
const UserBookStatus = require("../models/UserBookStatus");

const IGNORED_TERMS = [
  "fiction",
  "accessible_book",
  "protected_daisy",
  "in_library",
  "internet_archive_books",
  "american_fiction",
  "british_and_irish_fiction",
  "english_fiction",
  "open_library",
];

function normalizeValue(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function cleanArray(arr = []) {
  return arr
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0)
    .filter((item) => !IGNORED_TERMS.includes(normalizeValue(item)));
}

function normalizeText(text = "") {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "");
}

function tokenize(text = "") {
  return normalizeText(text)
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .filter((word) => !IGNORED_TERMS.includes(normalizeValue(word)));
}

function unique(arr = []) {
  return [...new Set(arr)];
}

function contentScore(book, userProfile) {
  let score = 0;

  if (book.author && userProfile.authors.includes(book.author)) {
    score += 3;
  }

  const bookGenres = cleanArray([book.genre, ...(book.genres || [])]);

  bookGenres.forEach((genre) => {
    if (userProfile.genres.includes(genre)) {
      score += 5;
    }
  });

  const bookTags = cleanArray(book.tags || []);

  bookTags.forEach((tag) => {
    if (userProfile.tags.includes(tag)) {
      score += 3;
    }
  });

  const words = tokenize(book.description || "");

  words.forEach((word) => {
    if (userProfile.keywords.includes(word)) {
      score += 0.5;
    }
  });

  return score;
}

async function getContentBasedRecommendations(userId) {
  const userStatuses = await UserBookStatus.find({ user: userId })
    .populate("book")
    .lean();

  const likedBooks = userStatuses
    .filter((s) => s.liked || ["Прочитано", "Читаю"].includes(s.list))
    .map((s) => s.book)
    .filter(Boolean);

  const excludedIds = userStatuses.map((s) => String(s.book?._id || s.book));

  if (!likedBooks.length) return [];

  const userProfile = {
    authors: [],
    genres: [],
    tags: [],
    keywords: [],
  };

  likedBooks.forEach((book) => {
    if (book.author) {
      userProfile.authors.push(book.author);
    }

    userProfile.genres.push(
      ...cleanArray([book.genre, ...(book.genres || [])])
    );

    userProfile.tags.push(...cleanArray(book.tags || []));

    userProfile.keywords.push(...tokenize(book.description || ""));
  });

  userProfile.authors = unique(userProfile.authors);
  userProfile.genres = unique(userProfile.genres);
  userProfile.tags = unique(userProfile.tags);
  userProfile.keywords = unique(userProfile.keywords);

  const candidates = await Book.find({
    _id: { $nin: excludedIds },
  }).lean();

  return candidates
    .map((book) => ({
      book,
      contentScore: contentScore(book, userProfile),
    }))
    .filter((item) => item.contentScore > 0)
    .sort((a, b) => b.contentScore - a.contentScore)
    .slice(0, 20);
}

async function getCollaborativeRecommendations(userId) {
  const currentUserStatuses = await UserBookStatus.find({ user: userId }).lean();

  const currentLikedBookIds = currentUserStatuses
    .filter((s) => s.liked || ["Прочитано", "Читаю"].includes(s.list))
    .map((s) => String(s.book));

  if (!currentLikedBookIds.length) return [];

  const otherUsersStatuses = await UserBookStatus.find({
    user: { $ne: userId },
  })
    .populate("book")
    .lean();

  const userSimilarity = {};

  otherUsersStatuses.forEach((status) => {
    const otherUserId = String(status.user);
    const bookId = String(status.book?._id || status.book);

    if (currentLikedBookIds.includes(bookId)) {
      userSimilarity[otherUserId] = (userSimilarity[otherUserId] || 0) + 1;
    }
  });

  const candidateScores = {};

  otherUsersStatuses.forEach((status) => {
    const otherUserId = String(status.user);
    const similarity = userSimilarity[otherUserId] || 0;

    if (similarity === 0) return;

    const book = status.book;
    if (!book) return;

    const bookId = String(book._id);

    if (currentLikedBookIds.includes(bookId)) return;

    if (status.liked || ["Прочитано", "Читаю"].includes(status.list)) {
      candidateScores[bookId] = {
        book,
        collaborativeScore:
          (candidateScores[bookId]?.collaborativeScore || 0) + similarity,
      };
    }
  });

  return Object.values(candidateScores)
    .sort((a, b) => b.collaborativeScore - a.collaborativeScore)
    .slice(0, 20);
}

function normalizeScores(items, key) {
  const max = Math.max(...items.map((i) => i[key] || 0), 1);

  return items.map((item) => ({
    ...item,
    [key]: (item[key] || 0) / max,
  }));
}

async function getHybridRecommendations(userId) {
  const contentResults = await getContentBasedRecommendations(userId);
  const collaborativeResults = await getCollaborativeRecommendations(userId);

  const contentNormalized = normalizeScores(contentResults, "contentScore");

  const collaborativeNormalized = normalizeScores(
    collaborativeResults,
    "collaborativeScore"
  );

  const map = {};

  contentNormalized.forEach((item) => {
    const id = String(item.book._id);

    map[id] = {
      book: item.book,
      contentScore: item.contentScore,
      collaborativeScore: 0,
    };
  });

  collaborativeNormalized.forEach((item) => {
    const id = String(item.book._id);

    if (!map[id]) {
      map[id] = {
        book: item.book,
        contentScore: 0,
        collaborativeScore: item.collaborativeScore,
      };
    } else {
      map[id].collaborativeScore = item.collaborativeScore;
    }
  });

  const hasCollaborative = collaborativeResults.length > 0;

  const contentWeight = hasCollaborative ? 0.6 : 0.9;
  const collaborativeWeight = hasCollaborative ? 0.4 : 0.1;

  return Object.values(map)
    .map((item) => ({
      ...item,
      hybridScore:
        item.contentScore * contentWeight +
        item.collaborativeScore * collaborativeWeight,
    }))
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, 10);
}

module.exports = {
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getHybridRecommendations,
};