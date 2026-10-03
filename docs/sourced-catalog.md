# Dữ liệu catalog có nguồn

## Mục đích và trạng thái

Catalog thật chỉ được phân biệt khỏi dữ liệu trình diễn bằng trạng thái duyệt,
bằng chứng gắn với đúng phiên bản dữ liệu và thời hạn còn hiệu lực. API không
tự crawl, tự xác minh nội dung trang web hay tự tạo dữ liệu thật. Cơ sở gửi
nguồn/bằng chứng; quản trị viên duyệt POI, hoạt động và các bằng chứng liên
quan. Xác nhận slot xuất phát từ tài khoản cơ sở đã đăng nhập và luôn có thời
điểm xác nhận cùng hạn dùng.

Các POI/experience trong seed và 10 POI do web trả về khi chạy fallback đều có
`data_mode: simulated`. Web hiển thị nhãn mô phỏng; chúng không được tính là
POI/trải nghiệm đã xác minh, không được dùng để duyệt thành catalog thật chỉ
vì đã có sẵn trong mock. API vận hành không trả một bản ghi `verified` ra catalog
nếu bằng chứng thiếu, sai phiên bản hoặc hết hạn. Slot thật hết hạn bị loại khỏi
tìm kiếm và planner; slot mô phỏng vẫn được ghi rõ là mô phỏng.

## Dữ liệu được lưu

- POI: tên, địa chỉ, tọa độ, loại/danh mục; bản ghi có `data_revision` và tài
  khoản cơ sở tạo ra nó.
- Experience: mô tả/loại hoạt động, `intent_tags`, `is_hands_on`, thời lượng,
  giá và đơn vị tính; cũng có `data_revision`.
- Slot: giờ bắt đầu/kết thúc, sức chứa, số chỗ cơ sở báo còn, trạng thái,
  `confirmed_at`, `expires_at` và `version`.
- Evidence: URI nguồn, loại/tên nguồn, giấy phép/điều khoản, trường được nguồn
  chứng minh, `observed_at`, `expires_at`, người gửi, trạng thái/người duyệt,
  `target_type`, `target_id`, `target_revision` và ghi chú.

Evidence có `target_type` thuộc `poi`, `experience`, `slot`. Vì một bảng chứng
minh nhiều loại bản ghi nên target là quan hệ polymorphic; API xác thực target
và quyền sở hữu thay vì giả vờ rằng có một foreign key chung. POI và experience
chỉ được duyệt khi tập bằng chứng đã duyệt, còn hạn và đúng revision bao phủ đủ
các trường bắt buộc: POI cần `name`, `address`, `latitude`, `longitude`,
`category`; experience cần `title`, `description`, `primary_intent`,
`intent_tags`, `is_hands_on`, `duration_min`, `price_vnd`, `price_basis`; slot cần
`start_at`, `end_at`, `capacity_total`, `available_reported`, `status`. Sửa dữ
liệu tăng revision, khiến nguồn cũ không thể dùng
để xác minh giá trị mới. Slot do cơ sở tạo/cập nhật được lưu như một xác nhận
trực tiếp đã xác thực; lần cập nhật tăng version và làm bằng chứng slot trước
đó không còn khớp. Không có ngưỡng hạn dùng tự suy diễn: người gửi chọn hạn,
admin nhìn thấy hạn đó, và API không sử dụng bằng chứng sau hạn.

## Luồng thao tác

1. Cơ sở tạo POI hoặc experience ở trạng thái `pending`, kèm URL nguồn, loại
   nguồn, thời điểm quan sát và hạn dùng; đánh dấu cụ thể các trường nguồn đó
   chứng minh. Với địa chỉ/tọa độ, chỉ đánh dấu POI nếu nguồn/kiểm tra thực sự
   hỗ trợ các trường đó.
2. Admin duyệt từng evidence trước. Evidence hết hạn, không có thời điểm quan
   sát, target không còn tồn tại hoặc target revision đã thay đổi sẽ bị chặn.
3. Admin duyệt POI sau khi tất cả trường bắt buộc có bằng chứng đủ hạn. Admin
   duyệt experience sau khi evidence hoàn chỉnh và POI liên kết đã được duyệt.
