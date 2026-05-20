// client/src/api/apiClient.js

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }

  return null;
}

function getToken() {
  return getCookie("token") || localStorage.getItem("token");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("API повернув НЕ JSON");
    console.error("URL:", path);
    console.error("Status:", response.status);
    console.error("Response:", text.slice(0, 500));

    throw new Error(
      `Сервер повернув HTML замість JSON. URL: ${path}. Перевір Vite proxy або backend route.`
    );
  }

  if (!response.ok) {
    throw new Error(data?.message || "Помилка API-запиту");
  }

  return data;
}