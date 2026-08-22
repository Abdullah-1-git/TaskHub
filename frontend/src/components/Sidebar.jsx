import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="app-sidebar">
      {/* الشعار واسم النظام */}
      <div className="sidebar-brand">
        <span className="brand-icon">⚡</span>
        <h2>TaskHub</h2>
      </div>

      {/* بطاقة معلومات المستخدم */}
      <div className="sidebar-user-card">
        <div className="user-avatar-circle">
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="user-text-info">
          <span className="user-full-name">{user?.name || "مستخدم"}</span>
          <span className="user-role-badge">
            {user?.role === "Admin" ? "مدير النظام" : "عضو فريق"}
          </span>
        </div>
      </div>

      {/* روابط التنقل */}
      <nav className="sidebar-nav-menu">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          end
        >
          <span className="link-icon">📊</span>
          <span className="link-title">لوحة التحكم</span>
        </NavLink>

        <NavLink
          to="/my-tasks"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="link-icon">📋</span>
          <span className="link-title">مهامي</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="link-icon">⚙️</span>
          <span className="link-title">الملف الشخصي</span>
        </NavLink>
      </nav>

      {/* قسم تسجيل الخروج في الأسفل */}
      <div className="sidebar-footer">
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-logout-btn"
        >
          <span className="link-icon">🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
