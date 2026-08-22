import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member");
  const [errorMsg, setErrorMsg] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await register(name, email, password, role);
      toast.success("تم إنشاء الحساب بنجاح! مرحباً بك 🎉");
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "حدث خطأ أثناء التسجيل، يرجى المحاولة لاحقاً",
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-logo">⚡ TaskHub</div>
          <h2>إنشاء حساب جديد</h2>
          <p className="auth-subtitle">
            انضم إلى فريق العمل وابدأ بإدارة مهامك بكل سهولة
          </p>
        </div>

        {errorMsg && <div className="auth-error-box">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>الاسم الكامل</label>
            <input
              type="text"
              placeholder="مثال: سارة أحمد"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>الدور (الصلاحية)</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Member">عضو فريق (Member)</option>
              <option value="Admin">مدير مشاريع (Admin)</option>
            </select>
          </div>

          <button type="submit" className="auth-submit-btn">
            تسجيل الحساب
          </button>
        </form>

        <div className="auth-footer">
          <span>لديك حساب بالفعل؟</span>
          <Link to="/login" className="auth-link">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
