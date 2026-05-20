// client/src/styles/theme.js

export const colors = {
  pageBg: "#f0fdf4",
  cardBg: "#ffffff",
  softBg: "#ecfdf5",
  softBg2: "#dcfce7",

  border: "#bbf7d0",
  borderSoft: "#d9f99d",

  primary: "#15803d",
  primaryDark: "#052e16",
  primaryText: "#166534",
  text: "#102016",
  textDark: "#052e16",
  textMuted: "#3f6f50",

  white: "#ffffff",
  danger: "#dc2626",
  warning: "#f59e0b",
  success: "#16a34a",
};

export const layout = {
  page: {
    minHeight: "100vh",
    background: colors.pageBg,
    color: colors.text,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  wrapper: {
    width: "100%",
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "32px 24px",
  },

  narrowWrapper: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 24px",
  },
};

export const header = {
  header: {
    background: "rgba(255, 255, 255, 0.92)",
    color: colors.text,
    padding: "14px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${colors.border}`,
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(14px)",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: colors.primaryDark,
    textDecoration: "none",
    fontSize: "20px",
    fontWeight: "800",
    letterSpacing: "-0.04em",
  },

  logoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    background: colors.primary,
    color: colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  nav: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: "5px",
    background: colors.softBg,
    borderRadius: "999px",
    border: `1px solid ${colors.border}`,
  },

  navLink: {
    color: colors.textMuted,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "650",
    padding: "8px 13px",
    borderRadius: "999px",
  },

  navLinkActive: {
    color: colors.white,
    background: colors.primary,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "750",
    padding: "8px 13px",
    borderRadius: "999px",
    boxShadow: "0 8px 18px rgba(21, 128, 61, 0.2)",
  },

  logoutBtn: {
    padding: "8px 15px",
    background: colors.white,
    border: `1px solid #86efac`,
    color: colors.primaryText,
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
  },
};

export const cards = {
  panel: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  panelSmall: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 14px 35px rgba(21, 128, 61, 0.06)",
  },

  innerCard: {
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "18px",
    padding: "14px",
  },

  hero: {
    background:
      "linear-gradient(135deg, #ffffff 0%, #f0fdf4 55%, #bbf7d0 100%)",
    border: `1px solid ${colors.border}`,
    borderRadius: "30px",
    padding: "34px",
    boxShadow: "0 18px 50px rgba(21, 128, 61, 0.08)",
  },
};

export const typography = {
  eyebrow: {
    margin: "0 0 8px 0",
    color: colors.primary,
    fontSize: "13px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  h1: {
    margin: "0 0 12px 0",
    fontSize: "42px",
    lineHeight: "1.08",
    fontWeight: "900",
    letterSpacing: "-0.06em",
    color: colors.textDark,
  },

  h2: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "900",
    letterSpacing: "-0.04em",
    color: colors.textDark,
  },

  h3: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "850",
    color: colors.textDark,
  },

  text: {
    margin: 0,
    color: colors.textMuted,
    fontSize: "15px",
    lineHeight: "1.7",
  },

  smallText: {
    margin: 0,
    color: colors.textMuted,
    fontSize: "13px",
    lineHeight: "1.5",
  },
};

export const buttons = {
  primary: {
    background: colors.primary,
    color: colors.white,
    padding: "12px 18px",
    borderRadius: "14px",
    border: "none",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(21, 128, 61, 0.22)",
  },

  secondary: {
    background: colors.white,
    color: colors.primaryText,
    padding: "12px 18px",
    borderRadius: "14px",
    border: "1px solid #86efac",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
  },

  ghost: {
    background: colors.softBg,
    color: colors.primaryText,
    padding: "10px 14px",
    borderRadius: "13px",
    border: `1px solid ${colors.border}`,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "750",
    cursor: "pointer",
  },

  disabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
};

export const forms = {
  input: {
    width: "100%",
    background: colors.white,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
  },

  select: {
    background: colors.white,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    borderRadius: "14px",
    padding: "0 14px",
    fontSize: "14px",
    outline: "none",
    minHeight: "44px",
  },

  searchBox: {
    background: colors.white,
    border: `1px solid ${colors.border}`,
    borderRadius: "14px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
};

export const badges = {
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: colors.softBg2,
    color: colors.primaryText,
    border: "1px solid #86efac",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: "800",
  },

  pill: {
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    padding: "8px 11px",
    color: colors.primaryText,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "13px",
    fontWeight: "750",
  },
};

export const grids = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "16px",
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.8fr",
    gap: "18px",
  },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
};