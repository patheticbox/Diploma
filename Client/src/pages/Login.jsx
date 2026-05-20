import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let hasError = false;
    let newErrors = {};

    if (!isValidEmail(email)) {
      newErrors.email = 'Введіть коректний email';
      hasError = true;
    }

    if (password.length < 6) {
      newErrors.password = 'Пароль повинен містити мінімум 6 символів';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Вхід успішний! Перенаправлення...');
        setMessageType('success');

        if (data.token) {
          localStorage.setItem('token', data.token);
          document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        }

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setMessage(data.message || 'Помилка входу. Перевірте email та пароль');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Помилка з\'єднання з сервером');
      setMessageType('error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Вхід</h1>
        {message && <div style={{...styles.message, ...(messageType === 'success' ? styles.success : styles.error)}}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoFocus
            />
            {errors.email && <div style={styles.error}>{errors.email}</div>}
          </div>

          <div style={styles.formGroup}>
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            {errors.password && <div style={styles.error}>{errors.password}</div>}
          </div>

          <div style={styles.forgotPassword}>
            <a href="/forgot-password">Забули пароль?</a>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <div style={styles.registerLink}>
          Немає акаунту? <a href="/register">Зареєструватися</a>
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
  h1: { textAlign: 'center', color: '#333', marginBottom: '30px', fontSize: '28px' },
  formGroup: { marginBottom: '20px' },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '5px',
    fontSize: '14px'
  },
  error: { color: '#e74c3c', fontSize: '12px', marginTop: '5px' },
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
  message: { padding: '12px', borderRadius: '5px', marginBottom: '20px' },
  success: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
  errorMessage: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
  registerLink: { textAlign: 'center', marginTop: '20px', color: '#666' },
  forgotPassword: { textAlign: 'right', marginTop: '10px', marginBottom: '20px' }
};