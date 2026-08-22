const Project = require("../models/Project");
const Task = require("../models/Task");

// 1️⃣ دالة إنشاء مشروع جديد
const createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    //const {createdBy} = req.body;

    const newProject = await Project.create({
      title,
      description,
      createdBy: req.user.id,
      members,
    });

    res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}; // <--- 🌟 التعديل هنا: حطينا قوس الإغلاق والفاصلة المنقوطة عشان ننهي الدالة الأولى تماماً!

// جلب المشاريع مع حساب نسبة الإنجاز والمهام المتبقية لكل مشروع
const getAllProjects = async (req, res) => {
  try {
    // 1. جلب مشاريع المستخدم
    const projects = await Project.find({}).populate("createdBy", "name email");

    // 2. حساب إحصائيات المهام لكل مشروع بالتوازي
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        // إجمالي مهام هذا المشروع
        const totalTasks = await Task.countDocuments({
          projectID: project._id,
        });

        // عدد المهام المكتملة
        const completedTasks = await Task.countDocuments({
          projectID: project._id,
          status: "Done",
        });

        // المهام المتبقية
        const remainingTasks = totalTasks - completedTasks;

        // حساب نسبة الإنجاز المئوية
        const progressPercentage =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project.toObject(),
          stats: {
            totalTasks,
            completedTasks,
            remainingTasks,
            progressPercentage: `${progressPercentage}%`,
          },
        };
      }),
    );

    res.status(200).json(projectsWithProgress);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// جلب تفاصيل مشروع واحد بواسطة المعرّف
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "المشروع غير موجود" });
    }
    res.status(200).json(project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ في السيرفر", error: error.message });
  }
};

// 1. تعديل بيانات المشروع
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "المشروع غير موجود" });
    }

    // التأكد أن المستخدم الحالي هو صاحب المشروع
    if (!project.createdBy.equals(req.user.id)) {
      return res
        .status(403)
        .json({ message: "غير مصرح لك بتعديل هذا المشروع" });
    }

    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. حذف المشروع مع جميع المهام المرتبطة به
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "المشروع غير موجود" });
    }

    // التأكد أن المستخدم الحالي هو صاحب المشروع
    if (!project.createdBy.equals(req.user.id)) {
      return res.status(403).json({ message: "غير مصرح لك بحذف هذا المشروع" });
    }

    // حذف جميع المهام التابعة لهذا المشروع أولاً
    await Task.deleteMany({ projectID: id });

    // حذف المشروع نفسه
    await project.deleteOne();

    res
      .status(200)
      .json({ message: "تم حذف المشروع وجميع المهام التابعة له بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};