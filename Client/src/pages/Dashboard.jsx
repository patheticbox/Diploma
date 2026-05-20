// client/src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FallbackImage from "../components/FallbackImage";
import {
  layout,
  header,
  cards,
  typography,
  buttons,
  badges,
  grids,
  colors,
} from "../styles/theme";

export default function Dashboard() {
  const [user, setUser] = useState({ username: "Користувач" });
  const [mods, setMods] = useState([]);
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aiStatus, setAiStatus] = useState("checking");
  const [error, setError] = useState("");

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const getToken = () => {
    return getCookie("token") || localStorage.getItem("token");
  };

  const logout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  useEffect(() => {
    const initDashboard = async () => {
      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const authHeaders = {
          Authorization: `Bearer ${token}`,
        };

        let profileRes = await fetch("/api/auth/profile", {
          headers: authHeaders,
          credentials: "include",
        });

        if (!profileRes.ok) {
          profileRes = await fetch("/api/auth/me", {
            headers: authHeaders,
            credentials: "include",
          });
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData.user || profileData);
        }

        const modsRes = await fetch("/api/mods?limit=8&sort=popular", {
          credentials: "include",
        });

        if (modsRes.ok) {
          const modsData = await modsRes.json();
          setMods(modsData.mods || []);
        }

        const gamesRes = await fetch("/api/games", {
          credentials: "include",
        });

        if (gamesRes.ok) {
          const gamesData = await gamesRes.json();
          setGames(gamesData.games || []);
        }

        const categoriesRes = await fetch("/api/categories", {
          credentials: "include",
        });

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }

        const aiRes = await fetch("/api/ai/ping", {
          headers: authHeaders,
          credentials: "include",
        });

        setAiStatus(aiRes.ok ? "online" : "offline");
      } catch (err) {
        console.error(err);
        setError("Не вдалося завантажити дані панелі");
        setAiStatus("offline");
      }
    };

    initDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalDownloads = mods.reduce(
      (sum, mod) => sum + Number(mod.downloadCount || 0),
      0
    );

    const totalLikes = mods.reduce(
      (sum, mod) => sum + Number(mod.likesCount || 0),
      0
    );

    const averageRating =
      mods.length > 0
        ? (
            mods.reduce((sum, mod) => sum + Number(mod.averageRating || 0), 0) /
            mods.length
          ).toFixed(1)
        : "0.0";

    return {
      mods: mods.length,
      games: games.length,
      categories: categories.length,
      downloads: totalDownloads,
      likes: totalLikes,
      rating: averageRating,
    };
  }, [mods, games, categories]);

  const topMods = mods.slice(0, 3);

  const recentMods = [...mods]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

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

        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <span>{user?.username || "Користувач"}</span>
          </div>

          <button style={header.logoutBtn} onClick={logout}>
            Вийти
          </button>
        </div>
      </header>

      <main style={layout.wrapper}>
        <section style={styles.hero}>
          <div>
            <div style={badges.badge}>Сервіс модифікацій для відеоігор</div>

            <h1 style={typography.h1}>
              Вітаємо, {user?.username || "Користувач"} 👋
            </h1>

            <p style={styles.heroText}>
              Керуйте каталогом модів, переглядайте ігри, категорії,
              популярні модифікації та використовуйте AI-агента для підбору
              модів під конкретну гру або стиль проходження.
            </p>

            <div style={styles.heroActions}>
              <Link to="/mods" style={buttons.primary}>
                Переглянути моди
              </Link>

              <Link to="/chat" style={buttons.secondary}>
                Запитати AI
              </Link>

              <Link to="/games" style={buttons.secondary}>
                Перейти до ігор
              </Link>
            </div>
          </div>

          <div style={styles.aiCard}>
            <div style={styles.aiStatusRow}>
              <span
                style={{
                  ...styles.aiDot,
                  background:
                    aiStatus === "online"
                      ? colors.success
                      : aiStatus === "checking"
                      ? colors.warning
                      : colors.danger,
                }}
              />

              <span>
                {aiStatus === "online"
                  ? "AI Агент онлайн"
                  : aiStatus === "checking"
                  ? "Перевірка AI..."
                  : "AI Агент недоступний"}
              </span>
            </div>

            <div style={styles.aiIcon}>🤖</div>

            <h3 style={styles.aiCardTitle}>Розумний підбір модів</h3>

            <p style={styles.aiCardText}>
              Агент аналізує запит, гру, категорію, теги та популярність модів,
              щоб запропонувати релевантні варіанти з бази.
            </p>
          </div>
        </section>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <section style={styles.statsGrid}>
          <StatCard icon="🧩" label="Модів у каталозі" value={stats.mods} />
          <StatCard icon="🎮" label="Ігор у базі" value={stats.games} />
          <StatCard icon="🏷️" label="Категорій" value={stats.categories} />
          <StatCard icon="⬇️" label="Завантажень" value={stats.downloads} />
          <StatCard icon="❤️" label="Лайків" value={stats.likes} />
          <StatCard icon="⭐" label="Середній рейтинг" value={stats.rating} />
        </section>

        <section style={styles.contentGrid}>
          <div style={cards.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={typography.h2}>Популярні моди</h2>
                <p style={styles.panelSubtitle}>
                  Найактивніші модифікації за завантаженнями та оцінками
                </p>
              </div>

              <Link to="/mods" style={styles.panelLink}>
                Усі моди →
              </Link>
            </div>

            {topMods.length === 0 ? (
              <p style={styles.emptyText}>
                Поки немає модів у базі. Додайте перші модифікації або
                запустіть seed-скрипт.
              </p>
            ) : (
              <div style={styles.modGrid}>
                {topMods.map((mod) => (
                  <Link
                    to={`/mods/${mod._id}`}
                    key={mod._id}
                    style={styles.modCard}
                  >
                    <div style={styles.modImageBox}>
                      <FallbackImage
                        src={mod.coverImage}
                        alt={mod.titleUa || mod.title}
                        title={mod.titleUa || mod.title}
                        type="mod"
                      />

                      <span style={styles.modRatingBadge}>
                        ⭐ {mod.averageRating || 0}
                      </span>
                    </div>

                    <div style={styles.modCardContent}>
                      <span style={styles.modGameBadge}>
                        🎮{" "}
                        {mod.game?.titleUa ||
                          mod.game?.title ||
                          "Гра не вказана"}
                      </span>

                      <h3 style={styles.modTitle}>
                        {mod.titleUa || mod.title}
                      </h3>

                      <p style={styles.modDescription}>
                        {mod.shortDescription ||
                          mod.description ||
                          "Опис мода поки не додано."}
                      </p>

                      <div style={styles.modStats}>
                        <span>⬇️ {mod.downloadCount || 0}</span>
                        <span>❤️ {mod.likesCount || 0}</span>
                        <span>👁️ {mod.viewCount || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={cards.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={typography.h2}>Швидкі дії</h2>
                <p style={styles.panelSubtitle}>
                  Основні переходи для роботи з проєктом
                </p>
              </div>
            </div>

            <div style={styles.quickActions}>
              <QuickAction
                to="/mods"
                icon="🧩"
                title="Каталог модів"
                text="Переглянути всі доступні модифікації"
              />

              <QuickAction
                to="/chat"
                icon="🤖"
                title="AI Агент"
                text="Попросити рекомендацію або допомогу"
              />

              <QuickAction
                to="/games"
                icon="🎮"
                title="Ігри"
                text="Переглянути ігри, для яких є моди"
              />

              <QuickAction
                to="/mods"
                icon="🔎"
                title="Пошук модів"
                text="Знайти моди за категорією або грою"
              />
            </div>
          </div>
        </section>

        <section style={styles.bottomGrid}>
          <div style={cards.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={typography.h2}>Категорії модів</h2>
                <p style={styles.panelSubtitle}>
                  Основні типи модифікацій у системі
                </p>
              </div>
            </div>

            {categories.length === 0 ? (
              <p style={styles.emptyText}>
                Категорії ще не додані. Пізніше тут будуть графіка, геймплей,
                оптимізація, інтерфейс та інші типи модів.
              </p>
            ) : (
              <div style={styles.categoryGrid}>
                {categories.slice(0, 10).map((category) => (
                  <Link
                    to={`/mods?category=${category._id}`}
                    key={category._id}
                    style={badges.pill}
                  >
                    <span>{category.icon || "🏷️"}</span>
                    <span>{category.nameUa || category.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={cards.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={typography.h2}>Останні моди</h2>
                <p style={styles.panelSubtitle}>
                  Нещодавно додані або оновлені модифікації
                </p>
              </div>
            </div>

            {recentMods.length === 0 ? (
              <p style={styles.emptyText}>Поки немає останньої активності.</p>
            ) : (
              <div style={styles.activityList}>
                {recentMods.map((mod) => (
                  <Link
                    to={`/mods/${mod._id}`}
                    key={mod._id}
                    style={styles.activityItem}
                  >
                    <span>🧩 {mod.titleUa || mod.title}</span>

                    <span style={styles.activityStatus}>
                      {mod.game?.titleUa || mod.game?.title || "Без гри"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={styles.aiPanel}>
          <div>
            <p style={styles.aiPanelLabel}>AI Агент</p>

            <h2 style={styles.aiPanelTitle}>
              Не знаєш, який мод встановити?
            </h2>

            <p style={styles.aiPanelText}>
              Напиши запит типу: “порадь графічні моди для Minecraft”,
              “що встановити для слабкого ПК” або “дай моди для Skyrim на
              геймплей”.
            </p>
          </div>

          <Link to="/chat" style={buttons.primary}>
            Відкрити чат
          </Link>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <p style={styles.statLabel}>{label}</p>
      <h2 style={styles.statValue}>{value}</h2>
    </div>
  );
}

function QuickAction({ to, icon, title, text }) {
  return (
    <Link to={to} style={styles.quickAction}>
      <span style={styles.quickIcon}>{icon}</span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </Link>
  );
}

const styles = {
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: "650",
    color: colors.primaryText,
  },

  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: colors.softBg2,
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "850",
  },

  hero: {
    ...cards.hero,
    display: "grid",
    gridTemplateColumns: "1fr 330px",
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
    marginTop: "26px",
    flexWrap: "wrap",
  },

  aiCard: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "24px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  aiStatusRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    alignSelf: "flex-start",
    padding: "7px 10px",
    borderRadius: "999px",
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    color: colors.primaryText,
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "18px",
  },

  aiDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },

  aiIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    background: colors.softBg2,
    color: colors.primaryText,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    marginBottom: "14px",
  },

  aiCardTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "850",
    color: colors.textDark,
  },

  aiCardText: {
    margin: 0,
    color: colors.textMuted,
    fontSize: "14px",
    lineHeight: "1.65",
  },

  errorMessage: {
    color: "#7f1d1d",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "20px",
  },

  statsGrid: {
    ...grids.statsGrid,
    marginBottom: "22px",
  },

  statCard: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    background: colors.softBg2,
    border: `1px solid ${colors.border}`,
    color: colors.primaryText,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    marginBottom: "12px",
  },

  statLabel: {
    margin: "0 0 5px 0",
    color: colors.textMuted,
    fontSize: "14px",
    fontWeight: "650",
  },

  statValue: {
    margin: 0,
    fontSize: "31px",
    letterSpacing: "-0.05em",
    fontWeight: "900",
    color: colors.textDark,
  },

  contentGrid: {
    ...grids.contentGrid,
    marginBottom: "18px",
  },

  bottomGrid: {
    ...grids.twoColumns,
    marginBottom: "18px",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },

  panelSubtitle: {
    margin: "6px 0 0 0",
    color: colors.textMuted,
    fontSize: "13px",
    lineHeight: "1.5",
  },

  panelLink: {
    color: colors.primary,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  modGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },

  modCard: {
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "22px",
    overflow: "hidden",
    color: colors.textDark,
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 12px 28px rgba(21, 128, 61, 0.05)",
  },

  modImageBox: {
    height: "150px",
    position: "relative",
    background: colors.softBg2,
    overflow: "hidden",
  },

  modRatingBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(255, 255, 255, 0.92)",
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    padding: "6px 9px",
    fontSize: "12px",
    fontWeight: "850",
    backdropFilter: "blur(10px)",
  },

  modCardContent: {
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },

  modGameBadge: {
    alignSelf: "flex-start",
    background: colors.softBg2,
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    padding: "6px 9px",
    fontSize: "12px",
    fontWeight: "800",
  },

  modTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "900",
    letterSpacing: "-0.04em",
    color: colors.textDark,
    lineHeight: "1.2",
  },

  modDescription: {
    margin: 0,
    color: colors.textMuted,
    fontSize: "13px",
    lineHeight: "1.55",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: "60px",
  },

  modStats: {
    marginTop: "auto",
    display: "flex",
    gap: "10px",
    color: colors.primaryText,
    fontSize: "12px",
    fontWeight: "750",
    flexWrap: "wrap",
  },

  quickActions: {
    display: "grid",
    gap: "11px",
  },

  quickAction: {
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "18px",
    padding: "14px",
    color: colors.textDark,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  quickIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "15px",
    background: colors.softBg2,
    color: colors.primaryText,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flex: "0 0 44px",
  },

  categoryGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  activityList: {
    display: "grid",
    gap: "10px",
  },

  activityItem: {
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "13px 14px",
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    color: colors.textDark,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "750",
  },

  activityStatus: {
    color: colors.textMuted,
    fontWeight: "750",
    whiteSpace: "nowrap",
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: "14px",
    margin: 0,
    lineHeight: "1.6",
  },

  aiPanel: {
    background: "linear-gradient(135deg, #ffffff 0%, #dcfce7 100%)",
    border: `1px solid ${colors.border}`,
    borderRadius: "26px",
    padding: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  aiPanelLabel: {
    margin: "0 0 8px 0",
    color: colors.primary,
    fontSize: "13px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  aiPanelTitle: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: "900",
    letterSpacing: "-0.05em",
    color: colors.textDark,
  },

  aiPanelText: {
    margin: 0,
    maxWidth: "720px",
    color: colors.textMuted,
    lineHeight: "1.65",
  },
};