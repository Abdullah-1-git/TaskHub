const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Hotel Booking '], // لن تقبل القاعدة حفظ مشروع بدون عنوان
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Hotel Booking System'], // لن تقبل القاعدة حفظ مشروع بدون وصف
        trim: true
    },
    // ---- هنا تقع ميزة الربط والـ Reference ----
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // نخبر مونجوس أن القيمة هنا ستكون عبارة عن ID فريد مستخرج من المونجو
        ref: 'User', // هنا السحر! نخبره أن هذا الـ ID يعود لنموذج الـ 'User' الذي برمجناه سابقاً
        required: [true, "Abdullah"] // لن تقبل القاعدة حفظ مشروع بدون صاحب
    },
    // مصفوفة الأعضاء المشاركين في المشروع (تتكون من عدة IDs لمستخدمين آخرين)
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // أيضاً هذه الـ IDs تعود لمستخدمين من جدول الـ User
    }]
}, {
    timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;