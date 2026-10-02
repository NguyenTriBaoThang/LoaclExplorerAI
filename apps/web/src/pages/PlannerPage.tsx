import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Compass,
  MapPin,
  Minus,
  Plus,
  Users,
  Wallet,
  Sparkles,
  Navigation,
  CheckCircle2,
  Lock,
  Search,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiErrorMessage, createItinerary, getPOIs } from '../api/client'
import { TiltCard3D } from '../components/3d/TiltCard3D'
import type { POI } from '../types'

const intents = [
  { id: 'food', label: 'Ẩm thực Sài Gòn', glyph: '🍜', desc: 'Món Nam Bộ, cà phê vợt, bánh truyền thống' },
  { id: 'handicraft', label: 'Thủ công mỹ nghệ', glyph: '🎨', desc: 'Làm sổ giấy dó, gốm men màu' },
  { id: 'culture', label: 'Di sản & Văn hóa', glyph: '🏛️', desc: 'Kiến trúc cổ, triển lãm ký sự đô thị' },
  { id: 'nature', label: 'Thiên nhiên phố thị', glyph: '🌿', desc: 'Thuyền hoàng hôn, vườn cổ thụ' },
  { id: 'relaxation', label: 'Thư giãn & Phục hồi', glyph: '🍵', desc: 'Trà thảo mộc, chuông xoay Tây Tạng' },
]

const transportModes = [
  { id: 'driving', label: 'Xe máy / Ô tô', icon: '🛵', note: 'Phù hợp đi qua nhiều quận, linh hoạt' },
  { id: 'walking', label: 'Đi bộ khám phá', icon: '🚶', note: 'Tập trung khu phố cổ, bán kính hẹp' },
  { id: 'bicycling', label: 'Xe đạp dạo phố', icon: '🚲', note: 'Thong thả sáng sớm hoặc chiều mát' },
  { id: 'transit', label: 'Xe bus công cộng', icon: '🚌', note: 'Tiết kiệm chi phí, trải nghiệm địa phương' },
]

const budgetPresets = [500000, 1000000, 2000000, 3500000]

const today = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
const tomorrow = () => {
  const date = new Date(`${today()}T12:00:00+07:00`)
  date.setUTCDate(date.getUTCDate() + 1)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date)
}

