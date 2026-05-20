// client/src/components/FallbackImage.jsx
import { useState } from "react";
import { colors } from "../styles/theme";

export default function FallbackImage({
  src,
  alt = "Зображення",
  type = "mod",
  title = "",
  style = {},
}) {
  const [hasError, setHasError] = useState(false);

  const shouldShowFallback = !src || hasError;

  const icon = type === "game" ? "🎮" : "🧩";
  const label = type === "game" ? "Game cover" : "Mod preview";

  if (shouldShowFallback) {
    return (
      <div style={{ ...styles.fallback, ...style }}>
        <div style={styles.pattern} />

        <div style={styles.content}>
          <div style={styles.icon}>{icon}</div>

          <div>
            <p style={styles.label}>{label}</p>
            <h3 style={styles.title}>{title || alt}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        ...style,
      }}
      onError={() => setHasError(true)}
    />
  );
}

const styles = {
  fallback: {
    width: "100%",
    height: "100%",
    minHeight: "160px",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #ffffff 0%, #f0fdf4 45%, #bbf7d0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  pattern: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 20% 20%, rgba(21,128,61,0.14) 0, rgba(21,128,61,0.14) 2px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(21,128,61,0.1) 0, rgba(21,128,61,0.1) 3px, transparent 3px)",
    backgroundSize: "34px 34px, 46px 46px",
    opacity: 0.9,
  },

  content: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px",
    color: colors.primaryText,
  },

  icon: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.82)",
    border: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    boxShadow: "0 12px 28px rgba(21, 128, 61, 0.12)",
  },

  label: {
    margin: "0 0 4px 0",
    color: colors.textMuted,
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  title: {
    margin: 0,
    color: colors.textDark,
    fontSize: "18px",
    fontWeight: "900",
    letterSpacing: "-0.04em",
    maxWidth: "220px",
    lineHeight: "1.15",
  },
};