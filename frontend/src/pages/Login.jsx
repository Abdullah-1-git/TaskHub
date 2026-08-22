import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await login(email, password);
      toast.success("مرحباً بعودتك! 👋");
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "فشل تسجيل الدخول، تأكد من صحة البيانات"
        
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-logo">⚡ TaskHub</div>
          <h2>تسجيل الدخول</h2>
          <p className="auth-subtitle">أهلاً بك مجدداً! سجّل دخولك لمتابعة مهامك ومشاريعك</p>
        </div>

        {errorMsg && <div className="auth-error-box">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="auth-submit-btn">
            دخول إلى المنصة
          </button>
        </form>

        <div className="auth-footer">
          <span>ليس لديك حساب؟</span>
          <Link to="/register" className="auth-link">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>
  );
}