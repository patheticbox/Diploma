import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    let newErrors = {};
    if (username.length < 3) newErrors.username = "Мінімум 3 символи";
    if (!validateEmail(email)) newErrors.email = "Введіть коректний email";
    if (password.length < 6) newErrors.password = "Мінімум 6 символів";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Паролі не співпадають";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Реєстрація успішна! Перенаправлення...");
        if (data.token) localStorage.setItem("token", data.token);
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setMessage(data.message || "Помилка реєстрації");
      }
    } catch (err) {
      console.error(err);
      setMessage("Помилка з'єднання з сервером");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Реєстрація</h1>

        {message && (
          <div
            style={{
              ...styles.message,
              ...(message.includes("успішна")
                ? styles.success
                : styles.errorMessage),
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Ім'я користувача</label>
            <input
              type="text"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <div style={styles.errorText}>{errors.username}</div>}
          </div>

          <div style={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <div style={styles.errorText}>{errors.email}</div>}
          </div>

          <div style={styles.formGroup}>
            <label>Пароль</label>
            <input
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <div style={styles.errorText}>{errors.password}</div>}
          </div>

          <div style={styles.formGroup}>
            <label>Підтвердіть пароль</label>
            <input
              type="password"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <div style={styles.errorText}>{errors.confirmPassword}</div>
            )}
          </div>

          <button type="submit" style={styles.button} disabled={submitting}>
            {submitting ? "Реєстрація..." : "Зареєструватися"}
          </button>
        </form>

        <div style={styles.loginLink}>
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  container: {
    background: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '400px'
  },
  h1: { 
    textAlign: 'center', 
    color: '#333', 
    marginBottom: '30px', 
    fontSize: '28px' 
  },
  formGroup: { marginBottom: '20px' },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  errorText: { 
    color: '#e74c3c', 
    fontSize: '12px', 
    marginTop: '5px' 
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px'
  },
  message: { 
    padding: '12px', 
    borderRadius: '5px', 
    marginBottom: '20px' 
  },
  success: { 
    background: '#d4edda', 
    color: '#155724', 
    border: '1px solid #c3e6cb' 
  },
  errorMessage: { 
    background: '#f8d7da', 
    color: '#721c24', 
    border: '1px solid #f5c6cb' 
  },
  loginLink: { 
    textAlign: 'center', 
    marginTop: '20px', 
    color: '#666' 
  }
};