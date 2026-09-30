# Local Explorer AI - Hồ Sơ Thuyết Minh Dự Án (Competition Submission)

## 1. Thông Tin Nhận Diện Dự Án

- **Tên dự án:** Local Explorer AI
- **Tên đầy đủ:** Nền tảng Khám phá Trải nghiệm Đô thị Thông minh, Lập Lịch trình Có Khung giờ Thời gian thực ứng dụng Đồ họa 3D WebGL & Thuật toán Heuristic Tối ưu hóa Di chuyển cho TP. Hồ Chí Minh.
- **Lĩnh vực dự thi:** Đô thị Thông minh (Smart City), Đổi mới Sáng tạo Trí tuệ Nhân tạo (AI Innovation), Du lịch Số & Bảo tồn Văn hóa Bản địa.
- **Tác giả / Trưởng nhóm:** Nguyễn Trí Bảo Thắng
- **Năm hoàn thành:** 2026

---

## 2. Tính Cấp Thiết Của Đề Tài (Problem Statement)

1. **Nghịch lý của bản đồ du lịch số hiện tại:**
   - Các nền tảng bản đồ phổ biến hiện nay chỉ cung cấp thông tin không gian tĩnh (vị trí kinh độ, vĩ độ) và giờ mở cửa chung của địa điểm kinh doanh.
   - Một địa điểm mở cửa từ 8h đến 21h không đồng nghĩa với việc workshop làm gốm, lớp học nấu ăn Nam Bộ hay chuyến thuyền ngắm hoàng hôn diễn ra xuyên suốt thời gian đó. Rất nhiều du khách đến nơi gặp cảnh hụt hẫng vì hoạt động đã hết khung giờ hoặc hết chỗ.
2. **Khủng hoảng quá tải và ảo tưởng của Chatbot LLM (Hallucination Problem):**
   - Trào lưu dùng ChatGPT để lên lịch trình thường tạo ra các lịch trình thiếu tính khả thi: bịa đặt địa chỉ không có thật, tính sai thời gian di chuyển trong giao thông đô thị và gợi ý mức giá không chính xác.
3. **Bài toán kết nối kinh tế đêm và du lịch văn hóa bền vững:**
   - Các cơ sở thủ công truyền thống, quán cà phê bít tất di sản và không gian văn hóa bản địa tại TP. Hồ Chí Minh rất khó tiếp cận đúng du khách vào đúng khung giờ rảnh rỗi.

---

## 3. Giải Pháp & Đột Phá Công Nghệ

**Local Explorer AI** giải quyết bài toán bằng hệ thống công nghệ phối hợp 4 trụ cột:

1. **Mô hình Dữ liệu 3 Cấp (POI → Experience → Slot):** Tách bạch rõ giữa Địa điểm, Hoạt động cụ thể và Khung giờ thực tế có sức chứa.
2. **Thuật toán Heuristic Planner Toán học:** Lập lịch trình tất định (deterministic), không ảo tưởng, tối ưu hóa đồng thời 4 yếu tố: Sở thích, Ngân sách, Khung giờ mở và Ma trận cự ly di chuyển Haversine.
3. **Giao diện Không Gian 3D WebGL (Three.js):** Nâng tầm trải nghiệm thị giác với Digital Twin thành phố Sài Gòn, camera xoay thị sai và thẻ tương tác 3D Tilt.
4. **Tính Minh Bạch Tuyệt Đối (Data Transparency):** Đánh dấu trạng thái khả thi rõ ràng (`feasible` vs `tentative`), giải thích lý do đề xuất qua Reason Codes.
