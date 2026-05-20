// src/pages/BookDetails.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AiChatBox from "../components/AiChatBox";

export default function BookDetails() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isMiniChatOpen, setIsMiniChatOpen] = useState(false);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/books/${id}`);

        if (!res.ok) {
          throw new Error("Книгу не знайдено");
        }

        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error(err);
        setError("Не вдалося завантажити книгу");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const requestAiReview = async () => {
    if (!book) return;

    setReviewLoading(true);
    setReviewError("");
    setReviewText("");

    const displayTitle = book.titleUk || book.title;

    const prompt = `
Зроби короткий огляд книги "${displayTitle}".
Оригінальна назва: ${book.title || "не вказано"}
Автор: ${book.author || "невідомий"}
Жанр: ${book.genre || book.genres?.join(", ") || "не вказано"}
Рік: ${book.year || "не вказано"}
Опис: ${book.description || "опис відсутній"}

Вимоги:
- відповідай українською мовою;
- не роби спойлерів;
- поясни, про що книга загалом;
- кому вона може сподобатись;
- чому її варто або не варто читати;
- в кінці дай коротку оцінку у форматі: "Кому підійде: ...";
- не вигадуй фактів, яких немає в даних книги.
`;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/ai/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: prompt }),
      });

      if (!res.ok) {
        throw new Error("Не вдалося отримати огляд від AI");
      }

      const data = await res.json();

      setReviewText(data.aiResponse || "AI не повернув відповідь.");
    } catch (err) {
      console.error(err);
      setReviewError("Не вдалося отримати огляд від AI Агента.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <p style={styles.center}>Завантаження...</p>;
  if (error) return <p style={styles.center}>{error}</p>;
  if (!book) return null;

  const displayTitle = book.titleUk || book.title;
  const hasOriginalTitle = book.titleUk && book.titleUk !== book.title;

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
          <Link to="/books" style={styles.backLink}>
            ← Назад до каталогу
          </Link>

          <div style={styles.card}>
            <div style={styles.coverColumn}>
              {book.coverUrl ? (
                <button
                  type="button"
                  style={styles.coverButton}
                  onClick={() => setIsCoverOpen(true)}
                  title="Відкрити обкладинку"
                >
                  <img
                    src={book.coverUrl}
                    alt={displayTitle}
                    style={styles.coverImage}
                  />
                </button>
              ) : (
                <div style={styles.coverPlaceholder}>📖</div>
              )}

              {book.coverUrl && (
                <p style={styles.coverHint}>
                  Натисніть на обкладинку, щоб відкрити
                </p>
              )}
            </div>

            <div style={styles.info}>
              <h1 style={styles.title}>{displayTitle}</h1>

              {hasOriginalTitle && (
                <p style={styles.originalTitle}>
                  Оригінальна назва: {book.title}
                </p>
              )}

              <p style={styles.author}>
                ✍️ {book.author || "Автор невідомий"}
              </p>

              <div style={styles.metaGrid}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Жанр</span>
                  <span>
                    {book.genre || book.genres?.join(", ") || "Не вказано"}
                  </span>
                </div>

                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Рік</span>
                  <span>{book.year || "Не вказано"}</span>
                </div>

                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Мова</span>
                  <span>{book.language || "Не вказано"}</span>
                </div>
              </div>

              {book.tags?.length > 0 && (
                <div style={styles.tags}>
                  {book.tags.map((tag, index) => (
                    <span key={index} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h2 style={styles.sectionTitle}>Опис</h2>

              <p style={styles.description}>
                {book.description || "Опис відсутній."}
              </p>

              <div style={styles.aiReviewBlock}>
                <button
                  type="button"
                  onClick={requestAiReview}
                  disabled={reviewLoading}
                  style={{
                    ...styles.aiReviewButton,
                    ...(reviewLoading ? styles.aiReviewButtonDisabled : {}),
                  }}
                >
                  {reviewLoading
                    ? "AI готує огляд..."
                    : "🤖 Запросити огляд від AI Агента"}
                </button>

                <p style={styles.aiReviewHint}>
                  AI коротко пояснить, про що книга, кому вона може сподобатись
                  і чи варто її читати.
                </p>

                {(reviewLoading || reviewError || reviewText) && (
                  <div style={styles.aiReviewResult}>
                    <div style={styles.aiReviewResultHeader}>
                      <h3 style={styles.aiReviewResultTitle}>AI огляд книги</h3>
                    </div>

                    {reviewLoading && (
                      <p style={styles.reviewLoading}>
                        ⏳ AI аналізує книгу...
                      </p>
                    )}

                    {reviewError && (
                      <p style={styles.reviewError}>{reviewError}</p>
                    )}

                    {!reviewLoading && !reviewError && reviewText && (
                      <p style={styles.reviewText}>{reviewText}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isCoverOpen && book.coverUrl && (
        <div
          style={styles.modalOverlay}
          onClick={() => setIsCoverOpen(false)}
        >
          <button
            type="button"
            style={styles.closeButton}
            onClick={() => setIsCoverOpen(false)}
          >
            ✕
          </button>

          <img
            src={book.coverUrl}
            alt={displayTitle}
            style={styles.fullCover}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

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
    maxWidth: "1100px",
    margin: "0 auto",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "20px",
    color: "#374151",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    padding: "28px",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: "32px",
    boxShadow: "0 8px 24px rgba(17, 24, 39, 0.04)",
  },

  coverColumn: {
    width: "100%",
  },

  coverButton: {
    width: "100%",
    padding: 0,
    background: "transparent",
    border: "none",
    cursor: "zoom-in",
  },

  coverImage: {
    width: "100%",
    height: "380px",
    objectFit: "cover",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    display: "block",
    boxShadow: "0 12px 30px rgba(17, 24, 39, 0.10)",
  },

  coverPlaceholder: {
    height: "380px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "70px",
  },

  coverHint: {
    margin: "10px 0 0 0",
    color: "#9ca3af",
    fontSize: "12px",
    textAlign: "center",
  },

  info: {
    minWidth: 0,
  },

  title: {
    margin: "0 0 10px 0",
    color: "#111827",
    fontSize: "36px",
    fontWeight: "750",
    letterSpacing: "-0.05em",
    lineHeight: "1.12",
  },

  originalTitle: {
    margin: "0 0 14px 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  author: {
    color: "#4b5563",
    fontSize: "16px",
    fontWeight: "500",
    marginBottom: "22px",
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  metaItem: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    color: "#111827",
    fontSize: "14px",
  },

  metaLabel: {
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "600",
  },

  tags: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  tag: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "500",
  },

  sectionTitle: {
    margin: "0 0 10px 0",
    fontSize: "20px",
    color: "#111827",
  },

  description: {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: "1.7",
    margin: 0,
  },

  aiReviewBlock: {
    marginTop: "28px",
    padding: "18px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
  },

  aiReviewButton: {
    width: "100%",
    padding: "13px 18px",
    background: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },

  aiReviewButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  aiReviewHint: {
    margin: "10px 0 0 0",
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  aiReviewResult: {
    marginTop: "18px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "16px",
  },

  aiReviewResultHeader: {
    marginBottom: "10px",
  },

  aiReviewResultTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "17px",
    fontWeight: "700",
  },

  reviewLoading: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },

  reviewError: {
    margin: 0,
    color: "#991b1b",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "14px",
  },

  reviewText: {
    margin: 0,
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.7",
    whiteSpace: "pre-wrap",
  },

  center: {
    padding: "40px",
    textAlign: "center",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.82)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px",
  },

  fullCover: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    objectFit: "contain",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },

  closeButton: {
    position: "fixed",
    top: "22px",
    right: "26px",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontSize: "20px",
    cursor: "pointer",
    zIndex: 10000,
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