4. Cơ sở tạo ca với sức chứa ban đầu, ghi thời điểm xác nhận ở server và nhập
   hạn xác nhận không muộn hơn giờ bắt đầu của ca. Cập nhật ca tăng version,
   lưu xác nhận mới và gia hạn rõ ràng nếu muốn mở ca trở lại.
5. Người dùng xem nhãn trạng thái/nguồn trong catalog và từng stop của itinerary.
   Stop lịch cũ được gắn `verified`, `stale`, `simulated` hoặc `unverified` khi
   tải lại; nguồn được trả riêng theo POI/experience/slot, cùng thời điểm xác
   nhận và hạn slot. Khi nguồn POI hoặc experience hết hạn, hay slot không còn
   freshness, dữ liệu không được trình bày như đã xác minh hiện hành.

## API

- `POST /api/provider/pois` và `PATCH /api/provider/pois/{id}` — tạo/sửa POI của
  cơ sở; mỗi lần sửa trở về `pending` và tăng revision.
- `POST /api/provider/experiences` và `PATCH /api/provider/experiences/{id}` —
  tạo/sửa trải nghiệm; mỗi lần sửa tăng revision và quay về `pending`.
- `POST /api/provider/evidence` — gửi nguồn cho POI hoặc experience do cơ sở
  sở hữu. Timestamp phải có timezone, URI phải là HTTP(S), thời điểm quan sát
  không ở tương lai và hạn phải sau thời điểm quan sát/còn hiệu lực.
- `POST /api/provider/experiences/{id}/slots` — tạo slot với `expires_at` bắt
  buộc. Cơ sở được coi là nguồn trực tiếp; API ghi evidence nội bộ và
  `confirmed_at`.
- `PATCH /api/provider/slots/{id}` — cập nhật lạc quan theo version; mở lại slot
  yêu cầu `expires_at` còn hiệu lực và không sau giờ bắt đầu.
- `GET /api/admin/moderation?status=pending` và
  `PATCH /api/admin/moderation/{evidence|poi|experience}/{id}` — hàng chờ và
  duyệt. Phản hồi lỗi `CATALOG_EVIDENCE_INCOMPLETE` chỉ rõ các trường chưa đủ.
- `GET /api/pois`, `GET /api/experiences`, `GET /api/experiences/{id}` — trả
  `data_mode`, trạng thái và `source_evidence` cho bản ghi phù hợp; nguồn đi
  kèm URI, phạm vi trường, thời điểm quan sát và hạn dùng.
- `POST /api/itineraries/plan`, `GET /api/itineraries/{id}` — mỗi stop trả
  provenance của POI, experience và slot, trạng thái freshness, timestamp xác
  nhận/hết hạn của slot và ID nguồn trong `explanation.evidence_refs`. Trạng thái
  routing mock được báo riêng, không làm catalog có nguồn bị gắn nhãn mô phỏng.

## Mục tiêu pilot

Draft trước đây nêu 20–30 POI, 10–15 trải nghiệm, 30–50 slot và tiếp cận 3–5
cơ sở. Đây là quy mô dự kiến, không phải dữ liệu đã thu thập hay giới hạn được
enforce trong phần mềm. Nhóm cần xác nhận lại các con số này trước khi chốt kế
hoạch; API không tự tạo bản ghi để đạt mục tiêu.

## Giới hạn còn lại

- Chưa crawl hoặc thu thập thông tin từ bên ngoài; cần nguồn thật được cơ sở
  cung cấp/cho phép hoặc nguồn công khai có giấy phép phù hợp.
- Admin đang là người rà soát nội dung và nguồn; không có OCR, crawler hay tự
  xác minh tự động. Quy trình khảo sát thực địa cần được ghi trong source/notes.
- Các POI mock hiện có không thể thay thế một catalog nguồn thật; phải nhập
  POI, địa chỉ và tọa độ đã kiểm chứng bằng form provider/admin trước khi có
  trải nghiệm thật.
- Không có booking/thanh toán; xác nhận slot chỉ là báo cáo còn chỗ tại thời
  điểm `confirmed_at` trong khoảng đến `expires_at`.
