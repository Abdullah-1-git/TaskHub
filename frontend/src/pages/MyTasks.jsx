import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function MyTasks() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/tasks");

        // استخراج المصفوفة بأمان مهما كان شكل استجابة السيرفر
        const allTasks = Array.isArray(res.data)
          ? res.data
          : res.data?.tasks || res.data?.data || [];

        // معرف المستخدم الحالي
        const currentUserId = String(user?._id || user?.id || "");

        // التصفية للمهام المسندة للمستخدم
        const myAssignedTasks = allTasks.filter((task) => {
          const taskAssignedId = String(
            task.assignedTo?._id || task.assignedTo || "",
          );
          return currentUserId && taskAssignedId === currentUserId;
        });

        setTasks(myAssignedTasks);
      } catch (err) {
        console.error("Error fetching my tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyTasks();
    }
  }, [user]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
      );
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
        <p>جاري جلب مهامك المسندة...</p>
      </div>
    );
  }
  return (
    <div className="details-page-wrapper">
      <section className="tasks-display-section">
        <div className="tasks-header-row">
          <h3>📋 مهامي المسندة إلي ({tasks.length})</h3>
        </div>

        <div className="tasks-items-list">
          {tasks.length === 0 ? (
            <div className="empty-tasks-card">
              لا توجد مهام مسندة إليك حالياً.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className={`task-row-box ${task.status === "Done" ? "completed-task" : ""}`}
              >
                {/* 1. تفاصيل المهمة جهة اليمين */}
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
                    {task.project && (
                      <span className="assigned-tag">
                        📁 المشروع:{" "}
                        {typeof task.project === "object"
                          ? task.project.title
                          : "مشروع"}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="date-tag">
                        📅 موعد التسليم:{" "}
                        {new Date(task.dueDate).toLocaleDateString("ar-SA")}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. أزرار الإجراءات جهة اليسار */}
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
