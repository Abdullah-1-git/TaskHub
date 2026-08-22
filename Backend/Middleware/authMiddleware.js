const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = (req, res, next) => {
  // 1. هل فيه بطاقة في الـ Header؟
  const authHeader = req.headers.authorization;

  // إذا ما فيه هيدر OR لا يبدأ بـ Bearer
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Unauthorized, Card is missing!" });
  }

  // 2. استخراج التوكن وتأكيد الختم
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // حفظ بيانات صاحب البطاقة
    next(); // السماح بالمرور
  } catch (error) {
    return res.status(401).json({ message: "The card is invalid or expired" });
  }
}; // 👈 هنا مكان القوس الصحيح لإغلاق الدالة بالكامل!

// Middleware للتحقق من صلاحية المدير
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "غير مصرح لك: هذه العملية للمدير فقط" });
  }
};

module.exports = { protect, adminOnly };
