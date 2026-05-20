// client/src/pages/Chat.jsx
import { Link, useSearchParams } from "react-router-dom";
import AiChatBot from "../components/AiChatBox";
import {
  layout,
  header,
  cards,
  typography,
  buttons,
  badges,
  colors,
} from "../styles/theme";

export default function Chat() {
  const [searchParams] = useSearchParams();
  const gameFromUrl = searchParams.get("game");

  const logout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

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

      <main style={layout.narrowWrapper}>
        <section style={styles.hero}>
          <div>
            <div style={badges.badge}>🤖 AI Агент</div>

            <h1 style={typography.h1}>
              Розумний помічник для вибору модів
            </h1>

            <p style={styles.heroText}>
              Запитайте, які моди встановити для конкретної гри, як покращити
              графіку, підняти FPS, змінити геймплей або підібрати модифікації
              під ваш стиль гри.
            </p>

            {gameFromUrl && (
              <div style={styles.gameNotice}>
                <span>🎮</span>
                <p>
                  Обрана гра з попередньої сторінки:{" "}
                  <strong>{gameFromUrl}</strong>
                </p>
              </div>
            )}

            <div style={styles.heroActions}>
              <Link to="/mods" style={buttons.secondary}>
                Переглянути каталог
              </Link>

              <Link to="/games" style={buttons.secondary}>
                Обрати гру
              </Link>
            </div>
          </div>

          <div style={styles.heroCard}>
            <div style={styles.heroIcon}>🧠</div>

            <h3 style={styles.heroCardTitle}>Працює з базою модів</h3>

            <p style={styles.heroCardText}>
              Агент не вигадує випадкові моди, а підбирає варіанти з каталогу
              проєкту, враховуючи гру, категорії, теги, рейтинг і популярність.
            </p>
          </div>
        </section>

        <section style={styles.chatSection}>
          <AiChatBot
            compact={false}
            height="calc(100vh - 300px)"
            showSuggestions={false}
          />
        </section>
      </main>
    </div>
  );
}

const styles = {
  hero: {
    ...cards.hero,
    display: "grid",
    gridTemplateColumns: "1fr 300px",
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
    marginTop: "22px",
    flexWrap: "wrap",
  },

  gameNotice: {
    marginTop: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "12px 14px",
    color: colors.primaryText,
    fontSize: "14px",
    fontWeight: "650",
  },

  heroCard: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "24px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  heroIcon: {
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

  heroCardTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "850",
    color: colors.textDark,
  },

  heroCardText: {
    margin: 0,
    color: colors.textMuted,
    fontSize: "14px",
    lineHeight: "1.65",
  },

  chatSection: {
    width: "100%",
  },
};