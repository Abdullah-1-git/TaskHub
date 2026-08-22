const express = require("express");
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect, adminOnly } = require("../Middleware/authMiddleware");


router.post("/", protect, adminOnly, createProject);
router.get("/", protect, getAllProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, adminOnly, deleteProject);

module.exports = router;
