import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  // استخراج الإحصائيات سواء كانت داخل stats أو مباشرة
  const total = project.stats?.totalTasks ?? project.totalTasks ?? 0;
  const completed =
    project.stats?.completedTasks ?? project.completedTasks ?? 0;

  // استخراج النسبة كرقم لتمريرها لشريط التقدم
  const rawProgress =
    project.stats?.progressPercentage ?? project.progress ?? 0;
  const progressNum =
    typeof rawProgress === "string"
      ? parseInt(rawProgress.replace("%", ""), 10) || 0
      : rawProgress;

  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3>{project.title}</h3>
        <span className="project-percentage">{progressNum}%</span>
      </div>

      <p className="project-desc">{project.description || "لا يوجد وصف"}</p>

      {/* شريط التقدم التلقائي */}
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressNum}%` }}
        ></div>
      </div>

      <div className="project-card-footer">
        <span className="tasks-count-info">
          📊 {completed} من {total} مكتملة
        </span>
        <Link to={`/projects/${project._id}`} className="view-tasks-link">
          عرض المهام ←
        </Link>
      </div>
    </div>
  );
}
