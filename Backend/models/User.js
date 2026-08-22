const mongoose = require("mongoose");

// 1. تعريف المخطط (Schema) - نحدد شكل وثيقة المستخدم في قاعدة البيانات
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "  Abdullah"], // لن تقبل القاعدة حفظ مستخدم بدون اسم
    },
    email: {
      type: String,
      required: [true, " address@domain.com"], // لن تقبل القاعدة حفظ مستخدم بدون إيميل
      unique: true, // يمنع تكرار الحساب بنفس الإيميل في القاعدة
      trim: true, // يزيل الفراغات الزائدة من الأطراف تلقائياً
    },
    password: {
      type: String,
      required: [true, " 123456"], // لن تقبل القاعدة حفظ مستخدم بدون كلمة مرور'],
      minlength: [6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"],
    },
    role: {
      type: String,
      enum: ["Admin", "Member"], // يمنع إدخال أي قيمة خارج هاتين الكلمتين
      default: "Member", // إذا لم نحدد الصلاحية، سيتم اعتباره عضو تلقائياً
    },
  },
  {
    timestamps: true, // ميزة رهيبة من مونجوس تنشئ تلقائياً حقلين: وقت إنشاء الحساب ووقت آخر تحديث
  },
);

// 2. تحويل المخطط إلى نموذج (Model) وتصديره ليتسنى لنا استخدامه في بقية الملفات
const User = mongoose.model("User", userSchema);
module.exports = User;
