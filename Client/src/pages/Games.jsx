// client/src/pages/Games.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AiChatBot from "../components/AiChatBox";
import FallbackImage from "../components/FallbackImage";
import {
  layout,
  header,
  cards,
  typography,
  buttons,
  forms,
  badges,
  grids,
  colors,
} from "../styles/theme";

export default function Games() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chatOpen, setChatOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError("");

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
        game.developer?.toLowerCase().includes(normalizedSearch) ||
        game.publisher?.toLowerCase().includes(normalizedSearch) ||
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
    <div style={layout.page}>
      <header style={header.header}>
        <Link to="/dashboard" style={header.logo}>
          <span style={header.logoIcon}>🧩</span>
          <span>ModVerse</span>
        </Link>

<nav style={header.nav}>
          <Link to="/mods/create" style={buttons.primary}>
  Додати мод
</Link>
          <Link to="/dashboard" style={header.navLink}>
            Панель
          </Link>

          <Link to="/mods" style={header.navLinkActive}>
            Моди
          </Link>

          <Link to="/games" style={header.navLink}>
            Ігри
          </Link>

          <Link to="/chat" style={header.navLink}>
            AI Агент
          </Link>
        </nav>

        <button onClick={logout} style={header.logoutBtn}>
          Вийти
        </button>
      </header>

      <main style={layout.wrapper}>
        <section style={styles.hero}>
          <div>
            <div style={badges.badge}>🎮 Каталог ігор</div>

            <h1 style={typography.h1}>Ігри з підтримкою модифікацій</h1>

            <p style={styles.heroText}>
              Оберіть гру, щоб переглянути доступні моди: графічні покращення,
              геймплейні зміни, оптимізаційні патчі, нові карти, транспорт,
              звуки, персонажів та інші доповнення.
            </p>

            <div style={styles.heroActions}>
              <Link to="/mods" style={buttons.primary}>
                Переглянути всі моди
              </Link>

              <button
                type="button"
                onClick={() => setChatOpen(true)}
                style={buttons.secondary}
              >
                Запитати AI-агента
              </button>
            </div>
          </div>

          <div style={styles.heroStats}>
            <div style={styles.heroStatCard}>
              <div style={styles.heroStatIcon}>🎮</div>
              <strong>{games.length}</strong>
              <p>ігор у базі</p>
            </div>

            <div style={styles.heroStatCard}>
              <div style={styles.heroStatIcon}>🖥️</div>
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
              placeholder="Пошук гри, жанру, розробника або опису..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            style={forms.select}
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
            <div style={styles.loadingIcon}>🎮</div>
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
          <section style={grids.cardsGrid}>
            {filteredGames.map((game) => (
              <GameCard
                key={game._id}
                game={game}
                openChat={() => setChatOpen(true)}
              />
            ))}
          </section>
        )}
      </main>

      {chatOpen && (
        <div style={styles.chatPopup}>
          <div style={styles.chatPopupHeader}>
            <div>
              <h3 style={styles.chatPopupTitle}>AI Агент</h3>
              <p style={styles.chatPopupSubtitle}>
                Порадить моди для обраної гри
              </p>
            </div>

            <button
              type="button"
              onClick={() => setChatOpen(false)}
              style={styles.chatCloseBtn}
            >
              ✕
            </button>
          </div>

          <div style={styles.chatPopupBody}>
            <AiChatBot compact={true} height="520px" showSuggestions={false} />
          </div>
        </div>
      )}

      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          style={styles.chatFloatingButton}
        >
          <span style={styles.chatFloatingIcon}>🤖</span>
          <span>AI Агент</span>
        </button>
      )}
    </div>
  );
}

function GameCard({ game, openChat }) {
  return (
    <article style={styles.gameCard}>
      <div style={styles.coverBox}>
        <FallbackImage
          src={game.coverImage}
          alt={game.titleUa || game.title}
          title={game.titleUa || game.title}
          type="game"
        />

        <div style={styles.yearBadge}>{game.releaseYear || "N/A"}</div>
      </div>

      <div style={styles.cardContent}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.gameTitle}>{game.titleUa || game.title}</h2>

            <p style={styles.originalTitle}>{game.title}</p>
          </div>

          {typeof game.modsCount === "number" && (
            <span style={styles.modsCountBadge}>🧩 {game.modsCount}</span>
          )}
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
          <div style={styles.infoBox}>
            <span style={styles.infoLabel}>Розробник</span>
            <strong style={styles.infoValue}>
              {game.developer || "Не вказано"}
            </strong>
          </div>

          <div style={styles.infoBox}>
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
          <Link to={`/mods?game=${game._id}`} style={buttons.primary}>
            Переглянути моди
          </Link>

          <button type="button" onClick={openChat} style={buttons.secondary}>
            Запитати AI
          </button>
        </div>
      </div>
    </article>
  );
}

