const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//دالة انشاء مستخدم جديد
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // التحقق من وجود المستخدم بالفعل
    const userExits = await User.findOne({ email });
    if (userExits) {
      return res.status(400).json({ message: "User already exists" });
    }
    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //حفظ المستخدم الجديد في قاعدة البيانات
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, //نحفظ النسخة المشفرة وليست الصريحة
      role,
    });

    //الرد على الفرونت اند بالنجاح
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    //الرد على الفرونت اند في حالة حدوث خطأ
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// دالة تسجيل الدخول
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. التأكد من وجود المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. مطابقة كلمة السر
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. إصدار التوكن
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // 4. إرسال الرد
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// دالة لجلب جميع المستخدمين المسجلين (لاستخدامهم في إسناد المهام)
const getAllUsers = async (req, res) => {
  try {
    // نجلب فقط الـ id والاسم والبريد والدور بدون كلمة المرور
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ في جلب المستخدمين", error: error.message });
  }
};

// دالة تحديث بيانات المستخدم
const updateProfile = async (req, res) => {
  try {
    // قراءة الـ id من الـ decoded token
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // تشفير كلمة المرور إذا تم إدخالها
    if (req.body.password && req.body.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  updateProfile,
};
