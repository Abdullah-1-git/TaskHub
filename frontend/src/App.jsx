import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import MyTasks from "./pages/MyTasks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// حماية المسارات الخاصة
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  // إذا لم يكن مسجل دخول، حوله مباشرة لصفحة التسجيل
  if (!user) {
    return <Navigate to="/register" replace />;
  }

  // إذا كان مسجل دخول، اعرض الصفحة المطلوبة
  return children;
}

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "custom-toast",
        }}
      />

      <div className="app-main-layout">
        {/* القائمة الجانبية تظهر للمسجلين فقط */}
        {user && <Sidebar />}

        {/* المحتوى الرئيسي */}
        <main className={`app-page-content ${!user ? "full-width" : ""}`}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tasks"
              element={
                <ProtectedRoute>
                  <MyTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <Register />}
            />
            <Route
              path="*"
              element={<Navigate to={user ? "/" : "/register"} replace />}
            />
          </Routes>
        </main>
      </div>
    </>
  );
}
