import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [type, setType] = useState("hybrid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatScore = (score) => {
  if (!score) return 0;

  if (score > 1) {
    return Math.min(Math.round(score * 10), 100);
  }

  return Math.round(score * 100);
  };
  const fetchRecommendations = async (method = type) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/recommendations/${method}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Не вдалося завантажити рекомендації");
      }

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
      setError("Не вдалося отримати рекомендації");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(type);
  }, [type]);

  const getScore = (item) => {
    if (type === "content-based") return item.contentScore;
    if (type === "collaborative") return item.collaborativeScore;
    return item.hybridScore;
  };

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Персональні рекомендації</h2>
          <p style={styles.subtitle}>
            Книги підібрані на основі ваших вподобань та поведінки інших користувачів.
          </p>
        </div>

        <button onClick={() => fetchRecommendations(type)} style={styles.refreshBtn}>
          Оновити
        </button>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setType("hybrid")}
          style={type === "hybrid" ? styles.tabActive : styles.tab}
        >
          Hybrid
        </button>

        <button
          onClick={() => setType("content-based")}
          style={type === "content-based" ? styles.tabActive : styles.tab}
        >
          Content-Based
        </button>

        <button
          onClick={() => setType("collaborative")}
          style={type === "collaborative" ? styles.tabActive : styles.tab}
        >
          Collaborative
        </button>
      </div>

      {loading && <p style={styles.message}>Завантаження рекомендацій...</p>}

      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && recommendations.length === 0 && (
        <div style={styles.empty}>
          <h3 style={styles.emptyTitle}>Поки немає рекомендацій</h3>
          <p style={styles.emptyText}>
            Лайкніть кілька книг або додайте їх у списки “Прочитано” чи “Читаю”.
          </p>
          <Link to="/books" style={styles.emptyButton}>
            Перейти до каталогу
          </Link>
        </div>
      )}

      <div style={styles.grid}>
        {recommendations.map((item) => {
          const book = item.book;
          const score = getScore(item);

          return (
            <Link
              key={book._id}
              to={`/books/${book._id}`}
              style={styles.card}
            >
              <div style={styles.cardTop}>
                <div style={styles.cover}>📖</div>

                <div style={styles.score}>
                  {formatScore(score)}%
                </div>
              </div>

              <h3 style={styles.bookTitle}>{book.title}</h3>

              <p style={styles.author}>
                {book.author || "Автор невідомий"}
              </p>

              <p style={styles.description}>
                {book.description
                  ? `${book.description.slice(0, 100)}...`
                  : "Опис відсутній"}
              </p>

              <div style={styles.meta}>
                <span>{book.genre || book.genres?.[0] || "Жанр не вказано"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  section: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(17, 24, 39, 0.04)",
    marginBottom: "24px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
    marginBottom: "18px",
  },

  title: {
    margin: "0 0 6px 0",
    fontSize: "24px",
    color: "#111827",
    fontWeight: "700",
    letterSpacing: "-0.03em",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  refreshBtn: {
    padding: "10px 14px",
    background: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  tabs: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  tab: {
    padding: "8px 13px",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    color: "#374151",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },

  tabActive: {
    padding: "8px 13px",
    background: "#111827",
    border: "1px solid #111827",
    color: "#ffffff",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  message: {
    color: "#6b7280",
    fontSize: "14px",
  },

  error: {
    color: "#991b1b",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "14px",
  },

  empty: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "24px",
    textAlign: "center",
  },

  emptyTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
  },

  emptyText: {
    margin: "0 0 16px 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  emptyButton: {
    display: "inline-block",
    background: "#111827",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: "12px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "16px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "16px",
    textDecoration: "none",
    color: "#111827",
    boxShadow: "0 6px 18px rgba(17, 24, 39, 0.035)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },

  cover: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  score: {
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    borderRadius: "999px",
    padding: "5px 9px",
    fontSize: "12px",
    fontWeight: "700",
  },

  bookTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "650",
    lineHeight: "1.35",
  },

  author: {
    margin: "0 0 10px 0",
    color: "#4b5563",
    fontSize: "13px",
    fontWeight: "500",
  },

  description: {
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 12px 0",
  },

  meta: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  meta: {
    color: "#374151",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "999px",
    padding: "6px 9px",
    fontSize: "12px",
    width: "fit-content",
  },
};