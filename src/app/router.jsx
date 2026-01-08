import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "./AppLayout";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import TransactionsPage from "../pages/TransactionsPage";
import NewTransactionPage from "../pages/NewTransactionPage";
import AccountsPage from "../pages/AccountsPage";
import SettingsPage from "../pages/SettingsPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <AppLayout />,
        children: [
          { path: "home", element: <HomePage /> },
          { path: "transactions", element: <TransactionsPage /> },
          { path: "transactions/new", element: <NewTransactionPage /> },
          { path: "accounts", element: <AccountsPage /> },
          { path: "settings", element: <SettingsPage /> },
          { index: true, element: <Navigate to="/app/home" replace /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
