<div align="center">

# 🧭 Local Explorer AI

### Khám phá đúng trải nghiệm, đúng thời điểm tại TP. Hồ Chí Minh

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-black.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20PostGIS-336791.svg)](https://postgis.net/)
[![Docker](https://img.shields.io/badge/Docker-Compose%20v2-2496ED.svg)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

<p align="center">
  Một nền tảng du lịch thông minh thế hệ mới kết hợp <b>mô hình đồ họa 3D WebGL</b> và <b>thuật toán Heuristic thời gian thực</b>.<br />
  Một địa điểm có trên bản đồ không đồng nghĩa với việc bạn có thể tham gia trải nghiệm vào lúc bạn đến.
</p>

[Xem Bản Trình Diễn](#-chạy-nhanh-với-docker) •
[Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống) •
[Tài Liệu API](#-danh-mục-api-mvp) •
[Đóng Góp](#-đóng-góp)

</div>

---

> [!NOTE]
> **Dữ liệu mô phỏng minh bạch (`SIMULATED`):**
> Bản demo hiện dùng dữ liệu tổng hợp được gắn nhãn `SIMULATED`. Giá vé và khung giờ là mô phỏng, tình trạng sức chứa chưa phải xác nhận đặt chỗ thực tế. Routing tính toán cự ly theo ma trận khoảng cách giữa các quận tại TP. Hồ Chí Minh.

---

## 🌟 Điểm Nổi Bật

- 🌆 **Giao diện 3D WebGL Sài Gòn (Three.js)**: Mô hình không gian 3D tương tác của TP. Hồ Chí Minh với hệ thống cao ốc ánh sáng neon, dòng sông Sài Gòn uốn lượn, camera xoay đa góc nhìn theo chuột và các điểm ghim 3D phát xung radar.
- 🎴 **Thẻ Tương Tác 3D Tilt**: Mọi thẻ trải nghiệm và danh mục đều hỗ trợ hiệu ứng 3D nghiêng động theo vị trí con trỏ chuột kèm vệt sáng gương phản chiếu (*specular glare*).
- ⏱️ **Lập Lịch Trình Có Khung Giờ (Slot-aware)**: Không chỉ tìm địa điểm, hệ thống định vị các hoạt động có khung giờ (*slot*) mở cửa trùng khớp với quỹ thời gian rảnh của du khách.
- 🧮 **Heuristic Planner Không Ảo Tưởng (Hallucination-free)**: Lập lịch dựa trên thuật toán tối ưu hóa đa mục tiêu toán học xác định, không phụ thuộc vào chatbot LLM ảo tưởng dữ liệu.
- 🗺️ **Bản Đồ Vector Đa Chế Độ (CartoDB Voyager & Dark)**: Bản đồ độ nét cao đồng bộ thời gian thực với danh sách trải nghiệm và dòng thời gian hành trình.
- 🛡️ **Minh Bạch Trạng Thái Khả Thi**: Đánh dấu rõ ràng giữa các khung giờ đã có báo cáo chỗ (*Available*) và chỗ cần liên hệ xác nhận (*Tentative*).
- ⚡ **Chế Độ Ngoại Tuyến (Offline Simulation)**: Tích hợp sẵn cơ chế Mock Engine thông minh, cho phép thử nghiệm toàn bộ tính năng giao diện ngay cả khi chưa khởi động backend database.

---

## 💡 Khái Niệm Cốt Lõi

```text
POI (Tọa độ địa lý)  ──>  Experience (Hoạt động)  ──>  Slot (Khung giờ)  ──>  Itinerary (Lịch trình 3D)
```

| Khái niệm | Định nghĩa |
|---|---|
| **POI (Point of Interest)** | Địa điểm vật lý có tọa độ địa lý (kinh độ, vĩ độ) trên bản đồ TP. Hồ Chí Minh. |
| **Experience** | Hoạt động trải nghiệm cụ thể diễn ra tại POI (ví dụ: làm giấy dó, nếm cà phê bít tất, làm gốm), gắn với mục đích, thời lượng và chi phí. |
| **Experience Slot** | Khung giờ độc lập có sức chứa và trạng thái riêng. `available_reported = null` nghĩa là chưa rõ; chỉ giá trị `0` mới là hết chỗ. |
| **Itinerary** | Kế hoạch hoàn chỉnh gồm chuỗi trải nghiệm đã được sắp xếp khoa học theo thời gian, ngân sách, số người và thời gian di chuyển. |

---

## 🏗️ Kiến Trúc Hệ Thống

```mermaid
flowchart TB
    subgraph Frontend["Frontend Client (React 18 + Vite)"]
        UI["Modern UI / UX Glassmorphism"]
        Three["Three.js WebGL 3D City Engine"]
        Map["Leaflet + CartoDB Map Adapter"]
        Mock["Offline Heuristic Engine Fallback"]
    end

    subgraph Backend["Backend API (FastAPI + Python 3.12)"]
        API["FastAPI REST Endpoints"]
        ES["Experience Service"]
        PS["Heuristic Planner Service"]
        RA["Haversine Routing Adapter"]
    end

    subgraph Storage["Storage & Cache"]
        DB[("PostgreSQL 16 + PostGIS 3.4")]
        REDIS[("Redis Cache")]
    end

    UI --> API
    Three --> UI
    Map --> UI
    Mock -. Kích hoạt khi backend offline .-> UI
    API --> ES
    API --> PS
    ES --> DB
    PS --> RA
    PS --> DB
    API -. Sẵn sàng kết nối .-> REDIS
```

Xem thêm tài liệu kỹ thuật chuyên sâu:
- [Kiến trúc chi tiết](docs/architecture.md)
- [Mô hình dữ liệu (Data Model)](docs/data-model.md)
- [Quy chuẩn API](docs/api.md)

---

## 💻 Công Nghệ Sử Dụng

| Tầng | Công nghệ | Mục đích |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite 6 | Nền tảng ứng dụng web tốc độ cao |
| **3D & Visual** | Three.js, Lucide Icons | Đồ họa WebGL không gian 3D và hệ thống icon |
| **Styling** | Vanilla CSS Tokens, Glassmorphism, Tailwind CSS | Giao diện Nocturnal Emerald, thẻ 3D Tilt |
| **Mapping** | Leaflet, React-Leaflet, CartoDB Tiles | Bản đồ vector độ phân giải cao |
| **Backend** | Python 3.12, FastAPI, Pydantic v2 | API service hiệu năng cao |
| **ORM & DB** | SQLAlchemy 2.0, Alembic, PostgreSQL 16, PostGIS 3.4 | Quản lý schema và truy vấn không gian địa lý |
| **Routing** | Haversine Matrix Adapter | Tính toán khoảng cách và thời gian di chuyển |
| **DevOps** | Docker, Docker Compose, Nginx | Đóng gói và triển khai môi trường container |

---

## 🚀 Chạy Nhanh Với Docker

Cách nhanh nhất để chạy toàn bộ hệ thống (Web, API, PostGIS, Redis):

```bash
# 1. Sao chép biến môi trường mẫu
cp .env.example .env

# 2. Khởi động toàn bộ cụm container
docker compose up --build
```

Sau khi hoàn tất, mở trình duyệt:
- 🌐 **Giao diện Web 3D**: [http://localhost:5173](http://localhost:5173)
- 📖 **Tài liệu Swagger API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🩺 **Kiểm tra trạng thái Health**: [http://localhost:8000/health](http://localhost:8000/health)

Để dừng hệ thống:
```bash
docker compose down
```

---

## 🛠️ Chạy Từng Phần Trong Môi Trường Phát Triển

### 1. Khởi động cơ sở dữ liệu (Database & Cache)

```bash
docker compose up -d db redis
```

### 2. Backend (FastAPI)

Yêu cầu: **Python 3.12+**

```bash
cd apps/api

# Tạo và kích hoạt môi trường ảo
python -m venv .venv

# Trên Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Trên macOS/Linux:
source .venv/bin/activate

# Cài đặt thư viện
pip install -r requirements.txt

# Thiết lập chuỗi kết nối và chạy Migration
$env:DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/local_explorer"
alembic upgrade head

# Nạp dữ liệu mô phỏng demo TP. Hồ Chí Minh
python -m scripts.seed_db

# Chạy server API
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend (React 18 + Three.js)

Yêu cầu: **Node.js 20+**

```bash
cd apps/web

# Cài đặt dependencies
npm install

# Khởi chạy server phát triển
npm run dev
```

Ứng dụng sẽ chạy tại cổng [http://localhost:5173](http://localhost:5173) và tự động proxy `/api` tới backend cổng `8000`.

---

## 📡 Danh Mục API MVP

| Phương thức | Đường dẫn | Chức năng |
|:---:|---|---|
| `GET` | `/health` | Kiểm tra tình trạng hoạt động của service |
| `GET` | `/api/pois` | Lấy danh sách điểm quan tâm (POI) |
| `GET` | `/api/pois/{id}` | Lấy chi tiết thông tin POI theo ID |
| `GET` | `/api/experiences` | Tìm kiếm trải nghiệm (lọc theo `intent`, `start_at`, `end_at`, `group_size`, `max_price`) |
| `GET` | `/api/experiences/{id}` | Chi tiết thông tin trải nghiệm |
| `GET` | `/api/experiences/{id}/slots` | Danh sách khung giờ mở cửa của trải nghiệm |
| `POST` | `/api/itineraries/plan` | Tạo lịch trình tự động bằng thuật toán Heuristic |
| `GET` | `/api/itineraries/{id}` | Truy xuất thông tin lịch trình đã lưu |

*Định dạng thời gian theo chuẩn ISO 8601 UTC. Đơn vị tiền tệ: số nguyên VND. Envelope phản hồi lỗi chuẩn `{ "error": { "code", "message", "details", "request_id" } }`.*

---

## 📁 Cấu Trúc Dự Án

```text
LocalExplorerAI/
├── apps/
│   ├── api/                     # Backend FastAPI, SQLAlchemy, Alembic & Heuristic Planner
│   │   ├── app/                 # Mã nguồn chính của API (controllers, services, repositories)
│   │   ├── migrations/          # Kịch bản Alembic migration cho PostGIS
│   │   ├── scripts/             # Kịch bản nạp dữ liệu demo (seed_db.py)
│   │   └── tests/               # Bộ kiểm thử tự động với Pytest
│   └── web/                     # Frontend React + TypeScript + Three.js
│       ├── src/
│       │   ├── components/3d/   # Canvas 3D City WebGL & hiệu ứng TiltCard3D
│       │   ├── components/map/  # Leaflet Map Adapter với CartoDB tiles
│       │   ├── layouts/         # Layout kính mờ và Navigation Bar nổi
│       │   ├── pages/           # Home, Explore, Planner, Itinerary, Provider, About
│       │   └── api/             # API client tích hợp Offline Mock Engine Fallback
│       └── public/              # Tài nguyên tĩnh
├── data/                        # Dữ liệu mô phỏng và tài liệu data-mode
├── docs/                        # Tài liệu đặc tả kiến trúc, data model, API
├── docker-compose.yml           # Cấu hình cụm container Docker
└── README.md                    # Tài liệu dự án
```

---

## 🧪 Kiểm Thử

Kiểm thử Backend:
```bash
cd apps/api
pytest
```

Kiểm tra kiểu dữ liệu và đóng gói Frontend:
```bash
cd apps/web
npm run build
```

---

## 🗺️ Lộ Trình Phát Triển (Roadmap)

- [x] **Phase 0**: Khởi tạo kiến trúc nền tảng, cơ sở dữ liệu PostGIS và dữ liệu mô phỏng.
- [x] **Phase 1**: Giao diện Khám phá trải nghiệm, bộ lọc tìm kiếm và bản đồ số.
- [x] **Phase 2**: Thuật toán Heuristic Planner và hiển thị dòng thời gian Itinerary.
- [x] **Phase 2.5 (Hiện tại)**: Nâng cấp trải nghiệm người dùng với **đồ họa 3D WebGL (Three.js)**, thẻ 3D Tilt và chế độ Offline Mock Engine.
- [ ] **Phase 3**: Đề xuất ngữ nghĩa (Semantic Recommendation).
- [ ] **Phase 4**: Tự động tái sắp xếp lịch trình khi hoạt động thay đổi trạng thái (Dynamic Replanning).
- [ ] **Phase 5**: Tích hợp cổng webhook nhận cập nhật thời gian thực từ nhà cung cấp đối tác.
- [ ] **Phase 6**: Tích hợp thuật toán ML Ranking.
- [ ] **Phase 7**: Tích hợp dữ liệu nhà cung cấp thật và giao thông thời gian thực.

---

## 🤝 Đóng Góp

Mọi đóng góp từ cộng đồng đều được chào đón! Vui lòng làm theo các bước sau:

1. Fork dự án
2. Tạo nhánh tính năng mới (`git checkout -b feature/tinh-nang-moi`)
3. Commit thay đổi (`git commit -m 'feat: thêm tính năng mới'`)
4. Push lên nhánh của bạn (`git push origin feature/tinh-nang-moi`)
5. Tạo một **Pull Request**

---

## 📄 Bản Quyền

Dự án được phân phối dưới giấy phép **MIT License**. Xem thêm tại tệp [LICENSE](LICENSE).

---

<div align="center">
  <sub>Được phát triển với niềm đam mê dành cho đời sống và văn hóa TP. Hồ Chí Minh.</sub>
</div>
