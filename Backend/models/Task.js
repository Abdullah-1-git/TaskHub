const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Task title is required"],
    trim: true,
  },
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Done"], // يحدد القيم المسموح بها لحالة المهمة
    default: "To Do", // إذا لم يتم تحديد الحالة، سيتم اعتبارها "To Do" تلقائياً
  },
  description: {
    type: String,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  dueDate: {
    type: Date,
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId, // نخبر مونجوس أن القيمة هنا ستكون عبارة عن ID فريد مستخرج من المونجو
    ref: "Project", // هنا السحر! نخبره أن هذا الـ ID يعود لنموذج الـ 'Project' الذي برمجناه سابقاً}
  },
  // إسناد المهمة إلى موظف (عضو)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // أيضاً هذه الـ IDs تعود لمستخدمين من جدول الـ User
  },
});

module.exports = mongoose.model("Task", taskSchema);
