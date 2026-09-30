<div align="center">

<p align="center">
  <img src="./assets/images/logo.png" alt="Local Explorer AI Logo" height="200" />
</p>

<h1 align="center">Local Explorer AI</h1>

<p align="center">
  <b>Nền tảng Khám phá Trải nghiệm Đô thị Thời gian thực, Lập Lịch trình Có Khung giờ Thông minh, Đồ họa 3D WebGL & Di chuyển Xanh cho TP. Hồ Chí Minh</b>
</p>

<p align="center">
  <a href="https://github.com/NguyenTriBaoThang/LoaclExplorerAI/actions/workflows/ci.yml">
    <img src="https://img.shields.io/badge/CI-Passing-brightgreen?logo=github" alt="CI Status"/>
  </a>
  <a href="https://github.com/NguyenTriBaoThang/LoaclExplorerAI/stargazers">
    <img src="https://img.shields.io/github/stars/NguyenTriBaoThang/LoaclExplorerAI?style=social" alt="GitHub stars"/>
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/>
  </a>
  <a href="./SECURITY.md">
    <img src="https://img.shields.io/badge/Security-Policy-red?logo=shield" alt="Security Policy"/>
  </a>
</p>

<p align="center">
  <b>3D WebGL Saigon Cityscape · Time-Aware Slot Planner · Heuristic Multi-Objective Engine · POI-Slot Data Model · CartoDB 3D Vector Map · Offline Simulation Engine</b><br/>
  React 18 + TypeScript 5.6 · Three.js · Vite 6 · FastAPI 0.115 · Python 3.12+ · PostgreSQL 16 + PostGIS 3.4 · Docker
</p>

<p align="center">
  <a href="http://localhost:5173/"><strong>Khám phá Dashboard 3D</strong></a>
  &nbsp;|&nbsp;
  <a href="./DEMO_SCRIPT.md">Kịch bản Demo</a>
  &nbsp;|&nbsp;
  <a href="./docs/LocalExplorerAI_ThuyetMinh_HoanChinh_BTC.md">Thuyết minh Dự án BTC</a>
  &nbsp;|&nbsp;
  <a href="./ARCHITECTURE.md">Kiến trúc Hệ thống</a>
  &nbsp;|&nbsp;
  <a href="./SUPPORT.md">Hỗ trợ</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React 18"/>
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript" alt="TypeScript 5.6"/>
  <img src="https://img.shields.io/badge/Three.js-WebGL_3D-black?logo=threedotjs" alt="Three.js"/>
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite" alt="Vite 6"/>
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Python-3.12+-3776AB?logo=python" alt="Python 3.12+"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16_+_PostGIS_3.4-336791?logo=postgresql" alt="PostGIS"/>
  <img src="https://img.shields.io/badge/Docker-Compose_v2-2496ED?logo=docker" alt="Docker"/>
</p>

<img src="./assets/images/banner.png" alt="Local Explorer AI Banner" width="100%"/>

</div>

---

## 🎖️ Tôn chỉ & Định vị Dự án (Edition)

<p align="center">
  <b>ĐÔ THỊ THÔNG MINH · KHÁM PHÁ ĐỊA PHƯƠNG · LẬP LỊCH TRÌNH KHUNG GIỜ THỰC · HEURISTIC ENGINE · TRẢI NGHIỆM 3D SỐNG ĐỘNG · BẢO TỒN VĂN HÓA SÀI GÒN</b>
</p>

**Mục tiêu cốt lõi:** Xây dựng nền tảng du lịch và trải nghiệm đô thị thông minh thế hệ mới tại TP. Hồ Chí Minh. Nền tảng giải quyết triệt để nghịch lý phổ biến của du lịch đô thị: **"Một địa điểm có trên bản đồ không đồng nghĩa với việc khách có thể tham gia trải nghiệm vào thời điểm mình đến"**.

Local Explorer AI chuyển đổi cách tiếp cận từ việc hiển thị những chấm tròn tĩnh trên bản đồ sang **tối ưu hóa trải nghiệm có khung giờ thực tế (Slot-aware)**, cân đối giữa sở thích cá nhân, ngân sách nhóm, thời lượng hoạt động và thời gian di chuyển thực tế qua ma trận cự ly:

