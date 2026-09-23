# HIU YHCT 3D Atlas

Nền tảng 3D học **kinh lạc – huyệt vị** cho sinh viên Y học cổ truyền HIU. Kiến trúc hiện tại ưu tiên bề mặt cơ thể và các mốc giải phẫu cần thiết thay vì tải toàn bộ hệ cơ chi tiết.

**Live:** https://drngovothiennhan.github.io/human-atlas/

## Phạm vi hiện tại

- Hiển thị kinh lạc và huyệt vị trên mô hình 3D.
- Lớp cơ dùng nhóm cơ mốc bề mặt chọn lọc từ BodyParts3D.
- Xương và khớp là lớp tham chiếu, chỉ tải khi người học chủ động bật.
- Có tìm kiếm, chọn cấu trúc, cô lập, xoay, phóng to/thu nhỏ và chế độ học YHCT.
- Có kiểm tra nội dung, unit test, build, browser smoke và GitHub Pages gate trước khi phát hành.

## Chạy cục bộ

Yêu cầu Node.js 22.13 trở lên.

```sh
npm ci
npm run dev
```

## Kiểm tra

```sh
npm run content:validate
npm run source:furia:validate
npm run check
node scripts/validate-atlas.mjs
node --experimental-strip-types scripts/validate-interactions.mjs
npm test
npm run build
node scripts/browser-smoke.mjs
```

## Dữ liệu và nguồn

BodyParts3D là nguồn chính cho mô hình cơ thể và cơ mốc bề mặt. Lớp xương và khớp tham chiếu dùng dữ liệu đã ghim theo commit và giấy phép được khai báo trong `app/reference-anatomy.ts` và hồ sơ attribution của dự án.

Ứng dụng phục vụ học tập, không dùng để chẩn đoán hoặc hướng dẫn thủ thuật trên người.

## Triển khai

Production được build và kiểm tra bằng GitHub Actions, sau đó phát hành qua GitHub Pages.
