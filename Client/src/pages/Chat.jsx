// client/src/pages/Chat.jsx
import { Link } from "react-router-dom";
import AiChatBox from "../components/AiChatBox";

export default function Chat() {
  const logout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

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

          <Link to="/games" style={styles.navLink}>
            🎮 Ігри
          </Link>

          <Link to="/mods" style={styles.navLink}>
            🧩 Моди
          </Link>

          <Link to="/chat" style={styles.navLinkActive}>
            🤖 AI Агент
          </Link>
        </nav>

        <button onClick={logout} style={styles.logoutBtn}>
          Вийти
        </button>
      </header>

      <main style={styles.wrapper}>
        <section style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>AI Агент</p>

            <h1 style={styles.heroTitle}>
              Розумний помічник для вибору модів
            </h1>

            <p style={styles.heroText}>
              Запитайте, які моди встановити для конкретної гри, як покращити
              графіку, підняти FPS, змінити геймплей або підібрати модифікації
              під ваш стиль гри.
            </p>
          </div>

          <div style={styles.heroCard}>
            <span style={styles.heroIcon}>🤖</span>
            <h3 style={styles.heroCardTitle}>Працює з базою модів</h3>
            <p style={styles.heroCardText}>
              Агент рекомендує тільки ті модифікації, які є у вашій базі даних.
            </p>
          </div>
        </section>

        <section style={styles.chatLayout}>
          <div style={styles.chatPanel}>
            <AiChatBox compact={false} height="calc(100vh - 280px)" />
          </div>

          <aside style={styles.sidePanel}>
            <div style={styles.infoCard}>
              <h2 style={styles.infoTitle}>Що можна запитати?</h2>

              <div style={styles.promptList}>
                <button style={styles.fakePrompt}>
                  Порадь графічні моди для Skyrim
                </button>

                <button style={styles.fakePrompt}>
                  Що встановити для слабкого ПК?
                </button>

                <button style={styles.fakePrompt}>
                  Дай моди для Minecraft на виживання
                </button>

                <button style={styles.fakePrompt}>
                  Порадь оптимізаційні моди
                </button>

                <button style={styles.fakePrompt}>
                  Які моди краще почати встановлювати?
                </button>
              </div>
            </div>

            <div style={styles.infoCard}>
              <h2 style={styles.infoTitle}>Типи рекомендацій</h2>

              <div style={styles.featureList}>
                <div style={styles.featureItem}>
                  <span>🎨</span>
                  <p>Графіка, текстури, шейдери</p>
                </div>

                <div style={styles.featureItem}>
                  <span>⚙️</span>
                  <p>Оптимізація та FPS</p>
                </div>

                <div style={styles.featureItem}>
                  <span>🎮</span>
                  <p>Геймплей і баланс</p>
                </div>

                <div style={styles.featureItem}>
                  <span>🧩</span>
                  <p>Підбір модів за грою</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
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
    padding: "28px 24px",
  },

  hero: {
    background:
      "radial-gradient(circle at top right, rgba(124, 58, 237, 0.32), transparent 36%), #111827",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "28px",
    padding: "28px",
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: "24px",
    marginBottom: "22px",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.22)",
  },

  eyebrow: {
    margin: "0 0 8px 0",
    color: "#a78bfa",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  heroTitle: {
    margin: "0 0 10px 0",
    fontSize: "38px",
    lineHeight: "1.08",
    fontWeight: "900",
    letterSpacing: "-0.06em",
  },

  heroText: {
    margin: 0,
    maxWidth: "740px",
    color: "#cbd5e1",
    fontSize: "15px",
    lineHeight: "1.7",
  },

  heroCard: {
    background: "rgba(15, 23, 42, 0.82)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "22px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  heroIcon: {
    fontSize: "38px",
    marginBottom: "12px",
  },

  heroCardTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "850",
  },

  heroCardText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  chatLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 330px",
    gap: "20px",
    alignItems: "stretch",
  },

  chatPanel: {
    minWidth: 0,
  },

  sidePanel: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  infoCard: {
    background: "#111827",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "22px",
    padding: "18px",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.16)",
  },

  infoTitle: {
    margin: "0 0 14px 0",
    fontSize: "18px",
    fontWeight: "900",
    letterSpacing: "-0.04em",
  },

  promptList: {
    display: "grid",
    gap: "10px",
  },

  fakePrompt: {
    textAlign: "left",
    background: "rgba(15, 23, 42, 0.9)",
    color: "#e5e7eb",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "14px",
    padding: "11px 12px",
    fontSize: "13px",
    fontWeight: "700",
  },

  featureList: {
    display: "grid",
    gap: "10px",
  },

  featureItem: {
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    borderRadius: "14px",
    padding: "11px 12px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "700",
  },
};