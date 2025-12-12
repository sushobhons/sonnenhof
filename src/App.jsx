// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./assets/styles/App.css";
import { ToastContainer } from "react-toastify";

// utils
import useAuth from "./auth/useAuth";

// Auth
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// General
import NotFound from "./pages/NotFound";

// Admin pages
import Dashboard from "./pages/Dashboard";
import Users from "./pages/employee/Users";
import DashboardImages from "./pages/employee/DashboardImages";
import MonthlyPlans from "./pages/employee/MonthlyPlans";
import SalarySlips from "./pages/employee/SalarySlips";
import News from "./pages/employee/News";
import Documents from "./pages/employee/Documents";
import Messages from "./pages/employee/Messages";
import Groups from "./pages/Groups";
import Positions from "./pages/Positions";
import Floors from "./pages/Floors";
import Settings from "./pages/Settings";

function App() {
  const { user } = useAuth();

  return (
    <>
      <div>
        <Routes>

          {/* ---------- PUBLIC AUTH ROUTES ---------- */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ---------- ADMIN ROUTES (NO GUARDS) ---------- */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/dashboard-images" element={<DashboardImages />} />
          <Route path="/monthly-plans" element={<MonthlyPlans />} />
          <Route path="/salary-slips" element={<SalarySlips />} />
          <Route path="/news" element={<News />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/floors" element={<Floors />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/settings" element={<Settings />} />

          {/* ---------- FALLBACK ---------- */}
          <Route path="*" element={<NotFound />} />

        </Routes>

        <ToastContainer />
      </div>
    </>
  );
}

export default App;
