// client/src/pages/Mods.jsx
import React, { useEffect, useState } from "react";
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
  colors,
} from "../styles/theme";

export default function Mods() {
  const [mods, setMods] = useState([]);
  const [modStatuses, setModStatuses] = useState({});
  const [userMods, setUserMods] = useState([]);

  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [game, setGame] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("popular");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMods, setTotalMods] = useState(0);

  const [activeSection, setActiveSection] = useState("Усі");
  const [chatOpen, setChatOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sections = ["Усі", "Сподобалось", "Збережено", "Нецікаво"];

  const logout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const fetchInitialData = async () => {
    try {
      const [gamesRes, categoriesRes] = await Promise.all([
        fetch("/api/games"),
        fetch("/api/categories"),
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
      console.error("Initial data error:", err);
    }
  };

  const fetchMods = async (
    page = currentPage,
    searchQuery = search,
    gameQuery = game,
    categoryQuery = category,
    sortQuery = sort
  ) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        search: searchQuery,
        game: gameQuery,
        category: categoryQuery,
        sort: sortQuery,
      });

      const res = await fetch(`/api/mods?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Помилка при завантаженні модів");
      }

      const data = await res.json();

      setMods(data.mods || []);
      setCurrentPage(data.currentPage || page);
      setTotalPages(data.totalPages || 1);
      setTotalMods(data.totalMods || 0);
    } catch (err) {
      console.error(err);
      setError("Не вдалося завантажити моди");
    } finally {
      setLoading(false);
    }
  };

  const fetchModStatuses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/user-mods", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      const map = {};
      const userModsList = [];

      data.statuses.forEach((status) => {
        const mod = status.mod;

        if (!mod || !mod._id) return;

        map[mod._id] = {
          liked: status.liked,
          list: status.list,
        };

        userModsList.push({
          ...mod,
          userStatus: {
            liked: status.liked,
            list: status.list,
          },
        });
      });

      setModStatuses(map);
      setUserMods(userModsList);
    } catch (err) {
      console.error("Помилка завантаження статусів модів:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
    fetchMods(currentPage, search, game, category, sort);
    fetchModStatuses();
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMods(1, search, game, category, sort);
  };

  const handleGameChange = (e) => {
    const selectedGame = e.target.value;

    setGame(selectedGame);
    setActiveSection("Усі");
    setCurrentPage(1);
    fetchMods(1, search, selectedGame, category, sort);
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;

    setCategory(selectedCategory);
    setActiveSection("Усі");
    setCurrentPage(1);
    fetchMods(1, search, game, selectedCategory, sort);
  };

  const handleSortChange = (e) => {
    const selectedSort = e.target.value;

    setSort(selectedSort);
    setCurrentPage(1);
    fetchMods(1, search, game, category, selectedSort);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setCurrentPage(1);

    if (section === "Усі") {
      fetchMods(1, search, game, category, sort);
    } else {
      fetchMods(1, search, "", "", sort);
    }
  };

  const updateModStatus = async (modId, data) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/user-mods/${modId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Не вдалося оновити статус мода");
      }

      const result = await res.json();

      setModStatuses((prev) => ({
        ...prev,
        [modId]: {
          liked: result.status.liked,
          list: result.status.list,
        },
      }));

      if (typeof data.liked === "boolean") {
        setMods((prev) =>
          prev.map((mod) => {
            if (mod._id !== modId) return mod;

            const oldLiked = !!modStatuses[modId]?.liked;
            const newLiked = !!result.status.liked;

            if (oldLiked === newLiked) return mod;

            return {
              ...mod,
              likesCount: Math.max(
                0,
                Number(mod.likesCount || 0) + (newLiked ? 1 : -1)
              ),
            };
          })
        );
      }

      fetchModStatuses();
    } catch (err) {
      console.error(err);
      setError("Не вдалося оновити статус мода");
    }
  };

  const handleLike = (modId) => {
    const isLiked = !!modStatuses[modId]?.liked;

    updateModStatus(modId, {
      liked: !isLiked,
    });
  };

  const handleListChange = (modId, value) => {
    updateModStatus(modId, {
      list: value,
    });
  };

  const resetFilters = () => {
    setSearch("");
    setGame("");
    setCategory("");
    setSort("popular");
    setActiveSection("Усі");
    setCurrentPage(1);
    fetchMods(1, "", "", "", "popular");
  };

  const sourceMods = activeSection === "Усі" ? mods : userMods;

  const filteredMods = sourceMods.filter((mod) => {
    const status = modStatuses[mod._id];

    if (activeSection === "Усі") return true;
    if (activeSection === "Сподобалось") return status?.liked;

    return status?.list === activeSection;
  });

  const counts = {
    liked: Object.values(modStatuses).filter((status) => status.liked).length,
    saved: Object.values(modStatuses).filter(
      (status) => status.list === "Збережено"
    ).length,
    ignored: Object.values(modStatuses).filter(
      (status) => status.list === "Нецікаво"
    ).length,
  };

  const renderPagination = () => {
    if (activeSection !== "Усі") return null;

    const buttons = [];

    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          disabled={i === currentPage}
          style={
            i === currentPage
              ? styles.paginationButtonActive
              : styles.paginationButton
          }
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div style={layout.page}>
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

          <Link to="/mods/create" style={styles.navCreateButton}>
            + Додати мод
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
            <div style={badges.badge}>🧩 Каталог модифікацій</div>

            <h1 style={typography.h1}>Моди для відеоігор</h1>

            <p style={styles.heroText}>
              Позначайте моди, додавайте їх у списки та переглядайте власні
              добірки: сподобалось, збережено або нецікаво.
            </p>

            <div style={styles.heroActions}>
              <Link to="/mods/create" style={buttons.primary}>
                Додати мод
              </Link>

              <button
                type="button"
                onClick={() => setChatOpen(true)}
                style={buttons.secondary}
              >
                Запитати AI-агента
              </button>

              <Link to="/games" style={buttons.secondary}>
                Перейти до ігор
              </Link>
            </div>
          </div>

          <div style={styles.heroStats}>
            <div style={styles.heroStatCard}>
              <div style={styles.heroStatIcon}>🧩</div>
              <strong>{totalMods}</strong>
              <p>модів у каталозі</p>
            </div>

            <div style={styles.heroStatCard}>
              <div style={styles.heroStatIcon}>❤️</div>
              <strong>{counts.liked}</strong>
              <p>сподобалось</p>
            </div>

            <div style={styles.heroStatCard}>
              <div style={styles.heroStatIcon}>🔖</div>
              <strong>{counts.saved}</strong>
              <p>збережено</p>
            </div>
          </div>
        </section>

        <section style={styles.filtersPanel}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>🔎</span>

              <input
                type="text"
                placeholder="Пошук мода, тегу, опису або версії..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <button type="submit" style={buttons.primary}>
              Знайти
            </button>
          </form>

          <div style={styles.filtersRow}>
            <select
              value={game}
              onChange={handleGameChange}
              style={forms.select}
              disabled={activeSection !== "Усі"}
            >
              <option value="">Усі ігри</option>

              {games.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.titleUa || item.title}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={handleCategoryChange}
              style={forms.select}
              disabled={activeSection !== "Усі"}
            >
              <option value="">Усі категорії</option>

              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.icon ? `${item.icon} ` : ""}
                  {item.nameUa || item.name}
                </option>
              ))}
            </select>

            <select value={sort} onChange={handleSortChange} style={forms.select}>
              <option value="popular">Популярні</option>
              <option value="new">Нові</option>
              <option value="downloads">За завантаженнями</option>
              <option value="rating">За рейтингом</option>
            </select>

            <button type="button" onClick={resetFilters} style={buttons.secondary}>
              Скинути
            </button>
          </div>
        </section>

        <section style={styles.sections}>
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => handleSectionChange(section)}
              style={
                activeSection === section
                  ? styles.sectionButtonActive
                  : styles.sectionButton
              }
            >
              {section}
              {section === "Сподобалось" && (
                <span style={styles.counter}>{counts.liked}</span>
              )}
              {section === "Збережено" && (
                <span style={styles.counter}>{counts.saved}</span>
              )}
              {section === "Нецікаво" && (
                <span style={styles.counter}>{counts.ignored}</span>
              )}
            </button>
          ))}
        </section>

        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.loadingIcon}>🧩</div>
            <p>Завантаження модів...</p>
          </div>
        )}

        {error && <div style={styles.errorMessage}>{error}</div>}

        {!loading && filteredMods.length === 0 && (
          <div style={styles.emptyBox}>
            <h2>У цьому розділі модів немає</h2>

            <p>
              Додайте моди до списків за допомогою кнопки серця або випадаючого
              списку на картках.
            </p>
          </div>
        )}

        {!loading && filteredMods.length > 0 && (
          <section style={styles.grid}>
            {filteredMods.map((mod) => {
              const status = modStatuses[mod._id] || {};
              const isLiked = !!status.liked;
              const currentList = status.list || "";

              return (
                <article key={mod._id} style={styles.card}>
                  <Link to={`/mods/${mod._id}`} style={styles.coverLink}>
                    <div style={styles.coverBox}>
                      <FallbackImage
                        src={mod.coverImage}
                        alt={mod.titleUa || mod.title}
                        title={mod.titleUa || mod.title}
                        type="mod"
                      />

                      <span style={styles.ratingBadge}>
                        ⭐ {mod.averageRating || 0}
                      </span>
                    </div>
                  </Link>

                  <div style={styles.cardContent}>
                    <div style={styles.cardTop}>
                      <div style={styles.titleBlock}>
                        <Link to={`/mods/${mod._id}`} style={styles.titleLink}>
                          <h3 style={styles.cardTitle}>
                            {mod.titleUa || mod.title}
                          </h3>
                        </Link>

                        <p style={styles.originalTitle}>{mod.title}</p>
                      </div>

                      <button
                        type="button"
                        style={{
                          ...styles.likeButton,
                          ...(isLiked ? styles.likeButtonActive : {}),
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLike(mod._id);
                        }}
                        title="Сподобалось"
                      >
                        {isLiked ? "❤️" : "🤍"}
                      </button>
                    </div>

                    <p style={styles.game}>
                      🎮{" "}
                      {mod.game?.titleUa ||
                        mod.game?.title ||
                        "Гра не вказана"}
                    </p>

                    <p style={styles.description}>
                      {mod.shortDescription ||
                        mod.description ||
                        "Опис мода поки не додано."}
                    </p>

                    <div style={styles.metaGrid}>
                      <div style={styles.infoBox}>
                        <span style={styles.metaLabel}>Версія мода</span>
                        <strong style={styles.metaValue}>
                          {mod.version || "1.0.0"}
                        </strong>
                      </div>

                      <div style={styles.infoBox}>
                        <span style={styles.metaLabel}>Версія гри</span>
                        <strong style={styles.metaValue}>
                          {mod.gameVersion || "Не вказано"}
                        </strong>
                      </div>
                    </div>

                    <div style={styles.statusBlock}>
                      <label style={styles.label}>Список користувача</label>

                      <select
                        value={currentList}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleListChange(mod._id, e.target.value);
                        }}
                        style={styles.select}
                      >
                        <option value="">Без списку</option>
                        <option value="Збережено">Збережено</option>
                        <option value="Нецікаво">Нецікаво</option>
                      </select>
                    </div>

                    <div style={styles.cardFooter}>
                      <div style={styles.stats}>
                        <span>⬇️ {mod.downloadCount || 0}</span>
                        <span>❤️ {mod.likesCount || 0}</span>
                        <span>👁️ {mod.viewCount || 0}</span>
                      </div>

                      <Link to={`/mods/${mod._id}`} style={styles.detailsButton}>
                        Детальніше
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {totalPages > 1 && activeSection === "Усі" && (
          <div style={styles.paginationContainer}>{renderPagination()}</div>
        )}
      </main>

      {chatOpen && (
        <div style={styles.chatPopup}>
          <div style={styles.chatPopupHeader}>
            <div>
              <h3 style={styles.chatPopupTitle}>AI Агент</h3>
              <p style={styles.chatPopupSubtitle}>
                Порадить моди за грою, жанром або стилем
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

const styles = {
  navCreateButton: {
    color: colors.white,
    background: colors.primary,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    padding: "8px 13px",
    borderRadius: "999px",
    boxShadow: "0 8px 18px rgba(21, 128, 61, 0.2)",
  },

  hero: {
    ...cards.hero,
    display: "grid",
    gridTemplateColumns: "1fr 310px",
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
    padding: "18px",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  heroStatIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    background: colors.softBg2,
    color: colors.primaryText,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    marginBottom: "10px",
  },

  filtersPanel: {
    ...cards.panelSmall,
    marginBottom: "16px",
  },

  searchForm: {
    display: "grid",
    gridTemplateColumns: "1fr 120px",
    gap: "12px",
    marginBottom: "12px",
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

  filtersRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 220px 130px",
    gap: "12px",
  },

  sections: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  sectionButton: {
    padding: "9px 15px",
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    color: colors.primaryText,
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "800",
  },

  sectionButtonActive: {
    padding: "9px 15px",
    background: colors.primary,
    border: `1px solid ${colors.primary}`,
    color: colors.white,
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "850",
    boxShadow: "0 10px 20px rgba(21, 128, 61, 0.18)",
  },

  counter: {
    marginLeft: "6px",
    opacity: 0.9,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "18px",
  },

  card: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
    display: "flex",
    flexDirection: "column",
  },

  coverLink: {
    textDecoration: "none",
  },

  coverBox: {
    height: "195px",
    position: "relative",
    background: colors.softBg2,
    overflow: "hidden",
  },

  ratingBadge: {
    position: "absolute",
    top: "14px",
    right: "14px",
    background: "rgba(255, 255, 255, 0.92)",
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "12px",
    fontWeight: "850",
  },

  cardContent: {
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "10px",
  },

  titleBlock: {
    flex: 1,
    minWidth: 0,
  },

  titleLink: {
    textDecoration: "none",
    color: colors.textDark,
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: "900",
    color: colors.textDark,
    margin: 0,
    lineHeight: "1.25",
    letterSpacing: "-0.04em",
  },

  originalTitle: {
    margin: "5px 0 0 0",
    color: colors.textMuted,
    fontSize: "13px",
    fontWeight: "650",
  },

  likeButton: {
    width: "40px",
    height: "40px",
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "18px",
    flexShrink: 0,
  },

  likeButtonActive: {
    background: "#fff1f2",
    border: "1px solid #fda4af",
  },

  game: {
    color: colors.primaryText,
    fontSize: "13px",
    fontWeight: "800",
    margin: "0 0 10px 0",
  },

  description: {
    color: colors.textMuted,
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 14px 0",
    minHeight: "70px",
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "14px",
  },

  infoBox: {
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "11px 12px",
    minWidth: 0,
  },

  metaLabel: {
    display: "block",
    color: colors.textMuted,
    fontSize: "12px",
    marginBottom: "4px",
    fontWeight: "650",
  },

  metaValue: {
    display: "block",
    color: colors.textDark,
    fontSize: "13px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  statusBlock: {
    marginTop: "auto",
    marginBottom: "14px",
  },

  label: {
    display: "block",
    color: colors.textMuted,
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "6px",
  },

  select: {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${colors.border}`,
    borderRadius: "14px",
    background: colors.cardBg,
    color: colors.textDark,
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
    color: colors.primaryText,
    fontSize: "12px",
    fontWeight: "750",
  },

  detailsButton: {
    background: colors.primary,
    color: colors.white,
    borderRadius: "12px",
    padding: "9px 12px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "850",
    whiteSpace: "nowrap",
  },

  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "34px",
  },

  paginationButton: {
    minWidth: "36px",
    padding: "9px 12px",
    border: `1px solid ${colors.border}`,
    background: colors.cardBg,
    color: colors.primaryText,
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "750",
  },

  paginationButtonActive: {
    minWidth: "36px",
    padding: "9px 12px",
    background: colors.primary,
    color: colors.white,
    border: `1px solid ${colors.primary}`,
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "850",
    cursor: "default",
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