// client/src/pages/Login.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { colors, buttons } from "../styles/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setMessage("");

    const newErrors = {};

    if (!isValidEmail(email)) {
      newErrors.email = "Введіть коректний email";
    }

    if (password.length < 6) {
      newErrors.password = "Пароль повинен містити мінімум 6 символів";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Вхід успішний! Перенаправлення...");
        setMessageType("success");

        if (data.token) {
          localStorage.setItem("token", data.token);
          document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        }

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 900);
      } else {
        setMessage(data.message || "Помилка входу. Перевірте email та пароль");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Помилка з'єднання з сервером");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.backgroundPattern} />

      <main style={styles.shell}>
        <section style={styles.infoPanel}>
          <Link to="/login" style={styles.logo}>
            <span style={styles.logoIcon}>🧩</span>
            <span>ModVerse</span>
          </Link>

          <div style={styles.infoContent}>
            <div style={styles.badge}>Сервіс модифікацій для відеоігор</div>

            <h1 style={styles.heroTitle}>
              Знайдіть ідеальні моди для своїх улюблених ігор
            </h1>

            <p style={styles.heroText}>
              Увійдіть в акаунт, щоб користуватися каталогом модифікацій,
              переглядати ігри, зберігати вподобання та отримувати рекомендації
              від AI-агента.
            </p>

            <div style={styles.featureGrid}>
              <div style={styles.featureCard}>
                <span>🎮</span>
                <p>Каталог ігор</p>
              </div>

              <div style={styles.featureCard}>
                <span>🧩</span>
                <p>Модифікації</p>
              </div>

              <div style={styles.featureCard}>
                <span>🤖</span>
                <p>AI Агент</p>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.formPanel}>
          <div style={styles.formHeader}>
            <div style={styles.mobileLogo}>
              <span style={styles.logoIcon}>🧩</span>
              <span>ModVerse</span>
            </div>

            <h2 style={styles.title}>Вхід в акаунт</h2>

            <p style={styles.subtitle}>
              Введіть email та пароль, щоб продовжити роботу з сервісом.
            </p>
          </div>

          {message && (
            <div
              style={{
                ...styles.message,
                ...(messageType === "success"
                  ? styles.successMessage
                  : styles.errorMessage),
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  ...styles.input,
                  ...(errors.email ? styles.inputError : {}),
                }}
                placeholder="example@email.com"
                autoFocus
              />

              {errors.email && (
                <div style={styles.fieldError}>{errors.email}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Пароль</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  ...styles.input,
                  ...(errors.password ? styles.inputError : {}),
                }}
                placeholder="Введіть пароль"
              />

              {errors.password && (
                <div style={styles.fieldError}>{errors.password}</div>
              )}
            </div>

            <div style={styles.optionsRow}>
              <span style={styles.hint}>Мінімум 6 символів</span>

              <Link to="/forgot-password" style={styles.smallLink}>
                Забули пароль?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttons.primary,
                ...styles.submitButton,
                ...(loading ? styles.disabledButton : {}),
              }}
            >
              {loading ? "Вхід..." : "Увійти"}
            </button>
          </form>

          <div style={styles.footerText}>
            Немає акаунту?{" "}
            <Link to="/register" style={styles.registerLink}>
              Зареєструватися
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f0fdf4 0%, #ffffff 48%, #dcfce7 100%)",
    color: colors.text,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px",
    position: "relative",
    overflow: "hidden",
  },

  backgroundPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 15% 20%, rgba(21,128,61,0.11) 0, rgba(21,128,61,0.11) 2px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(21,128,61,0.08) 0, rgba(21,128,61,0.08) 3px, transparent 3px)",
    backgroundSize: "38px 38px, 52px 52px",
    opacity: 0.9,
  },

  shell: {
    width: "100%",
    maxWidth: "1040px",
    minHeight: "620px",
    display: "grid",
    gridTemplateColumns: "1.08fr 0.92fr",
    background: "rgba(255, 255, 255, 0.82)",
    border: `1px solid ${colors.border}`,
    borderRadius: "32px",
    overflow: "hidden",
    boxShadow: "0 28px 80px rgba(21, 128, 61, 0.16)",
    position: "relative",
    zIndex: 1,
    backdropFilter: "blur(18px)",
  },

  infoPanel: {
    padding: "34px",
    background:
      "linear-gradient(135deg, #ffffff 0%, #f0fdf4 45%, #bbf7d0 100%)",
    borderRight: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: colors.textDark,
    textDecoration: "none",
    fontSize: "22px",
    fontWeight: "900",
    letterSpacing: "-0.05em",
  },

  mobileLogo: {
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: colors.textDark,
    fontSize: "22px",
    fontWeight: "900",
    letterSpacing: "-0.05em",
    marginBottom: "22px",
  },

  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "14px",
    background: colors.primary,
    color: colors.white,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 28px rgba(21, 128, 61, 0.22)",
  },

  infoContent: {
    maxWidth: "520px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    background: colors.softBg2,
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    padding: "9px 13px",
    fontSize: "13px",
    fontWeight: "850",
    marginBottom: "18px",
  },

  heroTitle: {
    margin: "0 0 16px 0",
    color: colors.textDark,
    fontSize: "46px",
    lineHeight: "1.04",
    fontWeight: "950",
    letterSpacing: "-0.07em",
  },

  heroText: {
    margin: 0,
    color: colors.textMuted,
    fontSize: "16px",
    lineHeight: "1.75",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginTop: "34px",
  },

  featureCard: {
    background: "rgba(255,255,255,0.72)",
    border: `1px solid ${colors.border}`,
    borderRadius: "18px",
    padding: "16px",
    color: colors.primaryText,
    fontWeight: "850",
  },

  formPanel: {
    padding: "44px",
    background: colors.cardBg,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  formHeader: {
    marginBottom: "24px",
  },

  title: {
    margin: "0 0 8px 0",
    color: colors.textDark,
    fontSize: "32px",
    fontWeight: "950",
    letterSpacing: "-0.06em",
    textAlign: "left",
  },

  subtitle: {
    margin: 0,
    color: colors.textMuted,
    fontSize: "14px",
    lineHeight: "1.6",
  },

  form: {
    display: "grid",
    gap: "17px",
  },

  formGroup: {
    display: "grid",
    gap: "8px",
  },

  label: {
    color: colors.textDark,
    fontSize: "14px",
    fontWeight: "800",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: `1px solid ${colors.border}`,
    borderRadius: "14px",
    fontSize: "14px",
    color: colors.text,
    background: colors.white,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },

  inputError: {
    border: "1px solid #fecaca",
    background: "#fff7f7",
  },

  fieldError: {
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "700",
  },

  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginTop: "-4px",
  },

  hint: {
    color: colors.textMuted,
    fontSize: "12px",
    fontWeight: "650",
  },

  smallLink: {
    color: colors.primary,
    fontSize: "13px",
    fontWeight: "800",
    textDecoration: "none",
  },

  submitButton: {
    width: "100%",
    marginTop: "4px",
    minHeight: "48px",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  message: {
    padding: "12px 14px",
    borderRadius: "14px",
    marginBottom: "18px",
    fontSize: "14px",
    fontWeight: "750",
  },

  successMessage: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
  },

  errorMessage: {
    background: "#fee2e2",
    color: "#7f1d1d",
    border: "1px solid #fecaca",
  },

  footerText: {
    textAlign: "center",
    marginTop: "24px",
    color: colors.textMuted,
    fontSize: "14px",
    fontWeight: "650",
  },

  registerLink: {
    color: colors.primary,
    textDecoration: "none",
    fontWeight: "850",
  },
};