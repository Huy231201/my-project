import { createBrowserRouter, Navigate } from "react-router";
import AuthLayout from "@/features/auth/layout/AuthLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import DashboardLayout from "@/features/dashboard/layout/DashboardLayout";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import TaskPage from "@/features/dashboard/pages/TaskPage";
import { dashboardLoader } from "@/features/dashboard/loader";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    loader: dashboardLoader,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/tasks",
        element: <TaskPage />,
      },
    ],
  },
]);
