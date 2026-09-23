# Kinhlac.online 3D functional parity — clean-room checklist

Updated: 2026-09-23

This project reproduces interaction capabilities, not proprietary models, styling, source code, or bulk text from kinhlac.online.

## Publicly observable / publicly described functions

| Function | HIU Atlas state |
| --- | --- |
| Interactive 3D meridian viewer in browser | Implemented |
| Rotate 3D body | Implemented |
| Zoom / pinch / wheel | Implemented |
| Show 12 primary meridians | Implemented simultaneously or one-by-one |
| Click/tap an acupoint to inspect | Implemented |
| Search for an acupoint | Implemented by code/name/body region |
| Fly camera to searched acupoint | Implemented |
| Direct browser learning without install | Implemented as static GitHub Pages |
| Point catalogue linked to 3D | Implemented for 361 standard meridian points |
| Point identification metadata | Implemented with Vietnamese terminology when official FHIR source is reachable at build; Pinyin/Han fallback |
| Anatomical reference around point | Implemented with controlled surface region + anatomical landmarks |
| Meridian-first simplified anatomy background | Implemented with surface / compact landmark muscle / skeleton presets |

## HIU Atlas additions

- 14-channel educational layer: 12 primary meridians + Ren/CV + Du/GV.
- Left/right/both side filtering.
- Per-meridian color coding.
- Point pulse and channel flow animation, with reduced-motion support.
- Previous/next point navigation.
- Vietnamese terminology fetched from the Vietnam Ministry of Health FHIR CodeSystem during build, with deterministic local fallback.
- Controlled anatomy regions/landmarks from TARA, without copying WHO prose or clinical needling instructions.
- BodyParts3D registration workflow remains separately labeled from schematic/unverified coordinates.

## Guardrails

- No proprietary kinhlac.online 3D assets, source code, layout, or bulk text are copied.
- No unverified 3D coordinate is promoted to FACULTY_REVIEWED/PUBLISHED.
- Clinical needling depth, angle, and treatment claims are not generated from missing data.


## Nguồn mở rộng và nguyên tắc áp dụng chọn lọc — 2026-09-23

Các nguồn dưới đây chỉ dùng để đối chiếu phương pháp, vùng giải phẫu, topology hoặc trải nghiệm công khai; không sao chép tài sản/mã nguồn độc quyền.

| Nguồn | Vai trò trong HIU Atlas | Chính sách |
| --- | --- | --- |
| kinhlac.online/xem-3d | Tham khảo UX công khai: xoay, chọn kinh, chọn huyệt, bay camera, mô hình ưu tiên kinh–huyệt | Chỉ học mô hình tương tác; không sao chép mã, mesh, layout hoặc nội dung |
| WHO Standard Acupuncture Point Locations in the Western Pacific Region (2008) | Chuẩn phương pháp xác định 361 huyệt: mốc giải phẫu + B-cun + bề mặt cơ thể | Ưu tiên cao nhất cho quy tắc vị trí, nhưng không tự chuyển văn bản 2D thành “verified 3D” |
| TARA Acupoints Ontology / SciCrunch | Vùng bề mặt và mốc giải phẫu có URI cho 361 huyệt | Dùng làm evidence metadata và kiểm tra chéo vùng/mốc |
| BodyParts3D FMA7163 | Bề mặt da 3D và hệ quy chiếu giải phẫu | Điểm/đường được chiếu lên bề mặt; không thay thế chuẩn huyệt |
| Kim & Kang 2014, PMID 24761187 | Phương pháp dựng 361 huyệt trên mô hình da/xương 3D từ mốc và tỷ lệ | Tham khảo phương pháp |
| Kim & Kang 2015, PMID 26101534 | Phân nhóm điểm giải phẫu/tỷ lệ/hình thái trên đầu 3D | Tham khảo phương pháp cho vùng đầu–mặt |

### Thay đổi engine được áp dụng

- Flow của đường kinh chạy theo **thứ tự topology nguồn** từ điểm đầu đến điểm cuối của từng nhánh; không đảo chiều theo camera.
- Tốc độ particle dùng **vận tốc không gian mục tiêu** thay vì cùng một chu kỳ chuẩn hóa cho mọi kinh, giúp kinh dài không chạy quá nhanh.
- Đường/huyệt phía sau cơ thể dùng depth occlusion để không xuyên qua thân khi nhìn bên.
- Auto-rotate được làm chậm, có damping và vẫn hoạt động khi lớp kinh lạc đang bật.
- Mỗi anchor schematic mang `anatomicalEvidence` từ TARA; các override HIU vẫn cần `documentEvidence`.
- Bất kỳ tọa độ nào chưa qua thẩm định vẫn giữ `UNVERIFIED`; metadata nhiều nguồn không tự động nâng trạng thái.
