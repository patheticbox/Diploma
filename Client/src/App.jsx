// client/src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CreateMod from "./pages/CreateMod";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import Chat from "./pages/Chat";
import Mods from "./pages/Mods";
import ModDetails from "./pages/ModDetails";

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
          path="/mods/create"
          element={
            <PrivateRoute>
              <CreateMod />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-mod"
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


        <Route
          path="/mods/:id"
          element={
            <PrivateRoute>
              <ModDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/mods"
          element={
            <PrivateRoute>
              <Mods />
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
        <Route path="*" element={<h2>404 – Сторінка не знайдена</h2>} />
      </Routes>
    </Router>
  );
};

export default App;