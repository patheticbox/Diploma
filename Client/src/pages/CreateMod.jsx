// client/src/pages/CreateMod.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  layout,
  header,
  cards,
  typography,
  buttons,
  forms,
  badges,
  colors,
} from "../styles/theme";

export default function CreateMod() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    titleUa: "",
    game: "",
    categories: [],
    version: "1.0.0",
    gameVersion: "",
    language: "Українська",
    shortDescription: "",
    description: "",
    tags: "",
    coverImage: "",
    screenshots: "",
    installationGuide: "",
    requirements: "",
    changelog: "",
    modFileUrl: "",
    modFileName: "",
    modFileSize: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState({});

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
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);

      const [gamesRes, categoriesRes] = await Promise.all([
        fetch("/api/games", { credentials: "include" }),
        fetch("/api/categories", { credentials: "include" }),
      ]);

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        setGames(gamesData.games || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }
    } catch (err) {
      console.error("Create mod initial data error:", err);
      setMessage("Не вдалося завантажити ігри або категорії");
      setMessageType("error");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setForm((prev) => {
      const exists = prev.categories.includes(categoryId);

      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((id) => id !== categoryId)
          : [...prev.categories, categoryId],
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Вкажіть назву мода";
    }

    if (!form.game) {
      newErrors.game = "Оберіть гру";
    }

    if (!form.description.trim()) {
      newErrors.description = "Додайте опис мода";
    }

    if (form.description.trim().length < 20) {
      newErrors.description = "Опис повинен містити хоча б 20 символів";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!validateForm()) return;

    const token = getToken();

    if (!token) {
      setMessage("Потрібно увійти в акаунт");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/mods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Не вдалося створити мод");
      }

      setMessage("Мод успішно створено!");
      setMessageType("success");

      setTimeout(() => {
        navigate(`/mods/${data.mod._id}`);
      }, 700);
    } catch (err) {
      console.error("Create mod error:", err);
      setMessage(err.message || "Помилка при створенні мода");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={layout.page}>
        <PageHeader logout={logout} />

        <main style={layout.wrapper}>
          <div style={styles.loadingBox}>🧩 Завантаження форми...</div>
        </main>
      </div>
    );
  }

  return (
    <div style={layout.page}>
      <PageHeader logout={logout} />

      <main style={layout.wrapper}>
        <section style={styles.hero}>
          <div>
            <Link to="/mods" style={styles.backLink}>
              ← Назад до каталогу
            </Link>

            <div style={badges.badge}>🧩 Публікація мода</div>

            <h1 style={typography.h1}>Додати нову модифікацію</h1>

            <p style={styles.heroText}>
              Заповніть основні метадані мода: назву, гру, категорії, опис,
              теги, версію, інструкцію встановлення та посилання на файл.
            </p>
          </div>

          <div style={styles.sideHeroCard}>
            <div style={styles.sideHeroIcon}>📦</div>
            <h3>Публікація в каталог</h3>
            <p>
              Після створення мод зʼявиться в загальному каталозі та буде
              доступний для пошуку й рекомендацій AI-агента.
            </p>
          </div>
        </section>

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

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <section style={cards.panel}>
            <h2 style={typography.h2}>Основна інформація</h2>

            <div style={styles.fieldGrid}>
              <Field label="Назва мода" error={errors.title}>
                <input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  style={{
                    ...forms.input,
                    ...(errors.title ? styles.inputError : {}),
                  }}
                  placeholder="Наприклад: Realistic Nature Pack"
                />
              </Field>

              <Field label="Українська назва">
                <input
                  value={form.titleUa}
                  onChange={(e) => handleChange("titleUa", e.target.value)}
                  style={forms.input}
                  placeholder="Наприклад: Реалістичний пакет природи"
                />
              </Field>

              <Field label="Гра" error={errors.game}>
                <select
                  value={form.game}
                  onChange={(e) => handleChange("game", e.target.value)}
                  style={{
                    ...forms.select,
                    width: "100%",
                    ...(errors.game ? styles.inputError : {}),
                  }}
                >
                  <option value="">Оберіть гру</option>
                  {games.map((game) => (
                    <option key={game._id} value={game._id}>
                      {game.titleUa || game.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Мова">
                <select
                  value={form.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                  style={{ ...forms.select, width: "100%" }}
                >
                  <option value="Українська">Українська</option>
                  <option value="English">English</option>
                  <option value="Multilingual">Multilingual</option>
                  <option value="Без тексту">Без тексту</option>
                </select>
              </Field>

              <Field label="Версія мода">
                <input
                  value={form.version}
                  onChange={(e) => handleChange("version", e.target.value)}
                  style={forms.input}
                  placeholder="1.0.0"
                />
              </Field>

              <Field label="Версія гри">
                <input
                  value={form.gameVersion}
                  onChange={(e) =>
                    handleChange("gameVersion", e.target.value)
                  }
                  style={forms.input}
                  placeholder="Наприклад: 1.20.1"
                />
              </Field>
            </div>

            <h2 style={styles.sectionTitle}>Категорії</h2>

            <div style={styles.categoryGrid}>
              {categories.length === 0 ? (
                <p style={styles.mutedText}>Категорії ще не додані.</p>
              ) : (
                categories.map((category) => {
                  const active = form.categories.includes(category._id);

                  return (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => handleCategoryToggle(category._id)}
                      style={{
                        ...styles.categoryButton,
                        ...(active ? styles.categoryButtonActive : {}),
                      }}
                    >
                      <span>{category.icon || "🏷️"}</span>
                      <span>{category.nameUa || category.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section style={cards.panel}>
            <h2 style={typography.h2}>Опис і метадані</h2>

            <Field label="Короткий опис">
              <textarea
                value={form.shortDescription}
                onChange={(e) =>
                  handleChange("shortDescription", e.target.value)
                }
                style={styles.textareaSmall}
                placeholder="Короткий опис для картки мода..."
              />
            </Field>

            <Field label="Повний опис" error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                style={{
                  ...styles.textarea,
                  ...(errors.description ? styles.inputError : {}),
                }}
                placeholder="Опишіть, що змінює мод, для чого він потрібен, які має особливості..."
              />
            </Field>

            <Field label="Теги">
              <input
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                style={forms.input}
                placeholder="graphics, survival, fps, realism"
              />
            </Field>

            <Field label="Інструкція встановлення">
              <textarea
                value={form.installationGuide}
                onChange={(e) =>
                  handleChange("installationGuide", e.target.value)
                }
                style={styles.textareaSmall}
                placeholder="Наприклад: Завантажте архів, розпакуйте в папку Mods..."
              />
            </Field>
          </section>

          <section style={cards.panel}>
            <h2 style={typography.h2}>Файли та зображення</h2>

            <Field label="URL головного зображення">
              <input
                value={form.coverImage}
                onChange={(e) => handleChange("coverImage", e.target.value)}
                style={forms.input}
                placeholder="/uploads/images/mod-cover.jpg або https://..."
              />
            </Field>

            <Field label="Скріншоти">
              <textarea
                value={form.screenshots}
                onChange={(e) => handleChange("screenshots", e.target.value)}
                style={styles.textareaSmall}
                placeholder={"Кожен URL з нового рядка:\n/uploads/images/1.jpg\n/uploads/images/2.jpg"}
              />
            </Field>

            <Field label="URL файлу мода">
              <input
                value={form.modFileUrl}
                onChange={(e) => handleChange("modFileUrl", e.target.value)}
                style={forms.input}
                placeholder="/uploads/mods/mod-file.zip"
              />
            </Field>

            <div style={styles.fieldGrid}>
              <Field label="Назва файлу">
                <input
                  value={form.modFileName}
                  onChange={(e) =>
                    handleChange("modFileName", e.target.value)
                  }
                  style={forms.input}
                  placeholder="mod-file.zip"
                />
              </Field>

              <Field label="Розмір файлу, байти">
                <input
                  value={form.modFileSize}
                  onChange={(e) =>
                    handleChange("modFileSize", e.target.value)
                  }
                  style={forms.input}
                  placeholder="52428800"
                />
              </Field>
            </div>
          </section>

          <section style={cards.panel}>
            <h2 style={typography.h2}>Додаткова інформація</h2>

            <Field label="Вимоги">
              <textarea
                value={form.requirements}
                onChange={(e) => handleChange("requirements", e.target.value)}
                style={styles.textareaSmall}
                placeholder="Наприклад: Forge, Fabric, Script Extender..."
              />
            </Field>

            <Field label="Список змін">
              <textarea
                value={form.changelog}
                onChange={(e) => handleChange("changelog", e.target.value)}
                style={styles.textareaSmall}
                placeholder="Наприклад: v1.0.0 — перша версія мода..."
              />
            </Field>
          </section>

          <section style={styles.submitPanel}>
            <div>
              <h2 style={styles.submitTitle}>Готово до публікації?</h2>
              <p style={styles.submitText}>
                Перевірте дані та натисніть кнопку, щоб додати мод у каталог.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttons.primary,
                ...(loading ? buttons.disabled : {}),
              }}
            >
              {loading ? "Публікація..." : "Опублікувати мод"}
            </button>
          </section>
        </form>
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
  );
}

function Field({ label, error, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <div style={styles.fieldError}>{error}</div>}
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
    maxWidth: "780px",
  },

  backLink: {
    display: "inline-block",
    color: colors.primaryText,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    marginBottom: "14px",
  },

  sideHeroCard: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  sideHeroIcon: {
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

  formGrid: {
    display: "grid",
    gap: "18px",
  },

  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginTop: "18px",
  },

  field: {
    display: "grid",
    gap: "8px",
    marginTop: "16px",
  },

  label: {
    color: colors.textDark,
    fontSize: "14px",
    fontWeight: "800",
  },

  textarea: {
    ...forms.input,
    minHeight: "150px",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "1.6",
  },

  textareaSmall: {
    ...forms.input,
    minHeight: "95px",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "1.6",
  },

  inputError: {
    border: "1px solid #fecaca",
    background: "#fff7f7",
  },

  fieldError: {
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "750",
  },

  sectionTitle: {
    margin: "24px 0 12px 0",
    fontSize: "20px",
    fontWeight: "900",
    color: colors.textDark,
  },

  categoryGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  categoryButton: {
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    color: colors.primaryText,
    borderRadius: "999px",
    padding: "10px 13px",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },

  categoryButtonActive: {
    background: colors.primary,
    color: colors.white,
    border: `1px solid ${colors.primary}`,
    boxShadow: "0 10px 20px rgba(21, 128, 61, 0.2)",
  },

  mutedText: {
    color: colors.textMuted,
    fontSize: "14px",
    margin: 0,
  },

  message: {
    padding: "13px 15px",
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

  submitPanel: {
    background: "linear-gradient(135deg, #ffffff 0%, #dcfce7 100%)",
    border: `1px solid ${colors.border}`,
    borderRadius: "26px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  submitTitle: {
    margin: "0 0 6px 0",
    color: colors.textDark,
    fontSize: "24px",
    fontWeight: "900",
    letterSpacing: "-0.05em",
  },

  submitText: {
    margin: 0,
    color: colors.textMuted,
    fontSize: "14px",
    lineHeight: "1.6",
  },

  loadingBox: {
    ...cards.panel,
    padding: "44px",
    textAlign: "center",
    color: colors.textMuted,
    fontWeight: "850",
  },
};