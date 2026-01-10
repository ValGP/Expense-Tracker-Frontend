import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "./AppLayout";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import TransactionsPage from "../pages/TransactionsPage";
import TransactionDetailPage from "../pages/TransactionDetailPage";
import NewTransactionPage from "../pages/NewTransactionPage";
import AccountsPage from "../pages/AccountsPage";
import SettingsPage from "../pages/SettingsPage";
import DashboardPage from "../pages/DashboardPage";

import CategoriesPage from "../pages/CategoriesPage";
import CategoryCreatePage from "../pages/CategoryCreatePage";
import CategoryEditPage from "../pages/CategoryEditPage";
import TagsPage from "../pages/TagsPage";

import AccountCreatePage from "../pages/AccountCreatePage";
import AccountEditPage from "../pages/AccountEditPage";

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
          { path: "home", element: <DashboardPage /> },
          { path: "transactions", element: <TransactionsPage /> },
          { path: "transactions/:id", element: <TransactionDetailPage /> },
          { path: "transactions/new", element: <NewTransactionPage /> },
          { path: "accounts", element: <AccountsPage /> },
          { path: "settings", element: <SettingsPage /> },
          { index: true, element: <Navigate to="/app/home" replace /> },
          { path: "accounts/new", element: <AccountCreatePage /> },
          { path: "accounts/:id", element: <AccountEditPage /> },
          { path: "settings/categories", element: <CategoriesPage /> },
          { path: "settings/categories/new", element: <CategoryCreatePage /> },
          { path: "settings/categories/:id", element: <CategoryEditPage /> },
          { path: "settings/tags", element: <TagsPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
