# Koel

แอปเรียนภาษาจีน เยอรมัน อังกฤษ ฝรั่งเศส สำหรับคนไทย และภาษาไทยสำหรับชาวต่างชาติและเด็กไทย เน้นประโยคที่ใช้ได้จริงตามสถานการณ์ ใช้ฟรีทั้งหมด
มีคำอ่านไทย คำแปลไทย เสียง (เลือกเสียงผู้หญิง/ผู้ชายได้) เกม และหน้าฝึกเขียนทุกภาษา

## โครงสร้าง
- `index.html` ไฟล์ที่ GitHub Pages เปิดใช้งาน (สร้างจาก `src/` ด้วยสคริปต์ ห้ามแก้ตรง)
- `src/app.html` โครงหน้าแอปและโค้ดหลัก · `src/ext.js` / `src/ext.css` ระบบล็อกอิน เกมใหม่ ฝึกเขียน เสียง · `src/config.json` ค่า Supabase (publishable key ใช้บนเว็บได้)
- เนื้อหาบทเรียนถูกเข้ารหัสไว้ใน `index.html` ไฟล์เนื้อหาแบบอ่านได้ (`src/data.json`) ไม่ถูกเก็บใน git
- `supabase/schema.sql` ตารางผู้ใช้ สิทธิ์แอดมิน และความคืบหน้า

## แก้เนื้อหาแล้ว build ใหม่
```
pip install cryptography
NONGPAK_PW='<รหัสเนื้อหา>' python3 tools/extract.py   # ถอดเนื้อหาเป็น src/data.json
# แก้ src/data.json หรือ src/*.js/css
NONGPAK_PW='<รหัสเนื้อหา>' python3 tools/build.py     # สร้าง index.html ใหม่
```

© 2026 Koel สงวนลิขสิทธิ์ ดูรายละเอียดใน [LICENSE](LICENSE)