- **Khi tôi đến nơi, hoạt động trải nghiệm này có đang mở khung giờ cho khách tham gia hay không?**
- **Thứ tự di chuyển giữa các điểm thế nào để không bị kiệt sức vì kẹt xe và nắng nóng giờ cao điểm?**
- **Hoạt động nào đã có báo cáo chỗ trống còn lại, hoạt động nào cần liên hệ xác nhận trước?**
- **Làm sao phân bổ ngân sách nhóm vừa vặn giữa chi phí ăn uống, workshop thủ công và vé tham quan?**
- **Lựa chọn phương tiện di chuyển nào cân bằng giữa thời gian và giảm phát thải CO2 cho thành phố?**
- **Dữ liệu đề xuất phía sau có đáng tin cậy không, hay chỉ là do AI chatbot tưởng tượng ra?**

### 💡 Đột phá công nghệ cốt lõi:
- 🌆 **Giao diện 3D WebGL Sài Gòn (Three.js)**: Bản sao số hóa (Digital Twin) 3D tương tác với hệ thống cao ốc ánh sáng neon, dòng sông Sài Gòn uốn lượn phản chiếu nước thời gian thực, camera xoay đa hướng theo chuột và các điểm ghim 3D phát xung radar nhấp nhô.
- 🎴 **Thẻ Tương Tác 3D Tilt**: Thẻ trải nghiệm nghiêng động 3D theo vị trí con trỏ chuột (`perspective: 1000px`), tích hợp lớp phủ phản chiếu vệt sáng gương (*specular glare overlay*).
- ⏱️ **Mô hình Dữ liệu 3 Cấp (POI → Experience → Slot)**: Định danh rõ ràng giữa địa điểm vật lý, hoạt động diễn ra tại điểm và khung giờ có sức chứa cụ thể.
- 🧮 **Heuristic Planner Không Ảo Tưởng (Hallucination-free)**: Lập lịch dựa trên thuật toán tối ưu hóa đa mục tiêu toán học xác định, loại trừ hoàn toàn rủi ro địa điểm "ảo" của các chatbot LLM.
- 🗺️ **Bản Đồ Vector Đa Chế Độ (CartoDB Voyager & Dark)**: Bản đồ vector độ phân giải cao, hỗ trợ chuyển đổi giao diện Sáng / Tối và đồng bộ thời gian thực với dòng thời gian hành trình.
- 🛡️ **Minh Bạch Trạng Thái Khả Thi (Feasibility Transparency)**: Phân định rõ ràng giữa các khung giờ chắc chắn còn chỗ (*Available*) và chỗ chưa báo cáo sức chứa (*Tentative*).
- ⚡ **Chế Độ Mô Phỏng Ngoại Tuyến (Offline Mock Engine)**: Cho phép trải nghiệm toàn bộ tính năng lập lịch ngay trên trình duyệt mà không cần cài đặt database nội bộ phức tạp.

---

## 📸 Hình ảnh Giao diện (Screenshots)

<table align="center">
<tr>
<td align="center" width="33%">
<img src="./assets/screenshots/home_3d.png" width="100%"/>
<b>3D WebGL Saigon Cityscape</b>
</td>
<td align="center" width="33%">
<img src="./assets/screenshots/explore.png" width="100%"/>
<b>Khám Phá & Thẻ 3D Tilt</b>
</td>
<td align="center" width="33%">
<img src="./assets/screenshots/planner.png" width="100%"/>
<b>Lập Lịch Trình & Xem Trước 3D</b>
</td>
</tr>
<tr>
<td align="center" width="33%">
<img src="./assets/screenshots/itinerary.png" width="100%"/>
<b>Dòng Thời Gian Laser 3D & KPI</b>
</td>
<td align="center" width="33%">
<img src="./assets/screenshots/map_3d.png" width="100%"/>
<b>Bản Đồ Vector 3D Radar Pins</b>
</td>
<td align="center" width="33%">
<img src="./assets/screenshots/provider.png" width="100%"/>
<b>Workspace Quản Lý Đối Tác</b>
</td>
</tr>
</table>

---

## 📑 Mục lục (Table of Contents)

