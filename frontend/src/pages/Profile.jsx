import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateData = { name, email };
      if (password.trim() !== "") {
        updateData.password = password;
      }

      const token = localStorage.getItem("token");
      const res = await api.put("/auth/profile", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // تحديث الحالة العامة للتطبيق فوراً
      updateUser(res.data);

      toast.success("تم تحديث البيانات بنجاح 👤");
      setPassword("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "تعذر تحديث البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>الملف الشخصي ⚙️</h2>
      <form onSubmit={handleUpdate} className="profile-form">
        <div className="form-group">
          <label>الاسم الكامل</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>نوع الحساب / الرتبة</label>
          <input type="text" value={user?.role || ""} disabled />
        </div>

        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </form>
    </div>
  );
}
