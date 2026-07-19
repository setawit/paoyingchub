import { defineConfig } from 'vite';

// ใช้ base แบบ relative ('./') เพื่อให้ build แล้วเปิดไฟล์ dist/index.html
// ได้ทั้งบน static server และผ่าน path ย่อย โดยไม่ต้องตั้งค่าเพิ่ม
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
