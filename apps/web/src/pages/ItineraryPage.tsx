import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  MapPin,
  Route,
  Wallet,
  Sparkles,
  Share2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Car,
} from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { apiErrorMessage, getItinerary } from '../api/client'
import { MapAdapter } from '../components/map/MapAdapter'
import { SimulatedBadge } from '../components/common/StatusBadge'
import { TiltCard3D } from '../components/3d/TiltCard3D'
import type { Itinerary } from '../types'

const reasonCopy: Record<string, string> = {
  INTENT_MATCH: 'Ưu tiên trải nghiệm khớp chính xác với sở thích bạn đã chọn.',
  WITHIN_BUDGET: 'Chi phí ước tính nằm an toàn trong khoảng ngân sách bạn đặt.',
  SLOT_AVAILABLE: 'Khung giờ trải nghiệm khớp với mốc thời gian di chuyển của chuyến đi.',
  CAPACITY_UNKNOWN: 'Sức chứa chưa được cập nhật chính thức; hãy liên hệ trước khi đến.',
  MOCK_ROUTING: 'Thời gian di chuyển được tính theo khoảng cách thực tế giữa các quận TP. HCM.',
  SIMULATED_DATA: 'Dữ liệu trải nghiệm và giá tiền trong bản demo mô phỏng.',
  LOCKED_ACTIVITY: 'Trải nghiệm đã được bạn ghim cố định trong hành trình.',
}

const timeLabel = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))

