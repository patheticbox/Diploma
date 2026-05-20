// client/src/components/AiChatBot.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { colors, buttons, cards } from "../styles/theme";

export default function AiChatBot({
  compact = false,
  height = "calc(100vh - 120px)",
  showSuggestions = true,
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Привіт 👋 Я AI-агент сервісу модифікацій. Можу порадити моди для конкретної гри, графіки, оптимізації, геймплею або допомогти з вибором.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [relatedMods, setRelatedMods] = useState([]);

  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "Порадь графічні моди",
    "Що встановити для слабкого ПК?",
    "Порадь моди для Minecraft",
    "Дай геймплейні моди для Skyrim",
    "Порадь оптимізаційні моди",
    "Які моди краще почати встановлювати?",
  ];

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const getToken = () => {
    return getCookie("token") || localStorage.getItem("token");
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const normalizeRole = (role) => {
    if (role === "ai") return "assistant";
    if (role === "assistant") return "assistant";
    if (role === "user") return "user";
    return "assistant";
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const token = getToken();

      if (!token) {
        setHistoryLoading(false);
        return;
      }

      const res = await fetch("/api/ai/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        setHistoryLoading(false);
        return;
      }

      const data = await res.json();

      const formattedHistory = (data.history || []).map((msg) => ({
        id: msg._id || `msg-${Date.now()}-${Math.random()}`,
        role: normalizeRole(msg.role),
        content: msg.content,
      }));

      if (formattedHistory.length > 0) {
        setMessages(formattedHistory);
      }
    } catch (err) {
      console.warn("Історію чату не завантажено:", err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const token = getToken();

    if (!token) {
      setError("Потрібно увійти в акаунт, щоб користуватися AI-агентом");
      return;
    }

    const userMessage = text.trim();

    setInput("");
    setLoading(true);
    setError("");

    const tempUserMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const res = await fetch("/api/ai/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Помилка при отриманні відповіді");
      }

      const aiMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          data.aiResponse ||
          data.answer ||
          "Не вдалося сформувати відповідь.",
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (Array.isArray(data.mods)) {
        setRelatedMods(data.mods);
      }
    } catch (err) {
      console.error("AI chat error:", err);

      setError(
        err.message ||
          "Не вдалося отримати відповідь від AI-агента. Перевір backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handlePromptClick = async (prompt) => {
    await sendMessage(prompt);
  };

  const clearHistory = async () => {
    const confirmed = window.confirm(
      "Ви впевнені, що хочете очистити історію чату?"
    );

    if (!confirmed) return;

    const token = getToken();

    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content:
          "Історію очищено. Можеш знову запитати мене про моди, ігри, оптимізацію або рекомендації.",
      },
    ]);

    setRelatedMods([]);
    setError("");

    try {
      await fetch("/api/ai/history", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    } catch (err) {
      console.warn("Backend history clear недоступний:", err.message);
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        height,
        borderRadius: compact ? "22px" : "24px",
      }}
    >
      <div style={styles.header}>
        <div style={styles.agentInfo}>
          <div style={styles.agentAvatar}>🤖</div>

          <div>
            <h2 style={styles.title}>
              {compact ? "AI Агент" : "AI Агент модифікацій"}
            </h2>

            <p style={styles.subtitle}>
              Підбирає моди з бази даних проєкту
            </p>
          </div>
        </div>

        <button onClick={clearHistory} style={styles.clearButton}>
          Очистити
        </button>
      </div>

      <div style={styles.messagesContainer}>
        {historyLoading && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Завантаження історії...</p>
          </div>
        )}

        {!historyLoading &&
          messages.map((message) => (
            <div
              key={message.id}
              style={
                message.role === "user"
                  ? styles.userMessageWrapper
                  : styles.aiMessageWrapper
              }
            >
              <div
                style={
                  message.role === "user"
                    ? styles.userMessage
                    : styles.aiMessage
                }
              >
                {message.content}
              </div>
            </div>
          ))}

        {loading && (
          <div style={styles.aiMessageWrapper}>
            <div style={styles.aiMessage}>
              <span style={styles.typingAnimation}>⏳ AI аналізує моди...</span>
            </div>
          </div>
        )}

        {error && <div style={styles.errorMessage}>⚠️ {error}</div>}

        <div ref={messagesEndRef} />
      </div>

      {relatedMods.length > 0 && (
        <div style={styles.relatedMods}>
          <div style={styles.relatedHeader}>
            <span>🧩 Знайдені моди</span>
          </div>

          <div style={styles.relatedList}>
            {relatedMods.slice(0, 4).map((mod) => (
              <Link
                key={mod._id}
                to={`/mods/${mod._id}`}
                style={styles.relatedCard}
              >
                <div style={styles.relatedIcon}>🧩</div>

                <div style={styles.relatedInfo}>
                  <strong>{mod.titleUa || mod.title}</strong>
                  <span>
                    {mod.game?.titleUa || mod.game?.title || "Гра не вказана"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {showSuggestions && (
        <div style={styles.suggestions}>
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              style={styles.suggestionButton}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} style={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Наприклад: порадь моди для графіки в Skyrim..."
          disabled={loading}
          style={styles.input}
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            ...styles.sendButton,
            ...(loading || !input.trim() ? styles.sendButtonDisabled : {}),
          }}
        >
          {loading ? "..." : compact ? "➤" : "Надіслати"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    color: colors.text,
    boxShadow: "0 18px 50px rgba(21, 128, 61, 0.08)",
  },

  header: {
    padding: "16px 18px",
    borderBottom: `1px solid ${colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #ffffff 0%, #f0fdf4 55%, #dcfce7 100%)",
  },

  agentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  agentAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    background: colors.primary,
    color: colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    boxShadow: "0 12px 28px rgba(21, 128, 61, 0.22)",
  },

  title: {
    fontSize: "17px",
    fontWeight: "850",
    margin: 0,
    letterSpacing: "-0.03em",
    color: colors.textDark,
  },

  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: colors.textMuted,
  },

  clearButton: {
    ...buttons.secondary,
    padding: "8px 12px",
    fontSize: "13px",
    boxShadow: "none",
  },

  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: colors.pageBg,
  },

  emptyState: {
    textAlign: "center",
    marginTop: "40px",
    color: colors.textMuted,
  },

  emptyText: {
    fontSize: "15px",
    fontWeight: "600",
    margin: 0,
  },

  userMessageWrapper: {
    display: "flex",
    justifyContent: "flex-end",
  },

  aiMessageWrapper: {
    display: "flex",
    justifyContent: "flex-start",
  },

  userMessage: {
    maxWidth: "78%",
    background: colors.primary,
    color: colors.white,
    padding: "11px 14px",
    borderRadius: "16px 16px 4px 16px",
    fontSize: "14px",
    lineHeight: "1.55",
    whiteSpace: "pre-wrap",
    boxShadow: "0 12px 26px rgba(21, 128, 61, 0.18)",
  },

  aiMessage: {
    maxWidth: "82%",
    background: colors.cardBg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    padding: "11px 14px",
    borderRadius: "16px 16px 16px 4px",
    fontSize: "14px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    boxShadow: "0 10px 24px rgba(21, 128, 61, 0.05)",
  },

  typingAnimation: {
    color: colors.textMuted,
    fontSize: "13px",
  },

  errorMessage: {
    background: "#fee2e2",
    color: "#7f1d1d",
    border: "1px solid #fecaca",
    padding: "10px 12px",
    borderRadius: "12px",
    fontSize: "13px",
    textAlign: "center",
  },

  relatedMods: {
    background: colors.cardBg,
    borderTop: `1px solid ${colors.border}`,
    padding: "12px 16px",
  },

  relatedHeader: {
    color: colors.primaryText,
    fontSize: "13px",
    fontWeight: "800",
    marginBottom: "10px",
  },

  relatedList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "8px",
  },

  relatedCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: colors.softBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "14px",
    padding: "10px",
    color: colors.textDark,
    textDecoration: "none",
  },

  relatedIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: colors.softBg2,
    color: colors.primaryText,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 34px",
  },

  relatedInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    minWidth: 0,
    color: colors.textDark,
  },

  suggestions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    padding: "12px 16px 0 16px",
    borderTop: `1px solid ${colors.border}`,
    background: colors.cardBg,
  },

  suggestionButton: {
    padding: "8px 12px",
    background: colors.softBg,
    color: colors.primaryText,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  inputForm: {
    display: "flex",
    gap: "10px",
    padding: "12px 16px 16px 16px",
    background: colors.cardBg,
    borderTop: `1px solid ${colors.border}`,
  },

  input: {
    flex: 1,
    padding: "12px 13px",
    background: colors.white,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    borderRadius: "14px",
    fontSize: "14px",
    outline: "none",
  },

  sendButton: {
    ...buttons.primary,
    minWidth: "96px",
    padding: "12px 16px",
  },

  sendButtonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
};