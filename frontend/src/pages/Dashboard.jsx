import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [viewScope, setViewScope] = useState("my"); // "my" للمهام الخاصة أو "all" لمهام المنصة
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks"),
        ]);
        setProjects(projRes.data.projects || projRes.data || []);
        setTasks(taskRes.data.tasks || taskRes.data || []);
      } catch (err) {
        console.error("خطأ في جلب بيانات لوحة التحكم:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // تصفية المهام بناءً على التبويب المختار
  const currentTasks =
    viewScope === "my"
      ? tasks.filter((t) => {
          const assignedId = t.assignedTo?._id || t.assignedTo;
          return assignedId === user?._id || assignedId === user?.id;
        })
      : tasks;

  // حساب الإحصائيات
  const todoCount = currentTasks.filter((t) => t.status === "To Do").length;
  const inProgressCount = currentTasks.filter(
    (t) => t.status === "In Progress",
  ).length;
  const doneCount = currentTasks.filter((t) => t.status === "Done").length;
  const totalCount = currentTasks.length;

  const chartData = [
    { name: "قيد الانتظار", value: todoCount, color: "#f59e0b" },
    { name: "قيد التنفيذ", value: inProgressCount, color: "#38bdf8" },
    { name: "مكتملة", value: doneCount, color: "#10b981" },
  ];

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/projects", { title, description });
      const newProject = res.data.project || res.data;
      setProjects((prev) => [newProject, ...prev]);
      setTitle("");
      setDescription("");
      toast.success("تم إنشاء المشروع بنجاح! 🚀");
    } catch (err) {
      console.error("فشل إنشاء المشروع:", err);
      toast.error("فشل إنشاء المشروع، يرجى المحاولة لاحقاً");
    }
  };

  return (
    <div className="dashboard-page">
      {/* شريط التبديل بين مهامي ومهام الفريق */}
      <div className="dashboard-tabs-bar">
        <button
          className={"scope-tab-btn " + (viewScope === "my" ? "active" : "")}
          onClick={() => setViewScope("my")}
        >
          📌 مهامي المسندة إلي
        </button>
        <button
          className={"scope-tab-btn " + (viewScope === "all" ? "active" : "")}
          onClick={() => setViewScope("all")}
        >
          🌐 إحصائيات الفريق والمنصة
        </button>
      </div>

      {/* قسم التحليلات والرسم البياني */}
      <section className="dashboard-analytics-section">
        <div className="analytics-card stats-summary">
          <h2>مرحباً، {user?.name || "المستخدم"} 👋</h2>
          <p>
            {viewScope === "my"
              ? "ملخص المهام المسندة إليك شخصياً عبر جميع المشاريع"
              : "نظرة عامة على إجمالي سير العمل لجميع مشاريع المنصة"}
          </p>

          <div className="mini-stats-grid">
            <div className="stat-box">
              <span className="stat-label">المشاريع</span>
              <span className="stat-number">{projects.length}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">إجمالي المهام</span>
              <span className="stat-number">{totalCount}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">المهام المكتملة</span>
              <span className="stat-number green-text">{doneCount}</span>
            </div>
          </div>
        </div>

        <div className="analytics-card chart-container-card">
          <h3>
            📊 توزيع حالات المهام ({viewScope === "my" ? "مهامي" : "الكل"})
          </h3>

          {totalCount === 0 ? (
            <p className="no-data-text">لا توجد مهام مسجلة في هذا القسم</p>
          ) : (
            <div className="chart-wrapper-flex">
              <div style={{ width: "140px", height: "140px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={"cell-" + index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* دليل ألوان مخصص ونظيف ومقروء */}
              <div className="custom-legend-list">
                <div className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: "#f59e0b" }}
                  ></span>
                  <span className="legend-label">قيد الانتظار:</span>
                  <strong className="legend-value">{todoCount}</strong>
                </div>
                <div className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: "#38bdf8" }}
                  ></span>
                  <span className="legend-label">قيد التنفيذ:</span>
                  <strong className="legend-value">{inProgressCount}</strong>
                </div>
                <div className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: "#10b981" }}
                  ></span>
                  <span className="legend-label">مكتملة:</span>
                  <strong className="legend-value">{doneCount}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* قسم إنشاء مشروع جديد للمدير فقط */}
      {user?.role === "Admin" && (
        <section className="create-project-section">
          <h3>+ إنشاء مشروع جديد</h3>
          <form onSubmit={handleCreateProject} className="create-project-form">
            <input
              type="text"
              placeholder="عنوان المشروع"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="وصف المشروع"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit">إنشاء</button>
          </form>
        </section>
      )}

      {/* قسم المشاريع المتاحة */}
      <section className="projects-list-section">
        <h3 className="section-title">المشاريع المتاحة</h3>
        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner"></div>
            <p>جاري تحميل المشاريع والإحصائيات...</p>
          </div>
        ) : projects.length === 0 ? (
          <p className="no-data-text">لا توجد مشاريع مضافة حالياً.</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
