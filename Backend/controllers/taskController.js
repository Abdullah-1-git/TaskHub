const { GoogleGenAI } = require("@google/genai");
const Project = require("../models/Project");
const Task = require("../models/Task");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, projectID, priority, dueDate } =
      req.body;

    // 1. التحقق من الحقول الأساسية
    if (!title || !projectID) {
      return res.status(400).json({
        message: "Please Provide All Needed Details",
      });
    }

    // 2. إنشاء وحفظ المهمة في قاعدة البيانات أولاً
    const task = new Task({
      title,
      description,
      projectID,
      assignedTo: assignedTo || null,
      createdBy: req.user?._id || req.user?.id || null,
      priority: priority || "Medium",
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await task.save();

    // 3. جلب بيانات الموظف المسندة له المهمة لعرضها في الواجهة
    const populatedTask = await Task.findById(task._id).populate(
      "assignedTo",
      "name email role",
    );

    // 4. إرجاع الاستجابة بنجاح
    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("خطأ في إنشاء المهمة:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params; // استخراجه بنفس اسم المسار :projectId

    const tasks = await Task.find({ projectID: projectId }) // استخدامه هنا
      .populate("assignedTo", "name email");

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email role")
      .populate("projectID", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "تم جلب المهام بنجاح",
      tasks,
    });
  } catch (error) {
    console.error("خطأ في جلب المهام:", error);
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "المهمة غير موجودة" });
    }

    res.status(200).json({
      message: "تم تحديث المهمة بنجاح",
      task: updatedTask,
    });
  } catch (error) {
    console.error("خطأ في تحديث المهمة:", error);
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. البحث عن المهمة أولاً دون حذفها
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "المهمة غير موجودة أصلاً" });
    }

    // 2. التحقق من الصلاحية (إذا لم يكن هو صاحب التكليف يمنعه)
    if (task.assignedTo && !task.assignedTo.equals(req.user.id)) {
      return res.status(403).json({
        message: "Unauthorized for you to delete this task",
      });
    }

    // 3. الحذف الفعلي بعد التأكد من الصلاحية
    await task.deleteOne();

    res.status(200).json({ message: "تم حذف المهمة بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const generateAITasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1. التحقق من المشروع
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "المشروع غير موجود" });
    }

    // 2. التحقق من المفتاح وتهيئة العميل داخل الدالة لضمان قراءته
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY is missing from process.env");
      return res
        .status(500)
        .json({ message: "مفتاح API غير متوفر في السيرفر" });
    }

    const ai = new GoogleGenAI({ apiKey });

    // 3. التوجيه وتوليد المهام
    const prompt = `أنت مدير مشاريع محترف.
المشروع: "${project.title}"
الوصف: "${project.description || "مشروع عام"}"

المطلوب: قسّم هذا المشروع إلى 3 إلى 5 مهام عمل تنفيذية.
أرجع النتيجة بصيغة JSON حصراً بدون markdown وبدون نصوص أخرى:
[
  {
    "title": "عنوان المهمة",
    "description": "وصف المهمة",
    "priority": "High"
  }
]
خيارات الأولوية: High أو Medium أو Low.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const generatedTasks = JSON.parse(response.text.trim());

    // 4. الحفظ في قاعدة البيانات
    const tasksToInsert = generatedTasks.map((t) => ({
      title: t.title,
      description: t.description,
      priority: ["High", "Medium", "Low"].includes(t.priority)
        ? t.priority
        : "Medium",
      status: "To Do",
      projectID: projectId,
    }));

    const savedTasks = await Task.insertMany(tasksToInsert);

    return res.status(201).json(savedTasks);
  } catch (error) {
    console.error("❌ AI Generation Detailed Error:", error);
    return res.status(500).json({
      message: "فشل توليد المهام بالذكاء الاصطناعي",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getAllTasks,
  updateTask,
  deleteTask,
  generateAITasks,
};
