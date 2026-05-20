// src/pages/Books.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AiChatBox from "../components/AiChatBox";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [bookStatuses, setBookStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userBooks, setUserBooks] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeSection, setActiveSection] = useState("Усі");

  const [isMiniChatOpen, setIsMiniChatOpen] = useState(false);

  const [hybridRecommendations, setHybridRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState("");

  const sections = [
    "Усі",
    "Сподобалось",
    "Прочитано",
    "Читаю",
    "Прочитаю колись",
  ];

  const categories = [
    "",
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
    "fiction",
  ];

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const formatScore = (score) => {
    if (!score) return 0;
    return Math.round(Math.min(score, 1) * 100);
  };

  const fetchBooks = async (
    page = 1,
    searchQuery = search,
    categoryQuery = category
  ) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        search: searchQuery,
        category: categoryQuery,
      });

      const res = await fetch(`/api/books?${params.toString()}`);

      if (!res.ok) throw new Error("Помилка при завантаженні книг");

      const data = await res.json();

      setBooks(shuffleArray(data.books || []));
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("Не вдалося завантажити книги");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookStatuses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/user-books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      const map = {};
      const userBooksList = [];

      data.statuses.forEach((status) => {
        const book = status.book;

        if (!book || !book._id) return;

        map[book._id] = {
          liked: status.liked,
          list: status.list,
        };

        userBooksList.push({
          ...book,
          userStatus: {
            liked: status.liked,
            list: status.list,
          },
        });
      });

      setBookStatuses(map);
      setUserBooks(userBooksList);
    } catch (err) {
      console.error("Помилка завантаження статусів:", err);
    }
  };

  const fetchHybridRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      setRecommendationsError("");

      const token = localStorage.getItem("token");

      const res = await fetch("/api/recommendations/hybrid", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Не вдалося завантажити рекомендації");
      }

      const data = await res.json();

      setHybridRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Помилка рекомендацій:", err);
      setRecommendationsError("Не вдалося завантажити рекомендації");
    } finally {
      setRecommendationsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(currentPage, search, category);
    fetchBookStatuses();
    fetchHybridRecommendations();
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks(1, search, category);
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;

    setCategory(selectedCategory);
    setActiveSection("Усі");
    setCurrentPage(1);
    fetchBooks(1, search, selectedCategory);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);

    if (section !== "Усі") {
      setCategory("");
    }

    setCurrentPage(1);

    if (section === "Усі") {
      fetchBooks(1, search, category);
    } else {
      fetchBooks(1, search, "");
    }
  };

  const updateBookStatus = async (bookId, data) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/user-books/${bookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Не вдалося оновити статус книги");

      const result = await res.json();

      setBookStatuses((prev) => ({
        ...prev,
        [bookId]: {
          liked: result.status.liked,
          list: result.status.list,
        },
      }));

      fetchBookStatuses();
      fetchHybridRecommendations();
    } catch (err) {
      console.error(err);
      setError("Не вдалося оновити статус книги");
    }
  };

  const handleLike = (bookId) => {
    const isLiked = !!bookStatuses[bookId]?.liked;

    updateBookStatus(bookId, {
      liked: !isLiked,
    });
  };

  const sourceBooks = activeSection === "Усі" ? books : userBooks;

  const filteredBooks = sourceBooks.filter((book) => {
    const status = bookStatuses[book._id];

    if (activeSection === "Усі") return true;
    if (activeSection === "Сподобалось") return status?.liked;

    return status?.list === activeSection;
  });

  const renderPagination = () => {
    if (activeSection !== "Усі") return null;

    const buttons = [];

    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          disabled={i === currentPage}
          style={
            i === currentPage
              ? styles.paginationButtonActive
              : styles.paginationButton
          }
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  return (
    <>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Онлайн Бібліотека</h1>

        <nav style={styles.nav}>
          <Link to="/dashboard" style={styles.navLink}>
            📊 Панель
          </Link>
          <Link to="/books" style={styles.navLink}>
            📚 Книги
          </Link>
          <Link to="/chat" style={styles.navLink}>
            🤖 AI Помічник
          </Link>
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          style={styles.logoutBtn}
        >
          Вийти
        </button>
      </header>

      <main style={styles.wrapper}>
        <div style={styles.container}>
          <div style={styles.pageHeader}>
            <div>
              <h1 style={styles.title}>Каталог книг</h1>
              <p style={styles.subtitle}>
                Позначайте книги, додавайте їх у списки та отримуйте персональні
                рекомендації.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              placeholder="Пошук за назвою, українською назвою або автором..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />

            <select
              value={category}
              onChange={handleCategoryChange}
              style={styles.categorySelect}
              disabled={activeSection !== "Усі"}
            >
              <option value="">Усі категорії</option>
              {categories.filter(Boolean).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button type="submit" style={styles.searchButton}>
              Пошук
            </button>
          </form>

          <div style={styles.sections}>
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => handleSectionChange(section)}
                style={
                  activeSection === section
                    ? styles.sectionButtonActive
                    : styles.sectionButton
                }
              >
                {section}
              </button>
            ))}
          </div>

          {loading && <p style={styles.loadingText}>Завантаження книг...</p>}

          {error && <p style={styles.errorText}>{error}</p>}

          {!loading && filteredBooks.length === 0 && (
            <p style={styles.noResults}>У цьому розділі книг немає</p>
          )}

          <div style={styles.grid}>
            {filteredBooks.map((book) => {
              const isLiked = !!bookStatuses[book._id]?.liked;
              const displayTitle = book.titleUk || book.title;

              return (
                <div
                  key={book._id}
                  style={styles.card}
                  onClick={() => (window.location.href = `/books/${book._id}`)}
                >
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={displayTitle}
                      style={styles.cover}
                    />
                  ) : (
                    <div style={styles.coverPlaceholder}>📖</div>
                  )}

                  <div style={styles.cardTop}>
                    <div style={styles.titleBlock}>
                      <h3 style={styles.cardTitle}>{displayTitle}</h3>

                      {book.titleUk && book.titleUk !== book.title && (
                        <p style={styles.originalTitle}>{book.title}</p>
                      )}
                    </div>

                    <button
                      style={{
                        ...styles.likeButton,
                        ...(isLiked ? styles.likeButtonActive : {}),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(book._id);
                      }}
                      title="Сподобалось"
                    >
                      {isLiked ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <p style={styles.author}>
                    ✍️ {book.author || "Автор невідомий"}
                  </p>

                  <p style={styles.genre}>
                    {book.genre || book.genres?.[0] || "Без категорії"}
                  </p>

                  <p style={styles.description}>
                    {book.description
                      ? `${book.description.slice(0, 130)}...`
                      : "Опис відсутній"}
                  </p>

                  <div
                    style={styles.statusBlock}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label style={styles.label}>Статус читання</label>

                    <select
                      value={bookStatuses[book._id]?.list || ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateBookStatus(book._id, {
                          list: e.target.value,
                        });
                      }}
                      style={styles.select}
                    >
                      <option value="">Без статусу</option>
                      <option value="Прочитано">Прочитано</option>
                      <option value="Читаю">Читаю</option>
                      <option value="Прочитаю колись">
                        Прочитаю колись
                      </option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && activeSection === "Усі" && (
            <div style={styles.paginationContainer}>{renderPagination()}</div>
          )}

          <section style={styles.recommendationsSection}>
            <div style={styles.recommendationsHeader}>
              <div>
                <h2 style={styles.recommendationsTitle}>
                  Рекомендовано для вас
                </h2>
                <p style={styles.recommendationsSubtitle}>
                  Персональні рекомендації на основі гібридного алгоритму:
                  Content-Based + Collaborative Filtering.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchHybridRecommendations}
                style={styles.recommendationsRefresh}
                disabled={recommendationsLoading}
              >
                {recommendationsLoading ? "Оновлення..." : "Оновити"}
              </button>
            </div>

            {recommendationsLoading && (
              <p style={styles.recommendationsMessage}>
                Завантаження рекомендацій...
              </p>
            )}

            {recommendationsError && (
              <p style={styles.recommendationsError}>
                {recommendationsError}
              </p>
            )}

            {!recommendationsLoading &&
              !recommendationsError &&
              hybridRecommendations.length === 0 && (
                <div style={styles.recommendationsEmpty}>
                  <h3 style={styles.recommendationsEmptyTitle}>
                    Поки немає рекомендацій
                  </h3>
                  <p style={styles.recommendationsEmptyText}>
                    Лайкніть кілька книг або додайте їх у списки “Прочитано” чи
                    “Читаю”.
                  </p>
                </div>
              )}

            {hybridRecommendations.length > 0 && (
              <div style={styles.recommendationsScroller}>
                {hybridRecommendations.map((item) => {
                  const book = item.book;
                  if (!book) return null;

                  const displayTitle = book.titleUk || book.title;
                  const score = formatScore(item.hybridScore);

                  return (
                    <div
                      key={book._id}
                      style={styles.recommendationCard}
                      onClick={() =>
                        (window.location.href = `/books/${book._id}`)
                      }
                    >
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={displayTitle}
                          style={styles.recommendationCover}
                        />
                      ) : (
                        <div style={styles.recommendationCoverPlaceholder}>
                          📖
                        </div>
                      )}

                      <div style={styles.recommendationContent}>
                        <div style={styles.recommendationScore}>
                          {score}%
                        </div>

                        <h3 style={styles.recommendationBookTitle}>
                          {displayTitle}
                        </h3>

                        {book.titleUk && book.titleUk !== book.title && (
                          <p style={styles.recommendationOriginalTitle}>
                            {book.title}
                          </p>
                        )}

                        <p style={styles.recommendationAuthor}>
                          {book.author || "Автор невідомий"}
                        </p>

                        <p style={styles.recommendationGenre}>
                          {book.genre || book.genres?.[0] || "Без категорії"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <div style={styles.floatingChat}>
        {isMiniChatOpen && (
          <div style={styles.miniChatWrapper}>
            <AiChatBox compact={true} height="520px" showSuggestions={false} />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsMiniChatOpen((prev) => !prev)}
          style={styles.floatingChatButton}
        >
          {isMiniChatOpen ? "✕" : "🤖"}
        </button>
      </div>
    </>
  );
}

const styles = {
  header: {
    background: "#ffffff",
    color: "#111827",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  headerTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "650",
    letterSpacing: "-0.02em",
  },

  nav: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },

  navLink: {
    color: "#4b5563",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },

  logoutBtn: {
    padding: "8px 16px",
    background: "#f9fafb",
    border: "1px solid #d1d5db",
    color: "#111827",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },

  wrapper: {
    background: "#f6f7f9",
    minHeight: "calc(100vh - 65px)",
    padding: "34px 24px",
  },

  container: {
    width: "100%",
    maxWidth: "1220px",
    margin: "0 auto",
  },

  pageHeader: {
    marginBottom: "24px",
  },

  title: {
    fontSize: "32px",
    color: "#111827",
    margin: "0 0 8px 0",
    fontWeight: "700",
    letterSpacing: "-0.04em",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "15px",
    lineHeight: "1.5",
  },

  searchForm: {
    display: "flex",
    gap: "12px",
    marginBottom: "22px",
    flexWrap: "wrap",
  },

  searchInput: {
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    outline: "none",
    color: "#111827",
  },

  categorySelect: {
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    minWidth: "190px",
    background: "#ffffff",
    outline: "none",
    color: "#111827",
    cursor: "pointer",
  },

  searchButton: {
    padding: "12px 20px",
    background: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  sections: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "26px",
  },

  sectionButton: {
    padding: "9px 15px",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    color: "#374151",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },

  sectionButtonActive: {
    padding: "9px 15px",
    background: "#111827",
    border: "1px solid #111827",
    color: "#ffffff",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  loadingText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
    padding: "24px",
  },

  errorText: {
    color: "#991b1b",
    textAlign: "center",
    fontSize: "14px",
    padding: "12px 14px",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  noResults: {
    textAlign: "center",
    fontSize: "15px",
    color: "#6b7280",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "34px 20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "18px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 8px 24px rgba(17, 24, 39, 0.04)",
    minHeight: "560px",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
  },

  cover: {
    width: "100%",
    height: "260px",
    objectFit: "cover",
    borderRadius: "14px",
    marginBottom: "14px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
  },

  coverPlaceholder: {
    width: "100%",
    height: "260px",
    borderRadius: "14px",
    marginBottom: "14px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "10px",
  },

  titleBlock: {
    flex: 1,
    minWidth: 0,
  },

  cardTitle: {
    fontSize: "17px",
    fontWeight: "650",
    color: "#111827",
    margin: 0,
    lineHeight: "1.35",
    letterSpacing: "-0.02em",
  },

  originalTitle: {
    margin: "5px 0 0 0",
    color: "#9ca3af",
    fontSize: "12px",
    lineHeight: "1.35",
  },

  likeButton: {
    width: "38px",
    height: "38px",
    background: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "17px",
    flexShrink: 0,
  },

  likeButtonActive: {
    background: "#fff1f2",
    border: "1px solid #fda4af",
  },

  author: {
    color: "#4b5563",
    fontSize: "14px",
    fontWeight: "500",
    margin: "0 0 8px 0",
  },

  genre: {
    width: "fit-content",
    margin: "0 0 12px 0",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    color: "#374151",
    fontSize: "12px",
    fontWeight: "600",
  },

  description: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.55",
    margin: 0,
    minHeight: "68px",
    flex: 1,
  },

  statusBlock: {
    marginTop: "16px",
  },

  label: {
    display: "block",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "6px",
  },

  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
  },

  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "34px",
  },

  paginationButton: {
    minWidth: "36px",
    padding: "9px 12px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },

  paginationButtonActive: {
    minWidth: "36px",
    padding: "9px 12px",
    background: "#111827",
    color: "#ffffff",
    border: "1px solid #111827",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "default",
  },

  recommendationsSection: {
    marginTop: "46px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(17, 24, 39, 0.04)",
  },

  recommendationsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    marginBottom: "20px",
  },

  recommendationsTitle: {
    margin: "0 0 6px 0",
    color: "#111827",
    fontSize: "24px",
    fontWeight: "750",
    letterSpacing: "-0.04em",
  },

  recommendationsSubtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
    maxWidth: "680px",
  },

  recommendationsRefresh: {
    padding: "10px 14px",
    background: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  recommendationsMessage: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },

  recommendationsError: {
    color: "#991b1b",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "14px",
  },

  recommendationsEmpty: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "24px",
    textAlign: "center",
  },

  recommendationsEmptyTitle: {
    margin: "0 0 8px 0",
    color: "#111827",
    fontSize: "18px",
  },

  recommendationsEmptyText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },

  recommendationsScroller: {
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    paddingBottom: "8px",
    scrollSnapType: "x mandatory",
  },

  recommendationCard: {
    minWidth: "230px",
    maxWidth: "230px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "14px",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(17, 24, 39, 0.035)",
    scrollSnapAlign: "start",
    display: "flex",
    flexDirection: "column",
  },

  recommendationCover: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    borderRadius: "14px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    marginBottom: "12px",
  },

  recommendationCoverPlaceholder: {
    width: "100%",
    height: "250px",
    borderRadius: "14px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    marginBottom: "12px",
  },

  recommendationContent: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  recommendationScore: {
    width: "fit-content",
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    borderRadius: "999px",
    padding: "5px 9px",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "2px",
  },

  recommendationBookTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "15px",
    fontWeight: "700",
    lineHeight: "1.35",
  },

  recommendationOriginalTitle: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "12px",
    lineHeight: "1.35",
  },

  recommendationAuthor: {
    margin: 0,
    color: "#4b5563",
    fontSize: "13px",
    fontWeight: "500",
  },

  recommendationGenre: {
    width: "fit-content",
    margin: "4px 0 0 0",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    color: "#374151",
    fontSize: "12px",
    fontWeight: "600",
  },

  floatingChat: {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    zIndex: 1000,
  },

  floatingChatButton: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background: "#111827",
    color: "#ffffff",
    border: "none",
    boxShadow: "0 14px 35px rgba(17, 24, 39, 0.25)",
    cursor: "pointer",
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  miniChatWrapper: {
    width: "360px",
    marginBottom: "14px",
  },
};