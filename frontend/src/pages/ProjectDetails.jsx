import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [aiLoading, setAiLoading] = useState(false);

  // حقول إضافة مهمة جديدة
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dueDate, setDueDate] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get("/users"),
      ]);

      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Error fetching project details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. جلب المشروع والمهام
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks/project/${id}`),
        ]);

        setProject(projectRes.data);
        setTasks(tasksRes.data);

        // 2. جلب المستخدمين مباشرة للمدير
        if (user?.role === "Admin") {
          const usersRes = await api.get("/auth/users");
          setUsers(usersRes.data);
        }
      } catch (err) {
        console.error("Error fetching project details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.role]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const payload = {
        title,
        description,
        project: id,
        priority,
        dueDate: dueDate || null,
      };

      if (assignedTo) {
        payload.assignedTo = assignedTo;
      }

      await api.post("/tasks", payload);

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setPriority("Medium");
      setDueDate("");

      toast.success("تم إنشاء المهمة بنجاح! 🚀");

      fetchData();
    } catch (err) {
      console.error("Error creating task:", err);

      toast.error("حدث خطأ أثناء إنشاء المهمة");
    }
  };

  const handleAIGenerate = async () => {
    try {
      setAiLoading(true);
      const res = await api.post(`/tasks/generate-ai/${id}`);
      // إضافة المهام المولدة مباشرة إلى قائمة المهام في الواجهة
      setTasks((prev) => [...prev, ...res.data]);

      toast.success("تم تفكيك وتوليد المهام بالذكاء الاصطناعي بنجاح! ✨");
    } catch (err) {
      console.error("Error generating tasks with AI:", err);
      toast.error("تعذر توليد المهام، يرجى المحاولة لاحقاً");
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
      );
      toast.success("تم تحديث حالة المهمة ✔️", { id: "task-status" });
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("فشل تحديث حالة المهمة");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));

      toast.success("تم حذف المهمة بنجاح 🗑️");
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("تعذر حذف المهمة");
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
        <p>جاري تحميل بيانات المشروع والمهام...</p>
      </div>
    );
  }

  const completedTasksCount = tasks.filter((t) => t.status === "Done").length;
  const totalTasksCount = tasks.length;
  const progressPercentage =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  const filteredTasks = tasks.filter((task) => {
    // 1. فلترة البحث بالاسم أو الوصف
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. فلترة الحالة (الكل / مهامي / قيد الانتظار / قيد التنفيذ / المكتملة)
    let matchesStatus = true;
    if (filterStatus === "MyTasks") {
      const currentUserId = String(user?._id || user?.id || "");
      const taskAssignedId = String(
        task.assignedTo?._id || task.assignedTo || "",
      );
      matchesStatus = currentUserId && taskAssignedId === currentUserId;
    } else if (filterStatus !== "All") {
      matchesStatus = task.status === filterStatus;
    }

    // 3. فلترة الأولوية (All / High / Medium / Low)
    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="details-page-wrapper">
      {/* 1. رأس تفاصيل المشروع ونسبة الإنجاز */}
      <header className="details-header">
        <div className="details-header-info">
          <h2>{project?.title}</h2>
          <p>{project?.description || "لا يوجد وصف لهذا المشروع"}</p>
        </div>

        <div className="project-progress-wrapper">
          <div className="progress-info-row">
            <span>نسبة الإنجاز: {progressPercentage} بالمئة</span>
            <span>
              {completedTasksCount} من {totalTasksCount} مكتملة
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <Link to="/projects" className="details-back-btn">
          ← العودة للوحة التحكم
        </Link>
      </header>

      {/* 2. نموذج إضافة مهمة جديدة (للمدير فقط) */}
      {user?.role === "Admin" && (
        <section className="create-task-section">
          <button
            type="button"
            className="ai-generate-btn"
            onClick={handleAIGenerate}
            disabled={aiLoading}
          >
            {aiLoading
              ? "⏳ جاري التوليد الذكي..."
              : "✨ توليد وتفكيك المهام بالذكاء الاصطناعي"}
          </button>

          <h3>+ إضافة مهمة جديدة</h3>
          <form className="create-task-form" onSubmit={handleCreateTask}>
            <input
              type="text"
              placeholder="عنوان المهمة"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="وصف المهمة (اختياري)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">-- إسناد إلى موظف (اختياري) --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">أولوية منخفضة (Low)</option>
              <option value="Medium">أولوية متوسطة (Medium)</option>
              <option value="High">أولوية عالية (High)</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <button type="submit" className="add-task-btn">
              إضافة
            </button>
          </form>
        </section>
      )}

      {/* 3. قائمة المهام والفلترة */}
      <section className="tasks-display-section">
        <div className="filter-controls-bar">
          {/* حقل البحث بالاسم */}
          <input
            type="text"
            placeholder="ابحث عن مهمة بالاسم أو الوصف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {/* القائمة المنسدلة لفلترة الأولوية */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="priority-select-filter"
          >
            <option value="All">جميع الأولويات</option>
            <option value="High">عالية (High)</option>
            <option value="Medium">متوسطة (Medium)</option>
            <option value="Low">منخفضة (Low)</option>
          </select>
        </div>
        <div className="tasks-header-row">
          <h3>قائمة المهام ({filteredTasks.length})</h3>
          <div className="filter-buttons-group">
            <button
              type="button"
              className={`filter-btn ${filterStatus === "All" ? "active" : ""}`}
              onClick={() => setFilterStatus("All")}
            >
              الكل ({tasks.length})
            </button>
            <button
              type="button"
              className={`filter-btn ${filterStatus === "MyTasks" ? "active" : ""}`}
              onClick={() => setFilterStatus("MyTasks")}
            >
              مهامي
            </button>
            <button
              type="button"
              className={`filter-btn ${filterStatus === "To Do" ? "active" : ""}`}
              onClick={() => setFilterStatus("To Do")}
            >
              قيد الانتظار
            </button>
            <button
              type="button"
              className={`filter-btn ${filterStatus === "In Progress" ? "active" : ""}`}
              onClick={() => setFilterStatus("In Progress")}
            >
              قيد التنفيذ
            </button>
            <button
              type="button"
              className={`filter-btn ${filterStatus === "Done" ? "active" : ""}`}
              onClick={() => setFilterStatus("Done")}
            >
              المكتملة
            </button>
          </div>
        </div>

        <div className="tasks-items-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-tasks-card">
              لا توجد مهام مطابقة لهذا الفلتر.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`task-row-box ${task.status === "Done" ? "completed-task" : ""}`}
              >
                <div className="task-main-details">
                  <div className="task-heading">
                    <span
                      className={`task-priority-pill ${
                        task.priority === "High"
                          ? "priority-high"
                          : task.priority === "Low"
                            ? "priority-low"
                            : "priority-medium"
                      }`}
                    >
                      {task.priority === "High"
                        ? "عالية"
                        : task.priority === "Low"
                          ? "منخفضة"
                          : "متوسطة"}
                    </span>
                    <h4
                      className={task.status === "Done" ? "strike-title" : ""}
                    >
                      {task.title}
                    </h4>
                  </div>

                  {task.description && (
                    <p className="task-desc-text">{task.description}</p>
                  )}

                  <div className="task-footer-meta">
                    <span className="assigned-tag">
                      👤 مسندة إلى:{" "}
                      {typeof task.assignedTo === "object"
                        ? task.assignedTo?.name
                        : users.find((u) => u._id === task.assignedTo)?.name ||
                          "غير محدد"}
                    </span>
                    {task.dueDate && (
                      <span className="date-tag">
                        📅 موعد التسليم:{" "}
                        {new Date(task.dueDate).toLocaleDateString("ar-SA")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-side-controls">
                  {user?.role === "Admin" && (
                    <button
                      type="button"
                      className="task-delete-button"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      حذف
                    </button>
                  )}
                  <select
                    className="task-select-status"
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task._id, e.target.value)
                    }
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