export function PlannerPage() {
  const navigate = useNavigate()
  const [date, setDate] = useState(tomorrow())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('16:00')
  const [groupSize, setGroupSize] = useState(2)
  const [budget, setBudget] = useState(1200000)
  const [transport, setTransport] = useState('driving')
  const [selectedIntents, setSelectedIntents] = useState<string[]>(['food', 'handicraft'])
  const [pois, setPois] = useState<POI[]>([])
  const [lockedPois, setLockedPois] = useState<string[]>([])
  const [poiSearch, setPoiSearch] = useState('')
  const [originId, setOriginId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void getPOIs().then(setPois).catch(() => setPois([]))
  }, [])

  const toggleIntent = (id: string) => {
    setSelectedIntents((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const toggleLockPoi = (id: string) => {
    setLockedPois((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  // Calculate approximate duration
  const startHour =
    parseInt(startTime.split(':')[0], 10) + parseInt(startTime.split(':')[1], 10) / 60
  const endHour =
    parseInt(endTime.split(':')[0], 10) + parseInt(endTime.split(':')[1], 10) / 60
  const totalHours = Math.max(1, Math.round((endHour - startHour) * 10) / 10)

  const filteredPois = pois.filter((poi) =>
    poi.name.toLowerCase().includes(poiSearch.toLowerCase()) ||
    poi.address.toLowerCase().includes(poiSearch.toLowerCase())
  )

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const toIso = (value: string) => new Date(`${date}T${value}:00+07:00`).toISOString()
      const origin = pois.find((poi) => poi.id === originId)
      const destination = pois.find((poi) => poi.id === destinationId)
      const result = await createItinerary({
        start_at: toIso(startTime),
        end_at: toIso(endTime),
        group_size: groupSize,
        budget_vnd: budget,
        transport_mode: transport,
        intent_weights: Object.fromEntries(selectedIntents.map((intent) => [intent, 1])),
        locked_experience_ids: [],
        locked_poi_ids: lockedPois,
        ...(origin
          ? {
              origin_latitude: origin.latitude,
              origin_longitude: origin.longitude,
              origin_label: origin.name,
            }
          : {}),
        ...(destination
          ? {
              destination_latitude: destination.latitude,
              destination_longitude: destination.longitude,
              destination_label: destination.name,
            }
          : {}),
      })
      navigate(`/itinerary/${result.itinerary_id}`, { state: { itinerary: result } })
    } catch (reason) {
      setError(apiErrorMessage(reason))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="planner-page-3d page-wrap">
      {/* Page Header */}
      <div className="page-title-row-3d">
        <div>
          <span className="eyebrow-3d">
            <span className="eyebrow-dot" /> LẬP KẾ HOẠCH THÔNG MINH
          </span>
          <h1 className="page-heading-3d">
            Thiết kế một ngày <em>đáng nhớ.</em>
          </h1>
          <p className="page-subtext-3d">
            Hệ thống kết hợp mục đích chuyến đi, sức chứa khung giờ và tuyến đường di chuyển tối ưu
            để tạo lịch trình thực tế nhất tại TP. Hồ Chí Minh.
          </p>
        </div>
        <div className="planner-badge-wrap">
          <span className="planner-city-badge">
            <MapPin size={14} className="text-emerald" />
            TP. HỒ CHÍ MINH · HEURISTIC ENGINE
          </span>
        </div>
      </div>

      <div className="planner-grid-3d">
        {/* Main Form */}
        <form className="planner-form-3d" onSubmit={submit}>
          {/* Section 01: Thời gian & Nhóm */}
          <div className="form-card-3d">
            <div className="form-card-header">
              <span className="step-num">01</span>
              <div>
                <h2>Thời gian & Quy mô nhóm</h2>
                <p>Khung thời gian rảnh và ngân sách dự kiến của bạn.</p>
              </div>
              <div className="duration-preview-chip">
                <Clock3 size={13} className="text-emerald" />
                <span>{totalHours > 0 ? `Thời lượng: ~${totalHours} giờ` : 'Cần kiểm tra giờ'}</span>
              </div>
            </div>

            <div className="form-fields-grid-3">
              <label className="field-group-3d">
                <span>
                  <CalendarDays size={14} className="text-emerald" /> Ngày đi
                </span>
                <input
                  required
                  type="date"
                  value={date}
                  min={today()}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>

              <label className="field-group-3d">
                <span>
                  <Clock3 size={14} className="text-amber" /> Giờ bắt đầu
                </span>
                <input
                  required
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>

              <label className="field-group-3d">
                <span>
                  <Clock3 size={14} className="text-amber" /> Giờ kết thúc
                </span>
                <input
                  required
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </label>
            </div>

            <div className="form-fields-grid-2">
              <div className="field-group-3d">
                <span>
                  <Users size={14} className="text-cyan" /> Số lượng thành viên
                </span>
                <div className="stepper-3d">
                  <button
                    type="button"
                    onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                    aria-label="Giảm"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="stepper-value">{groupSize} người</span>
                  <button
                    type="button"
                    onClick={() => setGroupSize(Math.min(30, groupSize + 1))}
                    aria-label="Tăng"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <div className="field-group-3d">
                <div className="field-label-split">
                  <span>
                    <Wallet size={14} className="text-emerald" /> Tổng ngân sách (VND)
                  </span>
                  <span className="budget-calc-sub">
                    ~{Math.floor(budget / groupSize).toLocaleString('vi-VN')}₫ / người
                  </span>
                </div>
                <input
                  required
                  type="number"
                  min={100000}
                  step={50000}
                  value={budget}
                  onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
                />
                <div className="budget-presets-row">
                  {budgetPresets.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`preset-btn ${budget === amt ? 'preset-active' : ''}`}
                      onClick={() => setBudget(amt)}
                    >
                      {(amt / 1000000).toFixed(amt % 1000000 === 0 ? 0 : 1)}tr
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 02: Mục đích trải nghiệm */}
          <div className="form-card-3d">
            <div className="form-card-header">
              <span className="step-num">02</span>
              <div>
                <h2>Mục đích & Phong cách chuyến đi</h2>
                <p>Chọn các hoạt động bạn muốn AI ưu tiên đưa vào lịch.</p>
              </div>
            </div>

            <div className="intent-selector-grid">
              {intents.map((item) => {
                const active = selectedIntents.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`intent-btn-3d ${active ? 'intent-btn-active' : ''}`}
                    onClick={() => toggleIntent(item.id)}
                  >
                    <span className="intent-btn-glyph">{item.glyph}</span>
                    <div className="intent-btn-info">
                      <strong>{item.label}</strong>
                      <small>{item.desc}</small>
                    </div>
                    {active && <CheckCircle2 size={18} className="intent-check-icon" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 03: Phương tiện di chuyển */}
          <div className="form-card-3d">
            <div className="form-card-header">
              <span className="step-num">03</span>
              <div>
                <h2>Phương tiện di chuyển</h2>
                <p>AI sẽ dùng phương tiện này để tính toán thời gian đi lại giữa các điểm.</p>
              </div>
            </div>

            <div className="transport-mode-grid">
              {transportModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`transport-btn-3d ${transport === mode.id ? 'transport-active' : ''}`}
                  onClick={() => setTransport(mode.id)}
                >
                  <span className="transport-icon">{mode.icon}</span>
                  <div>
                    <strong>{mode.label}</strong>
                    <small>{mode.note}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 04: Điểm xuất phát, Điểm về & Khóa POI */}
          <div className="form-card-3d">
            <div className="form-card-header">
              <span className="step-num">04</span>
              <div>
                <h2>Điểm đón, điểm về & Ghim địa điểm</h2>
                <p>Giờ về được thuật toán tính gồm cả chặng từ trải nghiệm cuối đến điểm về.</p>
              </div>
            </div>

            <div className="form-fields-grid-2">
              <label className="field-group-3d">
                <span>
                  <MapPin size={14} className="text-emerald" /> Điểm xuất phát (Tùy chọn)
                </span>
                <select value={originId} onChange={(e) => setOriginId(e.target.value)}>
                  <option value="">Chưa chọn điểm xuất phát cụ thể</option>
                  {pois.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-group-3d">
                <span>
                  <MapPin size={14} className="text-amber" /> Điểm phải về trước giờ kết thúc
                </span>
                <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)}>
                  <option value="">Chưa chọn điểm về cố định</option>
                  {pois.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* POI Locking Section with Card Selection */}
            <div className="poi-lock-section">
              <div className="poi-lock-header">
                <div className="poi-lock-title-col">
                  <span className="poi-lock-label">
                    <Lock size={14} className="text-cyan" /> Ghim địa điểm bạn muốn ghé
                  </span>
                  <small>
                    Các địa điểm này sẽ được thuật toán ưu tiên giữ lại trong lịch trình.
                  </small>
                </div>
                {pois.length > 6 && (
                  <div className="poi-search-box-mini">
                    <Search size={14} />
                    <input
                      placeholder="Tìm địa điểm..."
                      value={poiSearch}
                      onChange={(e) => setPoiSearch(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="poi-lock-cards-grid">
                {filteredPois.slice(0, 8).map((poi) => {
                  const locked = lockedPois.includes(poi.id)
                  return (
                    <button
                      key={poi.id}
                      type="button"
                      className={`poi-lock-card ${locked ? 'poi-locked-active' : ''}`}
                      onClick={() => toggleLockPoi(poi.id)}
                    >
                      <div className="poi-lock-status">
                        {locked ? (
                          <CheckCircle2 size={16} className="text-emerald" />
                        ) : (
                          <span className="poi-lock-empty-dot" />
                        )}
                      </div>
                      <div className="poi-lock-info">
                        <strong>{poi.name}</strong>
                        <small>{poi.address}</small>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {error && <div className="form-alert-3d">{error}</div>}

          {/* Submit Row */}
          <div className="submit-action-card">
            <div className="submit-summary-text">
              <strong>Đã chọn {selectedIntents.length} sở thích · {groupSize} khách</strong>
              <small>Heuristic Planner 0ms · Dữ liệu khung giờ thực tế</small>
            </div>
            <button className="btn-planner-submit" type="submit" disabled={loading}>
              <span>{loading ? 'Đang tối ưu lịch trình...' : 'Tạo Lịch Trình Ngay'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

        {/* Right Column: 3D Interactive Live Preview Card */}
        <aside className="planner-aside-3d">
          <TiltCard3D maxTilt={8} className="live-preview-card-3d">
            <div className="preview-card-header">
              <div className="preview-icon-box">
                <Compass size={22} className="brand-compass" />
              </div>
              <div>
                <span className="preview-kicker">XEM TRƯỚC LỊCH TRÌNH</span>
                <h3 className="preview-main-title">Một ngày tại Sài Gòn</h3>
              </div>
            </div>

            <div className="preview-stats-bar">
              <div className="preview-stat-cell">
                <small>Thời lượng</small>
                <strong>{totalHours > 0 ? `${totalHours} giờ` : 'Chưa định'}</strong>
              </div>
              <div className="preview-stat-cell">
                <small>Dự kiến</small>
                <strong>~{Math.floor(budget / groupSize).toLocaleString('vi-VN')}₫</strong>
                <span className="stat-unit">/ người</span>
              </div>
              <div className="preview-stat-cell">
                <small>Quy mô</small>
                <strong>{groupSize} khách</strong>
              </div>
            </div>

            <div className="preview-vibe-list">
              <span className="vibe-list-label">Ưu tiên trải nghiệm:</span>
              <div className="vibe-tags-wrap">
                {selectedIntents.length > 0 ? (
                  selectedIntents.map((id) => {
                    const found = intents.find((i) => i.id === id)
                    return (
                      <span key={id} className="vibe-pill-active">
                        {found?.glyph} {found?.label}
                      </span>
                    )
                  })
                ) : (
                  <span className="vibe-pill-empty">Chưa chọn mục đích</span>
                )}
              </div>
            </div>

            <div className="preview-simulation-notice">
              <Sparkles size={16} className="text-amber" />
              <p>
                Thuật toán Heuristic cân bằng thời gian dừng chân, sức chứa từng khung giờ và tính
                toán ma trận khoảng cách giữa các quận.
              </p>
            </div>

            <div className="preview-card-footer">
              <Navigation size={14} className="text-emerald" />
              <span>Chế độ: {transportModes.find((m) => m.id === transport)?.label}</span>
            </div>
          </TiltCard3D>

          {/* Quick FAQ / Guarantee */}
          <div className="planner-guarantee-card">
            <h4>💡 Lưu ý về tính khả thi</h4>
            <p>
              Các khung giờ chưa có báo cáo sức chứa sẽ hiện ở trạng thái <em>“cần xác nhận”</em> kèm
              gợi ý liên hệ nhà cung cấp, giúp bạn luôn chủ động trong kế hoạch.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
