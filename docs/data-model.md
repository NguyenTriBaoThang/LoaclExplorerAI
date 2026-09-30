# Data model

```mermaid
erDiagram
    PROVIDER ||--o{ EXPERIENCE : offers
    POI ||--o{ EXPERIENCE : hosts
    EXPERIENCE ||--o{ EXPERIENCE_SLOT : schedules
    ITINERARY ||--o{ ITINERARY_STOP : contains
    EXPERIENCE ||--o{ ITINERARY_STOP : selected_as
    EXPERIENCE_SLOT ||--o{ ITINERARY_STOP : uses
    ITINERARY ||--o{ DECISION_LOG : explains

    PROVIDER {
      uuid id PK
      string name
      string status
      string contact_phone
      string contact_email
      datetime created_at
    }
    POI {
      uuid id PK
      string name
      float latitude
      float longitude
      geography geom
      string category
      string verification_status
    }
    EXPERIENCE {
      uuid id PK
      uuid poi_id FK
      uuid provider_id FK
      string name
      json intent_tags
      int duration_min
      string price_basis
      int price_vnd
    }
    EXPERIENCE_SLOT {
      uuid id PK
      uuid experience_id FK
      datetime start_at
      datetime end_at
      int capacity_total
      int available_reported
      string status
      int version
    }
    ITINERARY {
      uuid id PK
      int version
      int group_size
      int budget_vnd
      datetime start_at
      datetime end_at
      string status
      json constraints
    }
    ITINERARY_STOP {
      uuid id PK
      uuid itinerary_id FK
      uuid experience_id FK
      uuid slot_id FK
      int position
      datetime arrival_at
      int cost_vnd
    }
    DECISION_LOG {
      uuid id PK
      uuid itinerary_id FK
      json reason_codes
      json rejected_candidates
      string model_version
    }
    EVIDENCE {
      uuid id PK
      string source_uri
      string source_type
      string license
      datetime verified_at
      datetime expires_at
    }
```

Schema core dùng UUID dạng chuỗi, timestamp có timezone, giá VND dạng integer và status dạng chuỗi có giá trị enum dùng chung trong ứng dụng. `pois.geom` là PostGIS `geography(Point,4326)` có GIST index; API hiện dùng lat/lon, chưa có truy vấn radius.

`available_reported`: `null` = chưa xác định; `0` = hết chỗ; số dương = số chỗ báo cáo. Dữ liệu seed xen kẽ slot được báo cáo và slot tentative để UI thể hiện bất định.