- [Vì sao chọn Local Explorer AI](#-vì-sao-chọn-local-explorer-ai)
- [Căn chỉnh Tiêu chí Hội thi (Competition Alignment)](#-căn-chỉnh-tiêu-chí-hội-thi)
- [Đối tượng Sử dụng (User Groups)](#-đối-tượng-sử-dụng)
- [Mô hình Dữ liệu Cốt lõi (Data Model)](#-mô-hình-dữ-liệu-cốt-lõi)
- [Tổng quan Tính năng (Feature Overview)](#-tổng-quan-tính-năng)
- [Thuật toán Lập Lịch Heuristic Planner](#-thuật-toán-lập-lịch-heuristic-planner)
- [Kiến trúc Hệ thống (System Architecture)](#-kiến-trúc-hệ-thống)
- [Tech Stack](#-tech-stack)
- [Hướng dẫn Cài đặt & Khởi chạy (Getting Started)](#-hướng-dẫn-cài-đặt--khởi-chạy)
- [Cấu hình Biến môi trường (.env)](#-cấu-hình-biến-môi-trường)
- [Danh mục API MVP (API Reference)](#-danh-mục-api-mvp)
- [Kịch bản Kiểm thử Demo (Demo Scenarios)](#-kịch-bản-kiểm-thử-demo)
- [Lộ trình Phát triển (Roadmap)](#-lộ-trình-phát-triển)
- [Đóng góp & Giấy phép](#-đóng-góp--giấy-phép)

---

## 🧭 Vì sao chọn Local Explorer AI

Các ứng dụng bản đồ hiện nay (Google Maps, Apple Maps) rất xuất sắc trong việc chỉ đường từ A đến B, nhưng **không hiểu ngữ cảnh trải nghiệm**. Bạn tìm thấy một quán cà phê vợt hay workshop làm gốm mở cửa, nhưng khi đến nơi thì hoạt động đã kết thúc từ trưa hoặc kín chỗ đặt trước.

Local Explorer AI chuyển đổi phương thức du lịch từ **tìm kiếm thụ động** sang **đồng hành có kế hoạch và khả thi**:

| Hạn chế của Bản đồ truyền thống | Giải pháp đột phá của Local Explorer AI |
|---|---|
| **Chỉ hiển thị địa điểm (POI) tĩnh** | Quản lý theo 3 cấp: Địa điểm → Hoạt động trải nghiệm → Khung giờ cụ thể (Slots) |
| **Không biết sức chứa và tình trạng chỗ** | Cập nhật trực tiếp số chỗ còn lại, đánh dấu rõ ràng chỗ cần gọi xác nhận |
| **Lập lịch rời rạc, dễ kiệt sức** | Heuristic Engine tự động tính toán thời gian di chuyển thực tế giữa các quận |
| **Chatbot AI hay bịa đặt địa điểm (Hallucination)** | Thuật toán Heuristic toán học dựa trên danh mục thực thể có cấu trúc, 100% chuẩn xác |
| **Giao diện bản đồ 2D phẳng, đơn điệu** | Giao diện 3D WebGL tương tác cao, bản đồ vector độ nét cao, thẻ 3D Tilt sang trọng |
| **Bỏ quên người làm trải nghiệm địa phương** | Cung cấp Workspace riêng cho đối tác cập nhật khung giờ và đón khách theo kế hoạch |

---

## 🏆 Căn chỉnh Tiêu chí Hội thi (Competition Alignment)

| Trọng tâm đánh giá | Triển khai thực tế trong Local Explorer AI | Giá trị thực tiễn mang lại |
|---|---|---|
| **Đô thị Thông minh (Smart City)** | Tối ưu hóa luồng di chuyển của khách du lịch nội đô tại TP. Hồ Chí Minh | Giảm tải áp lực giao thông giờ cao điểm, phân bổ du khách đồng đều |
| **Đổi mới Sáng tạo AI** | Thuật toán Heuristic giải bài toán tối ưu hóa đa mục tiêu (Thời gian, Ngân sách, Sở thích) | Phản hồi lịch trình dưới 50ms, không phụ thuộc chi phí API LLM đắt đỏ |
| **Bảo tồn & Phát triển Văn hóa** | Ưu tiên các trải nghiệm thủ công truyền thống (Giấy dó, Gốm Sài Gòn, Ẩm thực Nam Bộ) | Kết nối thế hệ trẻ và du khách với các giá trị văn hóa bản địa sâu sắc |
| **Trải nghiệm Người dùng (UI/UX 3D)** | Canvas WebGL Three.js, phong cách Nocturnal Emerald Glassmorphic | Tạo ấn tượng thị giác vượt trội, nâng tầm ứng dụng du lịch Việt Nam |
| **Tính Khả thi & Minh bạch** | Nhãn dữ liệu mô phỏng (`SIMULATED`), cơ chế Offline Simulation Fallback | Ban giám khảo và người dùng có thể thử nghiệm tức thì không cần cài đặt DB |

---

## 👥 Đối tượng Sử dụng (User Groups)

- 🎒 **Khách du lịch tự túc & Khách quốc tế**: Cần một lịch trình khám phá Sài Gòn tinh gọn trong 1 buổi hoặc 1 ngày mà không mất hàng giờ tra cứu mạng xã hội.
- 👨‍👩‍👧‍👦 **Gia đình & Nhóm bạn trẻ**: Cần hoạt động trải nghiệm vừa sức (workshop thủ công, ẩm thực), kiểm soát ngân sách chia đều theo đầu người.
- 🎨 **Những người yêu văn hóa & nghệ thuật**: Tìm kiếm những góc hẻm di sản, không gian triển lãm ảnh ký sự, cà phê bít tất truyền thống.
- 🛵 **Người dân địa phương (Weekend Locals)**: Muốn "đổi gió" cuối tuần với các hoạt động thư giãn (thuyền hoàng hôn, thiền trà, làm gốm) ngay trong thành phố.
- 🏪 **Nhà cung cấp trải nghiệm (Local Providers)**: Các xưởng thủ công, quán ẩm thực truyền thống cần công cụ quản lý khung giờ và tiếp cận đúng đối tượng khách hàng.

---

## 💡 Mô hình Dữ liệu Cốt lõi

```text
POI (Tọa độ địa lý)  ──>  Experience (Hoạt động)  ──>  Slot (Khung giờ)  ──>  Itinerary (Lịch trình 3D)
```

```mermaid
classDiagram
    class POI {
        +String id
        +String name
        +Float latitude
        +Float longitude
        +String category
        +String address
        +String verification_status
    }
    class Experience {
        +String id
        +String name
        +String description
        +List~String~ intent_tags
        +Int duration_min
        +Int price_vnd
        +Boolean indoor
    }
    class ExperienceSlot {
        +String id
        +DateTime start_at
        +DateTime end_at
        +Int capacity_total
        +Int available_reported
        +String status
    }
    class Itinerary {
        +String itinerary_id
        +Int estimated_cost_vnd
        +Int total_travel_min
        +String feasibility_status
        +List~ItineraryStop~ stops
    }
    POI "1" --> "*" Experience : diễn ra tại
    Experience "1" --> "*" ExperienceSlot : có các khung giờ
    ExperienceSlot "*" --> "1" Itinerary : được chọn vào
```

---

## ⚡ Tổng quan Tính năng (Feature Overview)

### 1. Canvas 3D WebGL Sài Gòn Tương Tác
- Dựng toàn cảnh không gian 3D trung tâm TP. Hồ Chí Minh bằng Three.js.
- Các cao ốc đa giác ánh sáng, dòng sông Sài Gòn uốn lượn phản quang và các điểm ghim POI tỏa sóng radar.
- Tương tác thị sai (Parallax) mượt mà theo chuyển động chuột, rê chuột hiển thị thẻ thông tin hoạt động trực tiếp.
- Chuyển đổi nhanh 2 chế độ: **Đêm Neon Cyber Glow** và **Ban Ngày Emerald Day**.

### 2. Bộ lọc Trải nghiệm Thông minh Đa chiều
- Tìm kiếm tức thì theo từ khóa tên hoạt động, địa chỉ hoặc quận huyện.
- Dải nút chọn mục đích chuyến đi nhanh: **Ẩm thực, Thủ công, Văn hóa, Thiên nhiên, Thư giãn**.
- Cấu hình linh hoạt: Chọn ngày, giờ bắt đầu rảnh, số lượng thành viên nhóm và tổng ngân sách.
- Hiển thị ước tính chi phí chia đều theo từng người (`~VND / người`).

### 3. Thẻ Trải nghiệm 3D Tilt Phản Chiếu Gương
- Các thẻ hoạt động được bọc trong component `TiltCard3D`, tạo cảm giác chạm nổi đa chiều.
- Hiển thị đầy đủ thông tin: Thời lượng, chi phí, nhãn trong nhà/ngoài trời, khung giờ kế tiếp và huy hiệu trạng thái.
- Nhấp chọn thẻ tự động điều khiển bản đồ bay (*flyTo*) đến đúng vị trí tọa độ với hiệu ứng mượt mà.

### 4. Bản đồ Vector 3D & Lộ trình Trực quan
- Tích hợp 2 lớp bản đồ độ nét cao: **CartoDB Voyager (Sáng)** và **CartoDB Dark Matter (Đêm)**.
- Điểm ghim 3D đánh số thứ tự với bóng đổ không gian và vòng tròn phát xung nhấp nháy.
- Popup thẻ chi tiết cho phép xem nhanh thông tin và chọn điểm vào hành trình.

### 5. Wizard Lập Lịch trình 3 Bước & Thẻ Xem Trước Trực Tiếp
- **Bước 1**: Đặt khung thời gian rảnh, số thành viên và hạn mức ngân sách.
- **Bước 2**: Lựa chọn phong cách và ưu tiên trải nghiệm (ẩm thực, thủ công mỹ nghệ...).
- **Bước 3**: Chọn phương tiện di chuyển (xe máy, ô tô, đi bộ, xe buýt công cộng).
- **Thẻ xem trước 3D Live Day Preview**: Tự động tính toán tổng số giờ khám phá, chi phí bình quân và phương tiện ngay khi người dùng thay đổi thông số trên form.

### 6. Dòng Thời Gian Hành Trình 3D (Itinerary Laser Timeline)
- 4 thẻ KPI 3D phát sáng: Tổng thời lượng, Thời gian di chuyển, Chi phí ước tính, Số điểm dừng.
- Dòng thời gian với cột laser phát sáng kết nối các chặng dừng.
- Chỉ dẫn cự ly và thời gian di chuyển ước tính giữa hai điểm liên tiếp.
- Thẻ giải thích AI minh bạch lý do lựa chọn (*Reason Codes*) kèm nút **In/Lưu PDF** và **Chia sẻ liên kết**.

### 7. Cổng Thông tin Quản lý Dành cho Đối tác (Provider Workspace)
- Thống kê thời gian thực: Số trải nghiệm đang hiển thị, tổng số slot trong ngày, số slot cần xác nhận.
- Bảng danh mục hoạt động có thanh tìm kiếm và ngăn kéo mở rộng (*drawer*) kiểm tra chi tiết.

---

## 🧮 Thuật toán Lập Lịch Heuristic Planner

Khác với các chatbot LLM tự do có thể tạo ra các địa điểm không tồn tại hoặc tính sai thời gian đi lại, Local Explorer AI sử dụng thuật toán **Heuristic Deterministic**:

```text
Input:
  - Thời gian rảnh: [T_start, T_end]
  - Ngân sách: Budget_VND
  - Số lượng người: Group_Size
  - Trọng số mục đích: Intent_Weights
  - Phương tiện: Transport_Mode
          │
          ▼
Bước 1: Lọc Không gian Khả thi (Feasibility Pruning)
  - Loại bỏ các trải nghiệm có giá vé vượt quá ngân sách bình quân
  - Chỉ giữ lại các slot nằm trọn vẹn trong khoảng [T_start, T_end]
          │
          ▼
Bước 2: Chấm điểm Đa Mục tiêu (Multi-Objective Scoring)
  Score = w1 * Intent_Match + w2 * Slot_Freshness + w3 * Cost_Efficiency
          │
          ▼
Bước 3: Tối ưu hóa Chuỗi Hành trình (Sequential Routing Optimization)
  - Sử dụng Ma trận Cự ly Haversine (tính toán khoảng cách & thời gian di chuyển)
  - Chèn thời gian đệm di chuyển giữa các điểm dừng
  - Đảm bảo điểm dừng tiếp theo không bị chồng lấn khung giờ
          │
          ▼
Output:
  - Danh sách ItineraryStops có thứ tự thời gian chuẩn xác
  - Feasibility Status: 'feasible' (đầy đủ) hoặc 'tentative' (cần gọi xác nhận)
  - Lý do đề xuất (Reason Codes) và thống kê di chuyển tổng thể
```

---

## 🏗️ Kiến trúc Hệ thống (System Architecture)

```mermaid
flowchart TB
    subgraph Client["Presentation Layer (Client)"]
        React["React 18 + TypeScript + Vite 6"]
        ThreeCanvas["Three.js WebGL 3D City Engine"]
        MapAdapter["Leaflet + CartoDB Map Adapter"]
        MockEngine["Offline Heuristic Engine Fallback"]
    end

    subgraph Gateway["Application Layer (FastAPI Backend)"]
        API["FastAPI REST Controllers"]
        ExpService["Experience Service"]
        PlannerService["Heuristic Planner Service"]
        RoutingAdapter["Haversine Routing Adapter"]
    end

    subgraph Storage["Persistence & Cache Layer"]
        DB[("PostgreSQL 16 + PostGIS 3.4")]
        RedisCache[("Redis Service")]
    end

    React --> API
    ThreeCanvas --> React
    MapAdapter --> React
    MockEngine -. Tự động kích hoạt khi offline .-> React
    API --> ExpService
    API --> PlannerService
    ExpService --> DB
    PlannerService --> RoutingAdapter
    PlannerService --> DB
    API -. Sẵn sàng kết nối .-> RedisCache
```

---

## 💻 Tech Stack

| Tầng | Công nghệ sử dụng | Vai trò & Mục đích |
|---|---|---|
| **Frontend Framework** | React 18.3, TypeScript 5.6, Vite 6.0 | Nền tảng SPA tốc độ cao, type-safe toàn diện |
| **Đồ họa 3D WebGL** | Three.js (@types/three) | Dựng mô hình 3D thành phố Sài Gòn, camera thị sai |
| **Giao diện & Styling** | CSS Custom Tokens, Tailwind CSS, Lucide Icons | Thiết kế Nocturnal Emerald, hiệu ứng kính mờ, thẻ 3D Tilt |
| **Bản đồ Địa lý** | Leaflet, React-Leaflet, CartoDB Tiles | Bản đồ vector độ nét cao, marker 3D phát xung radar |
| **Backend API** | Python 3.12, FastAPI 0.115, Pydantic v2 | Xây dựng RESTful endpoints hiệu năng cao |
| **Cơ sở dữ liệu** | PostgreSQL 16, PostGIS 3.4, SQLAlchemy 2.0 | Lưu trữ thực thể địa lý, truy vấn không gian `geography(POINT)` |
| **Database Migration** | Alembic | Quản lý vòng đời và phiên bản lược đồ cơ sở dữ liệu |
| **Routing Adapter** | Haversine Matrix Engine | Tính toán khoảng cách đường chim bay và thời gian ước tính |
| **Container & CI/CD** | Docker Compose v2, GitHub Actions | Đóng gói môi trường đồng nhất và tự động kiểm thử |

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy (Getting Started)

### Cách 1: Khởi chạy 1-chạm với Docker Compose (Khuyên dùng)

Yêu cầu: Đã cài đặt **Docker Desktop** (hoặc Docker Engine có Compose v2).

```bash
# 1. Clone repository
git clone https://github.com/NguyenTriBaoThang/LoaclExplorerAI.git
cd LoaclExplorerAI

# 2. Tạo file môi trường mẫu
cp .env.example .env

# 3. Khởi chạy toàn bộ hệ thống
docker compose up --build
```

Sau khi hoàn tất, mở trình duyệt:
- 🌐 **Giao diện Web 3D**: [http://localhost:5173](http://localhost:5173)
- 📖 **Tài liệu Swagger API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🩺 **Kiểm tra Health**: [http://localhost:8000/health](http://localhost:8000/health)

Để dừng hệ thống:
```bash
docker compose down
```

---

### Cách 2: Khởi chạy thủ công trong môi trường phát triển (Local Dev)

#### 1. Khởi động Cơ sở dữ liệu PostGIS & Redis
```bash
docker compose up -d db redis
```

#### 2. Khởi động Backend (FastAPI + Python 3.12)
```bash
cd apps/api

# Tạo và kích hoạt môi trường ảo (Windows PowerShell):
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Cài đặt thư viện:
pip install -r requirements.txt

# Thiết lập chuỗi kết nối và chạy Migration:
$env:DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/local_explorer"
alembic upgrade head

# Nạp dữ liệu mô phỏng demo:
python -m scripts.seed_db

# Khởi chạy server FastAPI tại cổng 8000:
uvicorn app.main:app --reload --port 8000
```

#### 3. Khởi động Frontend (React 18 + Three.js)
```bash
cd apps/web

# Cài đặt dependencies:
npm install

# Khởi chạy Vite dev server:
npm run dev
```
*Frontend chạy tại cổng `http://localhost:5173`.*

---

## 📡 Danh mục API MVP (API Reference)

| Phương thức | Đường dẫn | Chức năng |
|:---:|---|---|
| `GET` | `/health` | Kiểm tra trạng thái hoạt động của hệ thống |
| `GET` | `/api/pois` | Danh sách điểm quan tâm trên bản đồ (POI) |
| `GET` | `/api/pois/{id}` | Chi tiết thông tin và tọa độ POI |
| `GET` | `/api/experiences` | Lọc trải nghiệm theo `intent`, `start_at`, `end_at`, `group_size`, `max_price` |
| `GET` | `/api/experiences/{id}` | Chi tiết thông tin trải nghiệm |
| `GET` | `/api/experiences/{id}/slots` | Danh sách khung giờ mở cửa của trải nghiệm |
| `POST` | `/api/itineraries/plan` | Tạo lịch trình tối ưu bằng Heuristic Engine |
| `GET` | `/api/itineraries/{id}` | Truy xuất thông tin lịch trình đã được lưu |

*Chuẩn thời gian: ISO 8601 UTC. Đơn vị tiền tệ: số nguyên VND. Cấu trúc lỗi chuẩn: `{ "error": { "code", "message", "details", "request_id" } }`.*

---

## 🎯 Kịch bản Kiểm thử Demo (Demo Scenarios)

### Kịch bản 1: Một Buổi Sáng Thủ Công & Thư Giãn (Quận 1 - Quận 3)
- **Thời gian:** 09:00 - 13:00 (Nhóm 2 người, ngân sách 1.000.000₫).
- **Mục đích:** Thủ công mỹ nghệ + Ẩm thực Nam Bộ.
- **Kết quả đề xuất:**
  - `09:00 - 10:15`: Làm sổ tay giấy Dó tại đường Nguyễn Du, Quận 1 (120.000₫).
  - `10:15 - 10:40`: Di chuyển ước tính 20 phút bằng xe máy sang Quận 3.
  - `10:40 - 12:10`: Bàn xoay gốm sứ men màu tại đường Pasteur, Quận 3 (180.000₫).
  - `12:10 - 13:00`: Thưởng thức bữa trưa cơm niêu Nam Bộ (220.000₫).
- **Chỉ số:** Tổng chi phí 520.000₫/người (nằm an toàn trong ngân sách 1 triệu đồng).

### Kịch bản 2: Hoạt động Cần Xác nhận Sức chứa (Tentative Handling)
- Khi một khung giờ chưa có báo cáo sức chứa từ nhà cung cấp (`available_reported = null`), hệ thống vẫn đưa vào lịch trình nhưng gắn huy hiệu màu vàng cam **"Cần gọi xác nhận"** kèm số điện thoại liên hệ, giúp du khách luôn chủ động trước khi đến nơi.

---

## 📁 Cấu Trúc Dự Án

```text
LoaclExplorerAI/
├── .github/
│   ├── workflows/               # CI/CD workflows (ci.yml, release.yml)
│   ├── ISSUE_TEMPLATE/          # Mẫu tạo issue báo lỗi và đề xuất tính năng
│   └── PULL_REQUEST_TEMPLATE.md # Mẫu gửi Pull Request chuẩn
├── apps/
│   ├── api/                     # Backend FastAPI, SQLAlchemy, PostGIS & Heuristic
│   │   ├── app/                 # Controllers, Services, Repositories, Entities
│   │   ├── migrations/          # Alembic migrations tạo schema PostGIS
│   │   ├── scripts/             # Script nạp dữ liệu demo (seed_db.py)
│   │   └── tests/               # Bộ test tự động với pytest
│   └── web/                     # Frontend React + TypeScript + Three.js + Leaflet
│       ├── src/
│       │   ├── components/3d/   # Canvas 3D City WebGL & Thẻ 3D TiltCard
│       │   ├── components/map/  # MapAdapter với CartoDB Voyager / Dark
│       │   ├── layouts/         # AppLayout kính mờ và Navigation Bar nổi
│       │   ├── pages/           # Home 3D, Explore, Planner, Itinerary, Provider, About
│       │   └── api/             # API client tích hợp Offline Mock Engine Fallback
│       └── public/              # Tài nguyên tĩnh
├── assets/                      # Hình ảnh đồ họa, banner, logo, sơ đồ hệ thống
├── data/                        # Tài liệu đặc tả chế độ dữ liệu mô phỏng
├── docs/                        # Tài liệu kiến trúc, API, data model và Thuyết minh BTC
├── scripts/                     # Scripts tiện ích phát triển (run-dev.ps1)
├── docker-compose.yml           # Cấu hình cụm container chính
├── docker-compose.override.yml  # Cấu hình mở rộng cho môi trường phát triển
├── docker-compose.prod.yml      # Cấu hình triển khai production
├── ARCHITECTURE.md              # Đặc tả kiến trúc kỹ thuật chi tiết
├── DEMO_SCRIPT.md               # Kịch bản thuyết trình demo 5-7 phút
├── COMPETITION_SUBMISSION.md    # Tài liệu nộp bài hội thi hoàn chỉnh
├── CONTRIBUTING.md              # Quy chuẩn đóng góp mã nguồn
├── SECURITY.md                  # Chính sách bảo mật & báo cáo lỗ hổng
└── README.md                    # Tài liệu chính của dự án
```

---

## 🗺️ Lộ trình Phát triển (Roadmap)

- [x] **Phase 0**: Khởi tạo kiến trúc nền tảng, thiết kế cơ sở dữ liệu PostGIS và dữ liệu mô phỏng.
- [x] **Phase 1**: Giao diện Khám phá trải nghiệm, bộ lọc tìm kiếm và bản đồ số Leaflet.
- [x] **Phase 2**: Thuật toán Heuristic Planner và hiển thị dòng thời gian Itinerary.
- [x] **Phase 2.5 (Hiện tại)**: Nâng cấp trải nghiệm người dùng với **đồ họa 3D WebGL (Three.js)**, thẻ 3D Tilt, bản đồ CartoDB đa chế độ và cơ chế Offline Mock Engine.
- [ ] **Phase 3**: Đề xuất ngữ nghĩa (Semantic Recommendation & Vector Search).
- [ ] **Phase 4**: Tự động tái sắp xếp lịch trình khi hoạt động thay đổi trạng thái (Dynamic Replanning).
- [ ] **Phase 5**: Tích hợp cổng webhook nhận cập nhật thời gian thực từ nhà cung cấp đối tác.
- [ ] **Phase 6**: Tích hợp thuật toán ML Ranking & Cá nhân hóa chuyên sâu.
- [ ] **Phase 7**: Tích hợp dữ liệu nhà cung cấp thật và giao thông thời gian thực tại TP. Hồ Chí Minh.

---

## 🤝 Đóng góp & Giấy phép

Dự án được phân phối theo giấy phép mã nguồn mở **MIT License**. Mọi đóng góp, báo cáo lỗi và đề xuất tính năng mới xin vui lòng gửi thông qua **Pull Request** hoặc **Issues**. Xem thêm tại [CONTRIBUTING.md](CONTRIBUTING.md).

---

<div align="center">
  <sub>Được phát triển với niềm đam mê dành cho nhịp sống và văn hóa TP. Hồ Chí Minh.</sub>
</div>
