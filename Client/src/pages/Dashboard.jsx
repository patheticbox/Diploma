// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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

        // Профіль користувача.
        // Спочатку пробуємо /profile, якщо в authRoutes інший endpoint — пробуємо /me.
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

        // Моди
        const modsRes = await fetch("/api/mods?limit=8&sort=popular", {
          credentials: "include",
        });

        if (modsRes.ok) {
          const modsData = await modsRes.json();
          setMods(modsData.mods || []);
        }

        // Ігри
        const gamesRes = await fetch("/api/games", {
          credentials: "include",
        });

        if (gamesRes.ok) {
          const gamesData = await gamesRes.json();
          setGames(gamesData.games || []);
        }

        // Категорії
        const categoriesRes = await fetch("/api/categories", {
          credentials: "include",
        });

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }

        // AI статус
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

  const topMods = mods.slice(0, 4);
  const recentMods = [...mods]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

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
          <Link to="/games" style={styles.navLink}>
            🎮 Ігри
          </Link>
          <Link to="/chat" style={styles.navLink}>
            🤖 AI Агент
          </Link>
        </nav>

        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span>{user?.username || "Користувач"}</span>
          </div>

          <button style={styles.logoutBtn} onClick={logout}>
            Вийти
          </button>
        </div>
      </header>

      <main style={styles.wrapper}>
        <section style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>Сервіс модифікацій для відеоігор</p>

            <h1 style={styles.heroTitle}>
              Вітаємо, {user?.username || "Користувач"} 👋
            </h1>

            <p style={styles.heroText}>
              Тут можна переглядати моди для різних ігор, знаходити графічні,
              геймплейні та оптимізаційні модифікації, а також отримувати
              персональні поради від розумного AI-агента.
            </p>

            <div style={styles.heroActions}>
              <Link to="/mods" style={styles.primaryButton}>
                Переглянути моди
              </Link>

              <Link to="/chat" style={styles.secondaryButton}>
                Запитати AI-агента
              </Link>

              <Link to="/add-mod" style={styles.secondaryButton}>
                Додати мод
              </Link>
            </div>
          </div>

          <div style={styles.heroCard}>
            <div style={styles.aiBadge}>
              <span
                style={{
                  ...styles.aiDot,
                  background:
                    aiStatus === "online"
                      ? "#22c55e"
                      : aiStatus === "checking"
                      ? "#f59e0b"
                      : "#ef4444",
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

            <span style={styles.heroIcon}>🤖</span>

            <h3 style={styles.heroCardTitle}>Розумний підбір модів</h3>

            <p style={styles.heroCardText}>
              AI-агент може підібрати моди за грою, жанром, категорією,
              продуктивністю або стилем проходження.
            </p>
          </div>
        </section>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <section style={styles.statsGrid}>
          <StatCard icon="🧩" label="Модів у каталозі" value={stats.mods} />
          <StatCard icon="🎮" label="Ігор у базі" value={stats.games} />
          <StatCard icon="🏷" label="Категорій" value={stats.categories} />
          <StatCard icon="⬇️" label="Завантажень" value={stats.downloads} />
          <StatCard icon="❤️" label="Лайків" value={stats.likes} />
          <StatCard icon="⭐️" label="Середній рейтинг" value={stats.rating} />
        </section>

        <section style={styles.contentGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Популярні моди</h2>
                <p style={styles.panelSubtitle}>
                  Найактивніші модифікації за завантаженнями та оцінками
                </p>
              </div>

              <Link to="/mods" style={styles.panelLink}>
                Усі моди
              </Link>
            </div>

            {topMods.length === 0 ? (
              <p style={styles.emptyText}>
                Поки немає модів у базі. Додайте перші модифікації або запустіть
                seed-скрипт.
              </p>
            ) : (
              <div style={styles.modList}>
                {topMods.map((mod) => (
                  <Link
                    to={`/mods/${mod._id}`}
                    key={mod._id}
                    style={styles.modItem}
                  >
                    <div style={styles.modCover}>
                      {mod.coverImage ? (
                        <img
                          src={mod.coverImage}
                          alt={mod.titleUa || mod.title}
                          style={styles.modCoverImg}
                        />
                      ) : (
                        <span>🧩</span>
                      )}
                    </div>

                    <div style={styles.modInfo}>
                      <h3 style={styles.modTitle}>
                        {mod.titleUa || mod.title}
                      </h3>

                      <p style={styles.modMeta}>
                        {mod.game?.titleUa || mod.game?.title || "Гра не вказана"}
                      </p>

                      <div style={styles.modStats}>
                        <span>⬇️ {mod.downloadCount || 0}</span>
                        <span>❤️ {mod.likesCount || 0}</span>
                        <span>⭐️ {mod.averageRating || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Швидкі дії</h2>
                <p style={styles.panelSubtitle}>
                  Основні переходи для роботи з проєктом
                </p>
              </div>
            </div>

            <div style={styles.quickActions}>
              <Link to="/mods" style={styles.quickAction}>
                <span style={styles.quickIcon}>🧩</span>
                <div>
                  <strong>Каталог модів</strong>
                  <p>Переглянути всі доступні модифікації</p>
                </div>
              </Link>

              <Link to="/chat" style={styles.quickAction}>
                <span style={styles.quickIcon}>🤖</span>
                <div>
                  <strong>AI Агент</strong>
                  <p>Попросити рекомендацію або допомогу</p>
                </div>
              </Link>

              <Link to="/add-mod" style={styles.quickAction}>
                <span style={styles.quickIcon}>➕</span>
                <div>
                  <strong>Додати мод</strong>
                  <p>Створити нову сторінку модифікації</p>
                </div>
              </Link>

              <Link to="/games" style={styles.quickAction}>
                <span style={styles.quickIcon}>🎮</span>
                <div>
                  <strong>Ігри</strong>
                  <p>Переглянути ігри, для яких є моди</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section style={styles.contentGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Категорії модів</h2>
                <p style={styles.panelSubtitle}>
                  Основні типи модифікацій у системі
                </p>
              </div>
            </div>

            {categories.length === 0 ? (
              <p style={styles.emptyText}>
                Категорії ще не додані. Пізніше тут будуть графіка, геймплей,
                зброя, карти, оптимізація та інші типи модів.
              </p>
            ) : (
              <div style={styles.categoryGrid}>
                {categories.slice(0, 8).map((category) => (
                  <Link
                    to={`/mods?category=${category._id}`}
                    key={category._id}
                    style={styles.categoryPill}
                  >
                    <span>{category.icon || "🏷"}</span>
                    <span>{category.nameUa || category.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Останні моди</h2>
                <p style={styles.panelSubtitle}>
                  Нові або нещодавно додані модифікації
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
                    <span>
                      🧩 {mod.titleUa || mod.title}
                    </span>

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
            <p style={styles.eyebrow}>AI Агент</p>
            <h2 style={styles.aiTitle}>
              Не знаєш, який мод встановити?
            </h2>
            <p style={styles.aiText}>
              Напиши щось типу: “порадь графічні моди для слабкого ПК”,
              “дай моди для Skyrim на геймплей” або “що встановити для
              покращення FPS”.
            </p>
          </div>

          <Link to="/chat" style={styles.aiButton}>
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
      <span style={styles.statIcon}>{icon}</span>
      <p style={styles.statLabel}>{label}</p>
      <h2 style={styles.statValue}>{value}</h2>
    </div>
  );
}

const styles = {
  body: {
    background: "#0b0f19",
    minHeight: "100vh",
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

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#e5e7eb",
  },

  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#1f2937",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  logoutBtn: {
    padding: "8px 16px",
    background: "rgba(248, 250, 252, 0.06)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    color: "#f9fafb",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
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
    gridTemplateColumns: "1fr 330px",
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
    maxWidth: "680px",
    color: "#cbd5e1",
    fontSize: "16px",
    lineHeight: "1.7",
  },

  heroActions: {
    display: "flex",
    gap: "12px",
    marginTop: "26px",
    flexWrap: "wrap",
  },

  primaryButton: {
    background: "#7c3aed",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "14px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    boxShadow: "0 14px 30px rgba(124, 58, 237, 0.28)",
  },

  secondaryButton: {
    background: "rgba(248, 250, 252, 0.08)",
    color: "#f9fafb",
    padding: "12px 18px",
    borderRadius: "14px",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
  },

  heroCard: {
    background: "rgba(15, 23, 42, 0.82)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "22px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  aiBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    alignSelf: "flex-start",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    color: "#e5e7eb",
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "18px",
  },

  aiDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },

  heroIcon: {
    fontSize: "42px",
    marginBottom: "14px",
  },

  heroCardTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "850",
  },

  heroCardText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: "1.65",
  },

  errorMessage: {
    color: "#fecaca",
    background: "rgba(127, 29, 29, 0.4)",
    border: "1px solid rgba(248, 113, 113, 0.32)",
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "20px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  statCard: {
    background: "#111827",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.16)",
  },

  statIcon: {
    fontSize: "25px",
  },

  statLabel: {
    margin: "12px 0 6px 0",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "650",
  },

  statValue: {
    margin: 0,
    fontSize: "32px",
    letterSpacing: "-0.05em",
    fontWeight: "900",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
    marginBottom: "24px",
  },

  panel: {
    background: "#111827",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "22px",
    padding: "22px",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.16)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: "900",
    letterSpacing: "-0.04em",
  },

  panelSubtitle: {
    margin: "6px 0 0 0",
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  panelLink: {
    color: "#a78bfa",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  modList: {
    display: "grid",
    gap: "12px",
  },

  modItem: {
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    borderRadius: "16px",
    padding: "12px",
    display: "flex",
    gap: "12px",
    color: "#f9fafb",
    textDecoration: "none",
  },

  modCover: {
    width: "62px",
    height: "62px",
    flex: "0 0 62px",
    borderRadius: "14px",
    background: "#1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    fontSize: "25px",
  },

  modCoverImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  modInfo: {
    minWidth: 0,
  },

  modTitle: {
    margin: "0 0 5px 0",
    fontSize: "15px",
    fontWeight: "850",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  modMeta: {
    margin: "0 0 8px 0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  modStats: {
    display: "flex",
    gap: "10px",
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "700",
    flexWrap: "wrap",
  },

  quickActions: {
    display: "grid",
    gap: "12px",
  },

  quickAction: {
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    borderRadius: "16px",
    padding: "14px",
    color: "#f9fafb",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  quickIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "rgba(124, 58, 237, 0.18)",
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

  categoryPill: {
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "999px",
    padding: "10px 13px",
    color: "#e5e7eb",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "750",
  },

  activityList: {
    display: "grid",
    gap: "10px",
  },

  activityItem: {
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    borderRadius: "14px",
    padding: "13px 14px",
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    color: "#f9fafb",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "700",
  },

  activityStatus: {
    color: "#94a3b8",
    fontWeight: "750",
    whiteSpace: "nowrap",
  },

  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
    lineHeight: "1.6",
  },

  aiPanel: {
    background:
      "radial-gradient(circle at top left, rgba(124, 58, 237, 0.28), transparent 34%), #111827",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "24px",
    padding: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.16)",
  },

  aiTitle: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: "900",
    letterSpacing: "-0.05em",
  },

  aiText: {
    margin: 0,
    maxWidth: "720px",
    color: "#cbd5e1",
    lineHeight: "1.65",
  },

  aiButton: {
    background: "#7c3aed",
    color: "#ffffff",
    padding: "13px 18px",
    borderRadius: "14px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "850",
    whiteSpace: "nowrap",
  },
};