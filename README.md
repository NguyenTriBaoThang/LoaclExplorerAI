# Local Explorer AI

Khám phá đúng trải nghiệm, đúng thời điểm.

Local Explorer AI giúp xây dựng lịch trình TP. Hồ Chí Minh từ trải nghiệm có khung giờ, mục đích chuyến đi, ngân sách, quy mô nhóm và thời gian di chuyển ước tính. Một địa điểm có trên bản đồ không đồng nghĩa với việc khách có thể tham gia trải nghiệm vào thời điểm mình đến.

> Bản demo hiện dùng dữ liệu tổng hợp được gắn nhãn `SIMULATED`. Giá và khung giờ không phải đề nghị thật, tình trạng sức chứa chưa phải xác nhận đặt chỗ. Routing dùng khoảng cách đường chim bay điều chỉnh theo hệ số và tốc độ giả định, không phải tuyến đường hay giao thông thời gian thực.

## Khái niệm cốt lõi

```text
POI → Experience → Experience Slot
```

- **POI** là địa điểm có tọa độ trên bản đồ.
- **Experience** là hoạt động cụ thể tại địa điểm, có mục đích, thời lượng và giá demo.
- **Experience Slot** là một khung giờ riêng, có sức chứa và trạng thái riêng. `available_reported = null` nghĩa là chưa biết; chỉ giá trị `0` mới là hết chỗ.
- **Itinerary** là kế hoạch gồm các trải nghiệm đã xét theo thời gian, nhóm, ngân sách và di chuyển.

Planner ưu tiên các mục đích đã chọn và giải thích quyết định bằng reason codes. Khung giờ chưa rõ sức chứa vẫn có thể xuất hiện ở trạng thái `tentative` kèm nhắc xác nhận. Form có cấu trúc gọi thẳng Planner API và không phụ thuộc chatbot hay API key LLM.

## Kiến trúc

```mermaid
flowchart LR
    U[Người đi du lịch] --> W[React + TypeScript]
    W --> API[FastAPI]
    API --> ES[Experience Service]
    API --> RS[Recommendation Service]
    API --> PS[Planner Service]
    ES --> ER[Experience Repository]
    PS --> PE[Heuristic Planner]
    PS --> RA[Routing Adapter]
    ER --> DB[(PostgreSQL + PostGIS)]
    API -. chuẩn bị dùng .-> REDIS[(Redis)]
    W --> MA[Leaflet Map Adapter]
```

Xem thêm [kiến trúc](docs/architecture.md), [mô hình dữ liệu](docs/data-model.md) và [API MVP](docs/api.md).

## Yêu cầu

- Docker Engine/Desktop có Docker Compose v2, hoặc Python 3.12+, Node.js 20+ và PostgreSQL 16 có PostGIS 3.4.
- Git.
- Không cần API key AI, bản đồ hay routing để chạy demo.

## Chạy nhanh với Docker

```bash
cp .env.example .env
docker compose up --build
```

Mở giao diện tại [http://localhost:5173](http://localhost:5173), tài liệu API tại [http://localhost:8000/docs](http://localhost:8000/docs) và health tại [http://localhost:8000/health](http://localhost:8000/health). Compose tự chờ database/Redis khỏe, chạy Alembic migration rồi seed dữ liệu demo trước khi mở API.

Để dừng:

```bash
docker compose down
```

Để xóa cả volume database demo:

```bash
docker compose down -v
```

`POSTGRES_PASSWORD` trong `.env.example` là mật khẩu phát triển cục bộ. Nếu đổi mật khẩu, hãy cập nhật cả `DATABASE_URL`. `.env` bị loại khỏi Git.

## Chạy từng phần trong môi trường phát triển

Khởi động PostgreSQL/PostGIS và Redis bằng Compose:

```bash
docker compose up -d db redis
```

Backend, từ thư mục `apps/api` (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/local_explorer"
alembic upgrade head
python -m scripts.seed_db
uvicorn app.main:app --reload --port 8000
```

Frontend, từ thư mục `apps/web`:

```bash
npm install
npm run dev
```

Vite phục vụ tại cổng 5173 và proxy `/api` cùng `/health` tới backend cổng 8000. Nếu đã đổi mật khẩu PostgreSQL, cập nhật `DATABASE_URL` tương ứng.

## Migration và dữ liệu demo

Từ `apps/api`, sau khi đặt `DATABASE_URL`:

```bash
alembic upgrade head
python -m scripts.seed_db
```

Migration bật extension PostGIS, tạo schema và thêm cột `pois.geom` kiểu `geography(POINT, 4326)` cùng chỉ mục GIST. Seed có 10 POI/trải nghiệm hư cấu, một provider tổng hợp và 30 ngày khung giờ demo; chạy lại sẽ giữ nguyên dữ liệu đang có. Chi tiết ở [data/README.md](data/README.md).

## Kiểm tra

Backend test:

```bash
cd apps/api
pytest
```

Frontend typecheck/build:

```bash
cd apps/web
npm install
npm run build
```

Kiểm tra Docker Compose:

```bash
docker compose config
```

## API MVP

| Method | Path | Mục đích |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/pois` | Danh sách POI demo |
| `GET` | `/api/pois/{id}` | Chi tiết POI |
| `GET` | `/api/experiences` | Danh sách, lọc `intent`, `start_at`, `end_at`, `group_size`, `max_price` |
| `GET` | `/api/experiences/{id}` | Chi tiết trải nghiệm |
| `GET` | `/api/experiences/{id}/slots` | Khung giờ của trải nghiệm |
| `POST` | `/api/itineraries/plan` | Tạo itinerary bằng heuristic |
| `GET` | `/api/itineraries/{id}` | Đọc itinerary đã tạo |
| `POST` | `/api/chat/message` | Contract chatbot, trả `not_configured` |

Datetime gửi/nhận theo ISO 8601 có timezone; backend chuẩn hóa lưu UTC. Tiền là số nguyên VND. Lỗi dùng envelope `{ "error": { "code", "message", "details", "request_id" } }`. Xem schema và ví dụ tại [docs/api.md](docs/api.md) hoặc Swagger UI.

## Cấu trúc dự án

```text
apps/
  api/                 FastAPI, SQLAlchemy, Alembic, seed và test
  web/                 React, TypeScript, Vite, Leaflet
data/                  Ghi chú nguồn và chế độ dữ liệu demo
docs/                  Kiến trúc, API, data model
docker-compose.yml     Web, API, PostGIS, Redis
```

Backend đi theo lớp API → Service → Repository → Database. Routing và map được đặt sau adapter để thay provider mà không đưa logic nghiệp vụ vào SDK bên ngoài. Redis đã có trong hạ tầng, chưa dùng làm cache hay hàng đợi.

## Roadmap

| Giai đoạn | Phạm vi |
|---|---|
| Phase 0 | Nền kiến trúc, dữ liệu demo, API và bản đồ |
| Phase 1 | Khám phá trải nghiệm và bộ lọc |
| Phase 2 | Planner MVP và itinerary timeline |
| Phase 3 | Recommendation ngữ nghĩa |
| Phase 4 | Lập lịch động khi hoạt động đổi trạng thái |
| Phase 5 | Sự kiện cập nhật từ provider |
| Phase 6 | ML ranking |
| Phase 7 | Tích hợp provider, routing và map production |

## License

MIT. Xem [LICENSE](LICENSE).
