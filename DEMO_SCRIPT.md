# Local Explorer AI - Kịch bản Thuyết trình Demo (Demo Script)

Tài liệu này được biên soạn nhằm hướng dẫn người thuyết trình hoặc ban giám khảo thực hiện buổi trình diễn (Live Demo) hệ thống **Local Explorer AI** trong khoảng thời gian từ **5 đến 7 phút**.

---

## ⏱️ Tổng quan thời lượng Demo

| Thời lượng | Phân đoạn | Mục tiêu chính |
| :---: | :--- | :--- |
| **0:00 - 0:45** | Mở đầu & Giới thiệu bài toán | Nêu nghịch lý "Có trên bản đồ ≠ Có thể trải nghiệm ngay lúc đến" |
| **0:45 - 2:00** | Khám phá Hero 3D WebGL Sài Gòn | Trình diễn tương tác 3D Canvas, xoay chuột, xem điểm ghim radar |
| **2:00 - 3:30** | Khám phá Trải nghiệm & Bộ lọc Đa chiều | Lọc theo mục đích (ẩm thực, thủ công), thử thẻ 3D Tilt |
| **3:30 - 4:45** | Lập lịch trình Thông minh 3 Bước | Điền thông số, quan sát Thẻ xem trước 3D Live Day Preview |
| **4:45 - 5:45** | Dòng thời gian Hành trình 3D & Lý giải AI | Khảo sát 4 KPI cards, laser timeline và tính minh bạch Feasibility |
| **5:45 - 6:30** | Cổng Đối tác & Kết luận | Giới thiệu Workspace quản lý slot và tổng kết giá trị cho TP. HCM |

---

## 🚀 Kịch bản chi tiết từng bước

### Bước 1: Mở đầu & Giới thiệu Bài toán (0:00 - 0:45)
- **Hành động:** Mở trang chủ tại `http://localhost:5173`.
- **Lời dẫn thuyết trình:**
  > *"Kính thưa Ban Giám khảo, khi du lịch tại TP. Hồ Chí Minh, hầu hết chúng ta đều dùng Google Maps. Nhưng một địa điểm mở cửa không có nghĩa là hoạt động trải nghiệm tại đó đang diễn ra. Khách đến nơi thường gặp tình trạng workshop đã hết giờ hoặc kín chỗ đặt trước. Local Explorer AI ra đời để giải quyết bài toán: **Khám phá đúng trải nghiệm, vào đúng thời điểm**."*

### Bước 2: Trình diễn Không gian 3D WebGL (0:45 - 2:00)
- **Hành động:** Di chuột trên khung nhìn 3D thành phố Sài Gòn, rê chuột vào các điểm ghim POI, bấm nút đổi chế độ Đêm Neon / Ban Ngày.
- **Lời dẫn thuyết trình:**
  > *"Trước mắt quý vị là Bản sao số hóa (Digital Twin) 3D của Sài Gòn được render trực tiếp bằng Three.js. Hệ thống cao ốc phát sáng, dòng sông Sài Gòn phản quang và các điểm ghim 3D phát xung radar tỏa sóng. Khi di chuyển chuột, góc nhìn camera tự động xoay thị sai mượt mà, cho phép du khách cảm nhận nhịp sống thành phố một cách trực quan và sống động nhất."*

### Bước 3: Khám phá Trải nghiệm & Bộ lọc Đa chiều (2:00 - 3:30)
- **Hành động:** Bấm vào nút *Khám phá trải nghiệm* (`/explore`). Chọn tag *Thủ công*, chỉnh ngân sách và số người.
- **Lời dẫn thuyết trình:**
  > *"Tại trang Khám phá, mỗi hoạt động như làm giấy Dó, nếm cà phê bít tất hay làm gốm đều được hiển thị dạng Thẻ 3D Tilt có hiệu ứng vệt sáng gương. Bản đồ CartoDB bên phải tự động bay đến đúng tọa độ và đồng bộ với danh sách."*

### Bước 4: Lập Lịch trình & Thẻ Xem Trước 3D (3:30 - 4:45)
- **Hành động:** Điều hướng sang `/planner`. Điền ngày mai, từ 09:00 đến 16:00, nhóm 2 người, ngân sách 1.200.000₫. Chọn sở thích *Ẩm thực* và *Thủ công*.
- **Lời dẫn thuyết trình:**
  > *"Đây là Wizard lập lịch thông minh 3 bước. Xin Ban giám khảo chú ý vào Thẻ Xem Trước 3D bên phải: Khi tôi thay đổi thời gian hoặc chọn thêm sở thích, thẻ tự động tính toán tổng số giờ, chi phí bình quân mỗi người và phương tiện tối ưu theo thời gian thực."*

### Bước 5: Dòng Thời Gian Hành Trình & Lý Giải AI (4:45 - 5:45)
- **Hành động:** Bấm *Tạo Lịch Trình Ngay*. Trang `/itinerary/:id` hiện ra với 4 thẻ KPI 3D phát sáng.
- **Lời dẫn thuyết trình:**
  > *"Chỉ trong chưa đầy 50ms, thuật toán Heuristic đã tạo ra một hành trình hoàn chỉnh. Dòng thời gian 3D nối các điểm bằng đường ray laser và hiển thị rõ thời gian di chuyển dự kiến giữa các quận. Đặc biệt, phía dưới có Thẻ Lý Giải Minh Bạch (Reason Codes) cho biết vì sao AI đề xuất hoạt động này, đồng thời đánh dấu rõ hoạt động nào cần gọi xác nhận trước."*

### Bước 6: Cổng Đối Tác & Kết Luận (5:45 - 6:30)
- **Hành động:** Bấm sang `/provider` để lướt qua bảng quản trị slot.
- **Lời dẫn thuyết trình:**
  > *"Local Explorer AI không chỉ phục vụ du khách mà còn đồng hành cùng các nghệ nhân, xưởng thủ công truyền thống qua Cổng Đối tác. Với kiến trúc mở, dữ liệu minh bạch và đồ họa 3D đẳng cấp, dự án kỳ vọng sẽ góp phần thúc đẩy du lịch thông minh và bảo tồn di sản văn hóa TP. Hồ Chí Minh. Xin cảm ơn Ban Giám khảo!"*
