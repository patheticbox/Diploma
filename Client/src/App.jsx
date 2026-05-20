// client/src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import Chat from "./pages/Chat";

// Поки старі сторінки книг можна залишити, але для нового проєкту краще потім замінити:
// Books -> Mods
// BookDetails -> ModDetails
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";

const useAuth = () => {
  const token = localStorage.getItem("token");

  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return !!token || !!cookieToken;
};

const PrivateRoute = ({ children }) => {
  return useAuth() ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/games"
          element={
            <PrivateRoute>
              <Games />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />

        {/* Старі маршрути з бібліотеки. Потім краще переробити на /mods */}
        <Route
          path="/books"
          element={
            <PrivateRoute>
              <Books />
            </PrivateRoute>
          }
        />

        <Route
          path="/books/:id"
          element={
            <PrivateRoute>
              <BookDetails />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<h2>404 – Сторінка не знайдена</h2>} />
      </Routes>
    </Router>
  );
};

export default App;