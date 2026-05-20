// src/pages/Game.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Game() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/games", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Не вдалося завантажити ігри");
        }

        const data = await res.json();
        setGames(data.games || []);
      } catch (err) {
        console.error("Games page error:", err);
        setError("Не вдалося завантажити список ігор");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const platforms = useMemo(() => {
    const allPlatforms = games.flatMap((game) => game.platforms || []);
    return ["all", ...new Set(allPlatforms)];
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const normalizedSearch = search.toLowerCase().trim();

      const matchesSearch =
        !normalizedSearch ||
        game.title?.toLowerCase().includes(normalizedSearch) ||
        game.titleUa?.toLowerCase().includes(normalizedSearch) ||
        game.description?.toLowerCase().includes(normalizedSearch) ||
        game.genres?.some((genre) =>
          genre.toLowerCase().includes(normalizedSearch)
        );

      const matchesPlatform =
        selectedPlatform === "all" ||
        game.platforms?.includes(selectedPlatform);

      return matchesSearch && matchesPlatform;
    });
  }, [games, search, selectedPlatform]);

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <Link to="/dashboard" style={styles.logo}>
          <span style={styles.logoIcon}>🧩</span>
          <span>ModVerse</span>
        </Link>

        <nav style={styles.nav}>
          <Link to="/dashboard" style={styles.navLink}>
            📊 Панель
          </Link>
          <Link to="/mods" style={styles.navLink}>
            🧩 Моди
          </Link>
          <Link to="/games" style={styles.navLinkActive}>
            🎮 Ігри
          </Link>
          <Link to="/chat" style={styles.navLink}>
            🤖 AI Агент
          </Link>
        </nav>
      </header>

      <main style={styles.wrapper}>
        <section style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>Каталог ігор</p>

            <h1 style={styles.heroTitle}>Ігри з підтримкою модифікацій</h1>

            <p style={styles.heroText}>
              Оберіть гру, щоб переглянути доступні моди, категорії,
              покращення графіки, геймплейні зміни, оптимізаційні патчі та
              інші модифікації.
            </p>
          </div>

          <div style={styles.heroStats}>
            <div style={styles.heroStatCard}>
              <span style={styles.heroStatIcon}>🎮</span>
              <strong>{games.length}</strong>
              <p>ігор у базі</p>
            </div>

            <div style={styles.heroStatCard}>
              <span style={styles.heroStatIcon}>🖥</span>
              <strong>{platforms.length - 1}</strong>
              <p>платформ</p>
            </div>
          </div>
        </section>

        <section style={styles.filtersPanel}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔎</span>

            <input
              type="text"
              placeholder="Пошук гри, жанру або опису..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            style={styles.select}
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform === "all" ? "Усі платформи" : platform}
              </option>
            ))}
          </select>
        </section>

        {error && <div style={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.loader}>🎮</div>
            <p>Завантаження ігор...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div style={styles.emptyBox}>
            <h2>Ігри не знайдено</h2>
            <p>
              Спробуйте змінити пошуковий запит або вибрати іншу платформу.
            </p>
          </div>
        ) : (
          <section style={styles.gamesGrid}>
            {filteredGames.map((game) => (
              <article key={game._id} style={styles.gameCard}>
                <div style={styles.coverBox}>
                  {game.coverImage ? (
                    <img
                      src={game.coverImage}
                      alt={game.titleUa || game.title}
                      style={styles.coverImage}
                    />
                  ) : (
                    <div style={styles.coverPlaceholder}>🎮</div>
                  )}

                  <div style={styles.coverOverlay}>
                    <span>{game.releaseYear || "N/A"}</span>
                  </div>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h2 style={styles.gameTitle}>
                        {game.titleUa || game.title}
                      </h2>

                      <p style={styles.originalTitle}>{game.title}</p>
                    </div>
                  </div>

                  <p style={styles.description}>
                    {game.description || "Опис гри поки не додано."}
                  </p>

                  <div style={styles.genreList}>
                    {(game.genres || []).slice(0, 4).map((genre) => (
                      <span key={genre} style={styles.genreTag}>
                        {genre}
                      </span>
                    ))}
                  </div>

                  <div style={styles.infoGrid}>
                    <div>
                      <span style={styles.infoLabel}>Розробник</span>
                      <strong style={styles.infoValue}>
                        {game.developer || "Не вказано"}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.infoLabel}>Видавець</span>
                      <strong style={styles.infoValue}>
                        {game.publisher || "Не вказано"}
                      </strong>
                    </div>
                  </div>

                  <div style={styles.platforms}>
                    {(game.platforms || []).map((platform) => (
                      <span key={platform} style={styles.platformTag}>
                        {platform}
                      </span>
                    ))}
                  </div>

                  <div style={styles.cardActions}>
                    <Link
                      to={`/mods?game=${game._id}`}
                      style={styles.primaryButton}
                    >
                      Переглянути моди
                    </Link>

                    <Link
                      to={`/chat?game=${encodeURIComponent(
                        game.titleUa || game.title
                      )}`}
                      style={styles.secondaryButton}
                    >
                      Запитати AI
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  body: {
    minHeight: "100vh",
    background: "#0b0f19",
    color: "#f9fafb",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background: "rgba(11, 15, 25, 0.92)",
    color: "#f9fafb",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(16px)",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "20px",
    fontWeight: "800",
    letterSpacing: "-0.04em",
  },

  logoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    background: "#7c3aed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  nav: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },

  navLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
  },

  navLinkActive: {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
  },

  wrapper: {
    width: "100%",
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "34px 24px",
  },

  hero: {
    background:
      "radial-gradient(circle at top right, rgba(124, 58, 237, 0.32), transparent 36%), #111827",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "28px",
    padding: "34px",
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "26px",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.22)",
    marginBottom: "24px",
  },

  eyebrow: {
    margin: "0 0 8px 0",
    color: "#a78bfa",
    fontSize: "14px",
    fontWeight: "800",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  heroTitle: {
    margin: "0 0 12px 0",
    fontSize: "42px",
    lineHeight: "1.08",
    fontWeight: "900",
    letterSpacing: "-0.06em",
  },

  heroText: {
    margin: 0,
    maxWidth: "720px",
    color: "#cbd5e1",
    fontSize: "16px",
    lineHeight: "1.7",
  },

  heroStats: {
    display: "grid",
    gap: "12px",
  },

  heroStatCard: {
    background: "rgba(15, 23, 42, 0.78)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "20px",
    padding: "18px",
  },

  heroStatIcon: {
    fontSize: "26px",
  },

  filtersPanel: {
    background: "#111827",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "20px",
    padding: "16px",
    display: "grid",
    gridTemplateColumns: "1fr 220px",
    gap: "14px",
    marginBottom: "24px",
  },

  searchBox: {
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: "14px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  searchIcon: {
    color: "#94a3b8",
  },

  searchInput: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f9fafb",
    padding: "13px 0",
    fontSize: "14px",
  },

  select: {
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: "14px",
    color: "#f9fafb",
    padding: "0 14px",
    fontSize: "14px",
    outline: "none",
  },

  gamesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
    gap: "20px",
  },

  gameCard: {
    background: "#111827",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.16)",
  },

  coverBox: {
    height: "210px",
    position: "relative",
    background: "#1f2937",
    overflow: "hidden",
  },

  coverImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  coverPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "54px",
  },

  coverOverlay: {
    position: "absolute",
    top: "14px",
    right: "14px",
    background: "rgba(15, 23, 42, 0.86)",
    color: "#ffffff",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "12px",
    fontWeight: "800",
  },

  cardContent: {
    padding: "20px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
  },

  gameTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: "900",
    letterSpacing: "-0.04em",
  },

  originalTitle: {
    margin: "5px 0 0 0",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "600",
  },

  description: {
    margin: "14px 0",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: "1.65",
    minHeight: "68px",
  },

  genreList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px",
  },

  genreTag: {
    background: "rgba(124, 58, 237, 0.16)",
    color: "#ddd6fe",
    border: "1px solid rgba(167, 139, 250, 0.2)",
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "12px",
    fontWeight: "800",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },

  infoLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "4px",
  },

  infoValue: {
    display: "block",
    color: "#f9fafb",
    fontSize: "13px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  platforms: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "18px",
  },

  platformTag: {
    background: "rgba(15, 23, 42, 0.9)",
    color: "#e5e7eb",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "999px",
    padding: "6px 9px",
    fontSize: "12px",
    fontWeight: "700",
  },

  cardActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  primaryButton: {
    background: "#7c3aed",
    color: "#ffffff",
    padding: "11px 14px",
    borderRadius: "13px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
  },

  secondaryButton: {
    background: "rgba(248, 250, 252, 0.08)",
    color: "#f9fafb",
    padding: "11px 14px",
    borderRadius: "13px",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
  },

  loadingBox: {
    background: "#111827",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "22px",
    padding: "40px",
    textAlign: "center",
    color: "#cbd5e1",
  },

  loader: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  emptyBox: {
    background: "#111827",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "22px",
    padding: "40px",
    textAlign: "center",
    color: "#cbd5e1",
  },

  errorMessage: {
    color: "#fecaca",
    background: "rgba(127, 29, 29, 0.4)",
    border: "1px solid rgba(248, 113, 113, 0.32)",
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "20px",
  },
};