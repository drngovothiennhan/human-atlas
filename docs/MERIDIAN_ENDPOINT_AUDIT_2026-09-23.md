# Kiểm tra đầu-cuối kinh và vị trí huyệt — 2026-09-23

Checkpoint bảo toàn trước kiểm tra: `checkpoint/2026-09-23-dabd37f-stable` tại `dabd37ffb7d6ebc13294d98f3f2e078c78bc8281`.

## Nguồn đối chiếu

- Tài liệu người dùng cung cấp: **Huyệt Vị Kinh Lạc Cơ Thể Người — Ngô Trung Triều**, NXB Hồng Đức; mapping trang hiện lưu tại `content/references/ngo-trung-trieu-huyet-vi-kinh-lac.json`.
- Danh mục 361 huyệt/14 kinh của dự án.
- Topology nguồn mở FuriaRozkwit/acupuncture-3d tại commit ghim `1fc9ec98d365c9fb035844e2775c1be05a0a05fc`.
- BodyParts3D chỉ là hệ tọa độ/giải phẫu nền; không tự biến minh họa 2D thành tọa độ 3D đã xác minh.

## Đầu và cuối 14 kinh/mạch

| Kinh/mạch | Bắt đầu | Vị trí giải phẫu định hướng | Kết thúc | Vị trí giải phẫu định hướng | Trang Ngô Trung Triều |
|---|---|---|---|---|---|
| LU Phế | LU-1 Zhongfu | ngực trước-trên, ngoài đường giữa | LU-11 Shaoshang | bờ quay ngón cái, sát góc móng | PDF 9–11 |
| LI Đại trường | LI-1 Shangyang | bờ quay ngón trỏ, sát góc móng | LI-20 Yingxiang | rãnh mũi-má, ngang cánh mũi | PDF 12–14 |
| ST Vị | ST-1 Chengqi | dưới đồng tử, vùng bờ dưới ổ mắt | ST-45 Lidui | bờ ngoài ngón chân II, sát góc móng | PDF 15–20 |
| SP Tỳ | SP-1 Yinbai | bờ trong ngón cái chân, sát góc móng | SP-21 Dabao | thành ngực bên, vùng đường nách giữa | PDF 20–23 |
| HT Tâm | HT-1 Jiquan | hõm nách | HT-9 Shaochong | bờ quay ngón út, sát góc móng | PDF 24–25 |
| SI Tiểu trường | SI-1 Shaoze | bờ trụ ngón út, sát góc móng | SI-19 Tinggong | trước bình tai | PDF 26–28 |
| BL Bàng quang | BL-1 Jingming | góc mắt trong | BL-67 Zhiyin | bờ ngoài ngón chân V, sát góc móng | PDF 29–36 |
| KI Thận | KI-1 Yongquan | gan bàn chân | KI-27 Shufu | dưới xương đòn, cạnh ức | PDF 37–41 |
| PC Tâm bào | PC-1 Tianchi | ngực trước-bên | PC-9 Zhongchong | đầu ngón giữa | PDF 42–44 |
| TE Tam tiêu | TE-1 Guanchong | bờ trụ ngón áp út, sát góc móng | TE-23 Sizhukong | đầu ngoài lông mày | PDF 45–48 |
| GB Đởm | GB-1 Tongziliao | phía ngoài góc mắt ngoài | GB-44 Zuqiaoyin | bờ ngoài ngón chân IV, sát góc móng | PDF 49–52 |
| LR Can | LR-1 Dadun | bờ ngoài ngón cái chân, sát góc móng | LR-14 Qimen | ngực trước, khoang liên sườn VI vùng đường trung đòn | PDF 53–56 |
| CV Nhâm | CV-1 Huiyin | đáy chậu | CV-24 Chengjiang | rãnh cằm-môi | PDF 57–60 |
| GV Đốc | GV-1 Changqiang | giữa hậu môn và chóp xương cụt | GV-28 Yinjiao | mặt trong môi trên/vùng lợi trên | PDF 60–64 |

## Kết quả đối chiếu với dữ liệu hiện tại

1. **Danh mục và topology: PASS 14/14** — mã huyệt đầu/cuối trong `content/meridians/meridians.json` khớp topology nguồn đang dùng.
2. **BL-39: KHÔNG ĐƯỢC TỰ NỐI** — topology nguồn không chứa BL-39. Nhánh hiện có giữ nguyên BL-38 → BL-40 → BL-55. Đây là thiếu dữ liệu hình học nguồn, không được suy diễn.
3. **Tọa độ 3D: CHƯA ĐƯỢC NÂNG TRẠNG THÁI** — các anchor nguồn vẫn phải giữ `UNVERIFIED / LICENSED_SCHEMATIC` cho tới khi đối chiếu trực quan từng huyệt với hình trong tài liệu và mốc giải phẫu BodyParts3D.
4. **QC vùng mặt — đợt hiệu chỉnh HIU tiếp theo:** LI-20, ST-1, BL-1, TE-23, GB-1, CV-24 và GV-28 đã được chuyển sang override giải phẫu riêng để bám sát mốc trên hình/tài liệu hơn; vendor gốc không bị sửa. Các điểm này vẫn giữ trạng thái `UNVERIFIED` cho đến khi browser smoke và đối chiếu trực quan trên mô hình thật hoàn tất.
5. **Quy tắc phát hành:** chỉ merge thay đổi vị trí khi có bằng chứng trang/hình + mốc giải phẫu + kiểm thử browser; không gán nhãn “verified” từ hình 2D một mình.

## Regression guard

`tests/meridian-endpoints.test.mjs` khóa:
- đúng huyệt đầu/cuối cho đủ 14 kinh/mạch;
- ánh xạ SJ→TE, REN→CV, DU→GV;
- không được tự phát sinh BL-39 vào topology;
- bảo toàn chuỗi nhánh BL-38 → BL-40 → BL-55 của nguồn hiện hành.
