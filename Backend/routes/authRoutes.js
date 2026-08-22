const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// مسار تسجيل مستخدم جديد
router.post('/register', registerUser);

// مسار تسجيل الدخول
router.post('/login', loginUser);

// مسار جلب كل المستخدمين
router.get('/users', protect, getAllUsers);

router.put("/profile", protect, updateProfile);

module.exports = router;