const styles = {
  hero: {
    ...cards.hero,
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "26px",
    marginBottom: "22px",
  },

  heroText: {
    ...typography.text,
    maxWidth: "760px",
  },

  heroActions: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    flexWrap: "wrap",
  },

  heroStats: {
    display: "grid",
    gap: "12px",
  },

  heroStatCard: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  heroStatIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    background: colors.softBg2,
    color: colors.primaryText,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "12px",
  },

  filtersPanel: {
    ...cards.panelSmall,
    display: "grid",
    gridTemplateColumns: "1fr 230px",
    gap: "14px",
    marginBottom: "22px",
  },

  searchBox: {
    ...forms.searchBox,
    background: colors.cardBg,
  },

  searchIcon: {
    color: colors.textMuted,
  },

  searchInput: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: colors.text,
    padding: "13px 0",
    fontSize: "14px",
  },

  gameCard: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
    display: "flex",
    flexDirection: "column",
  },

  coverBox: {
    height: "210px",
    position: "relative",
    background: colors.softBg2,
    overflow: "hidden",
  },

  yearBadge: {
    position: "absolute",
    top: "14px",
    right: "14px",
    background: "rgba(255, 255, 255, 0.92)",
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "12px",
    fontWeight: "850",
    backdropFilter: "blur(10px)",
  },

  cardContent: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    marginBottom: "12px",
  },

  gameTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "900",
    letterSpacing: "-0.04em",
    color: colors.textDark,
  },

  originalTitle: {
    margin: "5px 0 0 0",
    color: colors.textMuted,
    fontSize: "13px",
    fontWeight: "650",
  },

  modsCountBadge: {
    height: "fit-content",
    background: colors.softBg2,
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "12px",
    fontWeight: "850",
    whiteSpace: "nowrap",
  },

  description: {
    margin: "0 0 14px 0",
    color: colors.textMuted,
    fontSize: "14px",
    lineHeight: "1.65",
    minHeight: "70px",
  },

  genreList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px",
  },

  genreTag: {
    background: colors.softBg,
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
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

  infoBox: {
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "11px 12px",
    minWidth: 0,
  },

  infoLabel: {
    display: "block",
    color: colors.textMuted,
    fontSize: "12px",
    marginBottom: "4px",
    fontWeight: "650",
  },

  infoValue: {
    display: "block",
    color: colors.textDark,
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
    background: colors.cardBg,
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    padding: "6px 9px",
    fontSize: "12px",
    fontWeight: "750",
  },

  cardActions: {
    marginTop: "auto",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  loadingBox: {
    ...cards.panel,
    textAlign: "center",
    color: colors.textMuted,
    padding: "44px",
  },

  loadingIcon: {
    fontSize: "44px",
    marginBottom: "10px",
  },

  emptyBox: {
    ...cards.panel,
    textAlign: "center",
    color: colors.textMuted,
    padding: "44px",
  },

  errorMessage: {
    color: "#7f1d1d",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "20px",
  },

  chatFloatingButton: {
    position: "fixed",
    right: "28px",
    bottom: "28px",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    background: "#15803d",
    color: "#ffffff",
    border: "2px solid #ffffff",
    borderRadius: "999px",
    padding: "15px 22px",
    minWidth: "150px",
    height: "58px",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 20px 55px rgba(21, 128, 61, 0.45)",
  },

  chatFloatingIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  chatPopup: {
    position: "fixed",
    right: "28px",
    bottom: "28px",
    width: "430px",
    maxWidth: "calc(100vw - 32px)",
    zIndex: 99999,
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 24px 70px rgba(21, 128, 61, 0.35)",
  },

  chatPopupHeader: {
    padding: "14px 16px",
    background:
      "linear-gradient(135deg, #ffffff 0%, #f0fdf4 55%, #dcfce7 100%)",
    borderBottom: `1px solid ${colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  chatPopupBody: {
    background: colors.cardBg,
  },

  chatPopupTitle: {
    margin: 0,
    color: colors.textDark,
    fontSize: "17px",
    fontWeight: "900",
    letterSpacing: "-0.04em",
  },

  chatPopupSubtitle: {
    margin: "4px 0 0 0",
    color: colors.textMuted,
    fontSize: "12px",
    fontWeight: "650",
  },

  chatCloseBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    border: `1px solid ${colors.border}`,
    background: colors.cardBg,
    color: colors.primaryText,
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "900",
  },
};