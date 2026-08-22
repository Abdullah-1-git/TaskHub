const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  getAllTasks,
  updateTask,
  deleteTask,
  generateAITasks,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

// مسار إنشاء مهمة جديدة
router.post("/", protect, createTask);

// مسار توليد مهام بالذكاء الاصطناعي لمشروع معين
router.post("/generate-ai/:projectId", protect, generateAITasks);

// مسار جلب كل المهام التابعة لمشروع معين
router.get("/project/:projectId", protect, getTasksByProject);

// مسار جلب جميع المهام (صفحة مهامي)
router.get("/", protect, getAllTasks);

// مسار تعديل مهمة بواسطة ID
router.put("/:id", protect, updateTask);

// مسار حذف مهمة
router.delete("/:id", protect, deleteTask);

module.exports = router;
