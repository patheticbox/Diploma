// client/src/pages/ModDetails.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FallbackImage from "../components/FallbackImage";
import {
  layout,
  header,
  cards,
  typography,
  buttons,
  badges,
  colors,
} from "../styles/theme";

export default function ModDetails() {
  const { id } = useParams();

  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchMod();
  }, [id]);

  const fetchMod = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/mods/${id}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Не вдалося завантажити мод");
      }

      setMod(data.mod || data);
    } catch (err) {
      console.error("Mod details error:", err);
      setError(err.message || "Не вдалося завантажити мод");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={layout.page}>
        <PageHeader logout={logout} />

        <main style={layout.wrapper}>
          <div style={styles.loadingBox}>
            <div style={styles.loadingIcon}>🧩</div>
            <p>Завантаження мода...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !mod) {
    return (
      <div style={layout.page}>
        <PageHeader logout={logout} />

        <main style={layout.wrapper}>
          <div style={styles.emptyBox}>
            <h2>Мод не знайдено</h2>
            <p>{error || "Такого мода немає в базі даних."}</p>

            <Link to="/mods" style={buttons.primary}>
              Назад до модів
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const gameName = mod.game?.titleUa || mod.game?.title || "Гра не вказана";

  const categories =
    mod.categories && mod.categories.length
      ? mod.categories.map((category) => category.nameUa || category.name)
      : [];

  const screenshots = Array.isArray(mod.screenshots)
    ? mod.screenshots.filter((item) => item?.url)
    : [];

  return (
    <div style={layout.page}>
      <PageHeader logout={logout} />

      <main style={layout.wrapper}>
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <Link to="/mods" style={styles.backLink}>
              ← Назад до каталогу
            </Link>

            <div style={styles.badgeRow}>
              <span style={badges.badge}>🧩 Деталі мода</span>

              {mod.isFeatured && (
                <span style={styles.featuredBadge}>Featured</span>
              )}
            </div>

            <h1 style={styles.title}>{mod.titleUa || mod.title}</h1>

            <p style={styles.originalTitle}>{mod.title}</p>

            <p style={styles.description}>
              {mod.description ||
                mod.shortDescription ||
                "Опис мода поки не додано."}
            </p>

            <div style={styles.heroActions}>
              {mod.modFile?.url ? (
                <a href={mod.modFile.url} style={buttons.primary} download>
                  Завантажити мод
                </a>
              ) : (
                <button style={{ ...buttons.primary, ...buttons.disabled }}>
                  Файл недоступний
                </button>
              )}

              <Link
                to={`/chat?game=${encodeURIComponent(gameName)}`}
                style={buttons.secondary}
              >
                Запитати AI про цей мод
              </Link>
            </div>
          </div>

          <div style={styles.coverBox}>
            <FallbackImage
              src={mod.coverImage}
              alt={mod.titleUa || mod.title}
              title={mod.titleUa || mod.title}
              type="mod"
            />
          </div>
        </section>

        <section style={styles.statsGrid}>
          <InfoCard label="Гра" value={gameName} icon="🎮" />

          <InfoCard
            label="Версія мода"
            value={mod.version || "1.0.0"}
            icon="🧩"
          />

          <InfoCard
            label="Версія гри"
            value={mod.gameVersion || "Не вказано"}
            icon="🕹️"
          />

          <InfoCard
            label="Рейтинг"
            value={`⭐ ${mod.averageRating || 0}`}
            icon="⭐"
          />

          <InfoCard
            label="Завантажень"
            value={mod.downloadCount || 0}
            icon="⬇️"
          />

          <InfoCard label="Лайків" value={mod.likesCount || 0} icon="❤️" />
        </section>

        <section style={styles.contentGrid}>
          <div style={cards.panel}>
            <h2 style={typography.h2}>Опис</h2>

            <p style={styles.textBlock}>
              {mod.description ||
                mod.shortDescription ||
                "Детальний опис для цього мода ще не додано."}
            </p>

            <h2 style={styles.sectionTitle}>Категорії</h2>

            {categories.length > 0 ? (
              <div style={styles.tagsList}>
                {categories.map((category) => (
                  <span key={category} style={badges.pill}>
                    🏷️ {category}
                  </span>
                ))}
              </div>
            ) : (
              <p style={styles.mutedText}>Категорії не вказані.</p>
            )}

            <h2 style={styles.sectionTitle}>Теги</h2>

            {mod.tags?.length > 0 ? (
              <div style={styles.tagsList}>
                {mod.tags.map((tag) => (
                  <span key={tag} style={badges.pill}>
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p style={styles.mutedText}>Теги не вказані.</p>
            )}
          </div>

          <aside style={cards.panel}>
            <h2 style={typography.h2}>Інформація</h2>

            <div style={styles.sideList}>
              <SideRow label="Мова" value={mod.language || "Не вказано"} />
              <SideRow label="Статус" value={mod.status || "published"} />
              <SideRow label="Переглядів" value={mod.viewCount || 0} />
              <SideRow label="Оцінок" value={mod.ratingsCount || 0} />
              <SideRow
                label="Файл"
                value={mod.modFile?.filename || "Не вказано"}
              />
              <SideRow
                label="Розмір"
                value={
                  mod.modFile?.size
                    ? `${(mod.modFile.size / 1024 / 1024).toFixed(1)} MB`
                    : "Не вказано"
                }
              />
            </div>
          </aside>
        </section>

        <section style={cards.panel}>
          <h2 style={typography.h2}>Інструкція встановлення</h2>

          <p style={styles.textBlock}>
            {mod.installationGuide ||
              "Інструкція встановлення для цього мода поки не додана."}
          </p>
        </section>

        {mod.requirements && (
          <section style={cards.panel}>
            <h2 style={typography.h2}>Вимоги</h2>
            <p style={styles.textBlock}>{mod.requirements}</p>
          </section>
        )}

        {mod.changelog && (
          <section style={cards.panel}>
            <h2 style={typography.h2}>Список змін</h2>
            <p style={styles.textBlock}>{mod.changelog}</p>
          </section>
        )}

        {screenshots.length > 0 && (
          <section style={cards.panel}>
            <h2 style={typography.h2}>Скріншоти</h2>

            <div style={styles.screenshotGrid}>
              {screenshots.map((screenshot, index) => (
                <div key={index} style={styles.screenshotCard}>
                  <div style={styles.screenshotImageBox}>
                    <FallbackImage
                      src={screenshot.url}
                      alt={screenshot.caption || `Скріншот ${index + 1}`}
                      title={screenshot.caption || `Скріншот ${index + 1}`}
                      type="mod"
                    />
                  </div>

                  {screenshot.caption && (
                    <p style={styles.screenshotCaption}>
                      {screenshot.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function PageHeader({ logout }) {
  return (
    <header style={header.header}>
      <Link to="/dashboard" style={header.logo}>
        <span style={header.logoIcon}>🧩</span>
        <span>ModVerse</span>
      </Link>

      <nav style={header.nav}>
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
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoIcon}>{icon}</div>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  );
}

function SideRow({ label, value }) {
  return (
    <div style={styles.sideRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = {
  hero: {
    ...cards.hero,
    display: "grid",
    gridTemplateColumns: "1fr 390px",
    gap: "28px",
    marginBottom: "22px",
  },

  heroContent: {
    minWidth: 0,
  },

  backLink: {
    display: "inline-block",
    color: colors.primaryText,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    marginBottom: "14px",
  },

  badgeRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "12px",
  },

  featuredBadge: {
    background: colors.primary,
    color: colors.white,
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: "850",
    boxShadow: "0 10px 20px rgba(21, 128, 61, 0.18)",
  },

  title: {
    margin: "0 0 6px 0",
    fontSize: "44px",
    lineHeight: "1.05",
    fontWeight: "950",
    letterSpacing: "-0.06em",
    color: colors.textDark,
  },

  originalTitle: {
    margin: "0 0 16px 0",
    color: colors.textMuted,
    fontSize: "15px",
    fontWeight: "700",
  },

  description: {
    margin: 0,
    color: colors.textMuted,
    fontSize: "16px",
    lineHeight: "1.75",
    maxWidth: "760px",
  },

  heroActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "24px",
  },

  coverBox: {
    minHeight: "310px",
    borderRadius: "24px",
    background: colors.softBg2,
    border: `1px solid ${colors.border}`,
    overflow: "hidden",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "14px",
    marginBottom: "22px",
  },

  infoCard: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  infoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    background: colors.softBg2,
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    marginBottom: "10px",
  },

  infoLabel: {
    display: "block",
    color: colors.textMuted,
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "4px",
  },

  infoValue: {
    display: "block",
    color: colors.textDark,
    fontSize: "18px",
    fontWeight: "900",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "18px",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: "24px 0 12px 0",
    fontSize: "20px",
    fontWeight: "900",
    color: colors.textDark,
  },

  textBlock: {
    margin: "14px 0 0 0",
    color: colors.textMuted,
    fontSize: "15px",
    lineHeight: "1.75",
    whiteSpace: "pre-wrap",
  },

  mutedText: {
    color: colors.textMuted,
    fontSize: "14px",
    margin: 0,
  },

  tagsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
  },

  sideList: {
    display: "grid",
    gap: "10px",
    marginTop: "16px",
  },

  sideRow: {
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "14px",
    padding: "11px 12px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: colors.textMuted,
    fontSize: "14px",
  },

  screenshotGrid: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },

  screenshotCard: {
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "18px",
    overflow: "hidden",
  },

  screenshotImageBox: {
    width: "100%",
    height: "180px",
    overflow: "hidden",
  },

  screenshotCaption: {
    margin: 0,
    padding: "10px 12px",
    color: colors.textMuted,
    fontSize: "13px",
    fontWeight: "650",
  },

  loadingBox: {
    ...cards.panel,
    padding: "44px",
    textAlign: "center",
    color: colors.textMuted,
    fontWeight: "800",
  },

  loadingIcon: {
    fontSize: "44px",
    marginBottom: "10px",
  },

  emptyBox: {
    ...cards.panel,
    padding: "44px",
    textAlign: "center",
    color: colors.textMuted,
  },
};