export function ItineraryPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const initial = (location.state as { itinerary?: Itinerary } | null)?.itinerary
  const [itinerary, setItinerary] = useState<Itinerary | null>(initial ?? null)
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    getItinerary(id)
      .then(setItinerary)
      .catch((reason) => setError(apiErrorMessage(reason)))
      .finally(() => setLoading(false))
  }, [id])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="page-wrap page-loading-3d">
        <span className="loader-orbit" />
        <h2>Đang tối ưu hóa hành trình của bạn...</h2>
        <p>Thuật toán đang tính toán các khung giờ và thứ tự di chuyển tối ưu nhất.</p>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="page-wrap not-found-3d">
        <div className="not-found-card">
          <AlertCircle size={40} className="text-amber" />
          <h1>Chưa thể tải lịch trình</h1>
          <p>{error || 'Không tìm thấy dữ liệu cho mã lịch trình này.'}</p>
          <Link to="/planner" className="btn-primary-3d">
            Tạo lịch trình mới <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    )
  }

  const points = itinerary.stops.map((stop) => ({
    id: stop.experience_id,
    latitude: stop.poi.latitude,
    longitude: stop.poi.longitude,
    name: stop.name,
    category: stop.category,
    number: stop.position,
  }))

  const activeStop = itinerary.stops.find((stop) => stop.experience_id === selectedId)
  const lastStop = itinerary.stops[itinerary.stops.length - 1]
  const totalMinutes = lastStop
    ? Math.round(
        (new Date(lastStop.end_at).getTime() - new Date(itinerary.stops[0].start_at).getTime()) /
          60000
      )
    : 0

  return (
    <div className="itinerary-page-3d page-wrap">
      {/* Top Navigation & Actions */}
      <div className="itinerary-topbar">
        <Link to="/planner" className="btn-back-link">
          <ArrowLeft size={16} /> Chỉnh sửa thông tin chuyến đi
        </Link>
        <div className="topbar-actions">
          <button type="button" className="btn-action-icon" onClick={handleShare} title="Chia sẻ liên kết">
            <Share2 size={15} />
            <span>{copied ? 'Đã sao chép!' : 'Chia sẻ'}</span>
          </button>
          <button type="button" className="btn-action-icon" onClick={handlePrint} title="In lịch trình">
            <Printer size={15} />
            <span>In / Lưu</span>
          </button>
          <SimulatedBadge />
        </div>
      </div>

      {/* Main Heading & Feasibility Pill */}
      <div className="itinerary-header-3d">
        <div>
          <span className="eyebrow-3d">
            <span className="eyebrow-dot" /> LỊCH TRÌNH ĐƯỢC TỐI ƯU HÓA
          </span>
          <h1 className="page-heading-3d">
            Một ngày theo <em>nhịp của bạn.</em>
          </h1>
          <p className="page-subtext-3d">
            {itinerary.stops.length} trải nghiệm đã được sắp xếp khoa học dựa trên thời gian thực và khoảng cách di chuyển.
          </p>
        </div>
        <div
          className={`feasibility-badge-3d ${
            itinerary.feasibility_status === 'tentative' ? 'feasibility-warning' : 'feasibility-ok'
          }`}
        >
          <span className="feasibility-dot" />
          <span>
            {itinerary.feasibility_status === 'tentative'
              ? 'Có hoạt động cần xác nhận sức chứa'
              : 'Khả thi cao theo khung giờ mở'}
          </span>
        </div>
      </div>

      {/* 4 Glowing 3D Metric KPI Cards */}
      <div className="itinerary-metrics-grid">
        <TiltCard3D maxTilt={6} className="metric-kpi-card">
          <div className="kpi-icon-box text-emerald">
            <Clock3 size={20} />
          </div>
          <div className="kpi-info">
            <small>TỔNG THỜI GIAN</small>
            <strong>
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}p
            </strong>
            <span>Từ {timeLabel(itinerary.stops[0].start_at)} đến {timeLabel(lastStop.end_at)}</span>
          </div>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} className="metric-kpi-card">
          <div className="kpi-icon-box text-cyan">
            <Route size={20} />
          </div>
          <div className="kpi-info">
            <small>DI CHUYỂN ƯỚC TÍNH</small>
            <strong>{itinerary.total_travel_min} phút</strong>
            <span>Thời gian đi lại giữa các điểm</span>
          </div>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} className="metric-kpi-card">
          <div className="kpi-icon-box text-amber">
            <Wallet size={20} />
          </div>
          <div className="kpi-info">
            <small>CHI PHÍ ƯỚC TÍNH</small>
            <strong>{itinerary.estimated_cost_vnd.toLocaleString('vi-VN')}₫</strong>
            <span>Chi phí vé & trải nghiệm tổng</span>
          </div>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} className="metric-kpi-card">
          <div className="kpi-icon-box text-rose">
            <MapPin size={20} />
          </div>
          <div className="kpi-info">
            <small>ĐIỂM DỪNG CHÂN</small>
            <strong>{itinerary.stops.length} trải nghiệm</strong>
            <span>Tại trung tâm TP. Hồ Chí Minh</span>
          </div>
        </TiltCard3D>
      </div>

      {/* Content Split: 3D Timeline + Interactive Map */}
      <div className="itinerary-content-split">
        {/* Timeline Column */}
        <section className="timeline-col-3d">
          <div className="timeline-header-bar">
            <div>
              <span className="results-sub">DÒNG THỜI GIAN CHUYẾN ĐI</span>
              <strong className="timeline-main-title">Thứ tự trải nghiệm</strong>
            </div>
            <span className="timeline-date-chip">
              {new Intl.DateTimeFormat('vi-VN', {
                dateStyle: 'medium',
                timeZone: 'Asia/Ho_Chi_Minh',
              }).format(new Date(itinerary.stops[0]?.start_at ?? itinerary.data_as_of))}
            </span>
          </div>

          <div className="timeline-stops-container">
            {itinerary.stops.map((stop, index) => (
              <div key={stop.id} className="timeline-row-wrapper">
                <article
                  className={`timeline-stop-card-3d ${
                    selectedId === stop.experience_id ? 'stop-card-active' : ''
                  }`}
                  onMouseEnter={() => setSelectedId(stop.experience_id)}
                  onClick={() => setSelectedId(stop.experience_id)}
                  tabIndex={0}
                >
                  <div className="timeline-marker-col">
                    <span className="stop-number-badge">
                      {String(stop.position).padStart(2, '0')}
                    </span>
                    {index < itinerary.stops.length - 1 && <span className="timeline-laser-line" />}
                  </div>

                  <div className="stop-card-body">
                    <div className="stop-top-meta">
                      <span className="stop-time-range">
                        <Clock3 size={13} className="text-emerald" />
                        {timeLabel(stop.start_at)} — {timeLabel(stop.end_at)}
                      </span>
                      <span className="stop-category-tag">{stop.category}</span>
                    </div>

                    <h3 className="stop-title">{stop.name}</h3>

                    <p className="stop-address">
                      <MapPin size={13} className="text-emerald" /> {stop.poi.address}
                    </p>

                    <div className="stop-footer-meta">
                      <span className="meta-badge-item">Thời lượng: {stop.duration_min} phút</span>
                      <span className="meta-badge-item">
                        {stop.cost_vnd.toLocaleString('vi-VN')}₫ / người
                      </span>
                      {stop.availability_known ? (
                        <span className="stop-status-pill status-pill-confirmed">
                          <CheckCircle2 size={12} /> Có báo cáo chỗ
                        </span>
                      ) : (
                        <span className="stop-status-pill status-pill-tentative">
                          <AlertCircle size={12} /> Cần gọi xác nhận
                        </span>
                      )}
                    </div>
                  </div>
                </article>

                {/* Travel Leg between stops */}
                {index < itinerary.stops.length - 1 && (
                  <div className="travel-leg-indicator">
                    <div className="travel-leg-pill">
                      <Car size={13} className="text-emerald" />
                      <span>~20 phút di chuyển giữa các điểm dừng</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Map Column */}
        <section className="map-col-3d">
          <div className="map-panel-header-3d">
            <div>
              <span className="map-sub">LỘ TRÌNH DI CHUYỂN</span>
              <strong className="map-title">Bản đồ vệ tinh & Lộ trình</strong>
            </div>
            <span className="route-count-tag">{points.length} chặng dừng</span>
          </div>

          <MapAdapter
            points={points}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="itinerary-map-container"
          />

          <div className="map-route-caption">
            <span className="route-dot-active" />
            <span>Đường di chuyển được ước tính theo ma trận cự ly TP. Hồ Chí Minh.</span>
          </div>
        </section>
      </div>

      {/* AI Explanation & Transparency Card */}
      <div className="itinerary-explanation-card-3d">
        <div className="explanation-title-row">
          <div className="explanation-icon-pill">
            <Sparkles size={20} className="text-emerald" />
          </div>
          <div>
            <span className="explanation-eyebrow">TÍNH MINH BẠCH CỦA THUẬT TOÁN</span>
            <h2 className="explanation-title">Vì sao lịch trình này được đề xuất?</h2>
          </div>
        </div>

        <div className="reason-code-grid">
          {itinerary.explanation.reason_codes.map((code) => (
            <div key={code} className="reason-code-item">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>{reasonCopy[code] ?? code.replaceAll('_', ' ')}</span>
            </div>
          ))}
        </div>

        {itinerary.explanation.lost_intents.length > 0 && (
          <div className="lost-intents-notice">
            <AlertCircle size={15} />
            <span>
              Một số mục đích chưa tìm được khung giờ phù hợp: {itinerary.explanation.lost_intents.join(', ')}.
            </span>
          </div>
        )}

        <div className="explanation-footer-bar">
          <span>Bạn muốn đổi sang khoảng thời gian khác hoặc giảm bớt điểm dừng?</span>
          <Link to="/planner" className="btn-replan-link">
            <span>Thử phương án khác</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {activeStop && (
        <div className="sr-only" aria-live="polite">
          Đang xem {activeStop.name} trên bản đồ
        </div>
      )}
    </div>
  )
}
