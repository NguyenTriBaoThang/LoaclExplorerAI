import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Share2,
  Clock,
  Route,
  Wallet,
  MapPin,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { getSharedItinerary } from '../api/client'
import { TiltCard3D } from '../components/3d/TiltCard3D'
import type { Itinerary } from '../types'

const timeLabel = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))

export function SharedItineraryPage() {
  const { token = '' } = useParams()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getSharedItinerary(token)
      .then(setItinerary)
      .catch(() => setError('Liên kết chia sẻ không hợp lệ hoặc đã bị thu hồi.'))
  }, [token])

  if (error) {
    return (
      <div className="page-wrap not-found-3d">
        <div className="not-found-card">
          <AlertCircle size={40} className="text-amber" />
          <h1>Liên kết không khả dụng</h1>
          <p>{error}</p>
          <Link to="/planner" className="btn-primary-3d">
            Tự tạo lịch trình mới <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="page-wrap page-loading-3d">
        <span className="loader-orbit" />
        <h2>Đang tải lịch trình được chia sẻ...</h2>
        <p>Vui lòng đợi giây lát trong khi hệ thống nạp dữ liệu chuyến đi.</p>
      </div>
    )
  }

  return (
    <div className="shared-page-3d page-wrap">
      {/* Shared Banner */}
      <div className="shared-banner-card">
        <div className="shared-banner-badge">
          <Share2 size={14} className="text-emerald" />
          <span>LỊCH TRÌNH ĐƯỢC CHIA SẺ TỪ BẠN BÈ</span>
        </div>
        <h1 className="shared-banner-title">
          Hành trình khám phá <em>Sài Gòn</em>
        </h1>
        <p className="shared-banner-sub">
          Lịch trình gồm {itinerary.stops.length} điểm trải nghiệm được thiết kế và tính toán tối ưu
          bằng Local Explorer AI.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="itinerary-metrics-grid">
        <TiltCard3D maxTilt={6} className="metric-kpi-card">
          <div className="kpi-icon-box text-emerald">
            <MapPin size={20} />
          </div>
          <div className="kpi-info">
            <small>ĐIỂM DỪNG CHÂN</small>
            <strong>{itinerary.stops.length} trải nghiệm</strong>
            <span>Khắp các quận trung tâm</span>
          </div>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} className="metric-kpi-card">
          <div className="kpi-icon-box text-amber">
            <Wallet size={20} />
          </div>
          <div className="kpi-info">
            <small>CHI PHÍ ƯỚC TÍNH</small>
            <strong>{itinerary.estimated_cost_vnd.toLocaleString('vi-VN')}₫</strong>
            <span>Cho toàn bộ chuyến đi</span>
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
      </div>

      {/* Stops Timeline */}
      <div className="shared-timeline-section">
        <h2 className="section-title-3d">Chi tiết các điểm dừng chân</h2>

        <div className="shared-stops-list">
          {itinerary.stops.map((stop) => (
            <article key={stop.id} className="shared-stop-card">
              <div className="shared-stop-order">{stop.position}</div>
              <div className="shared-stop-body">
                <div className="shared-stop-top">
                  <span className="shared-time-badge">
                    <Clock size={13} className="text-emerald" />
                    {timeLabel(stop.start_at)} — {timeLabel(stop.end_at)}
                  </span>
                  <span className="shared-cat-tag">{stop.category}</span>
                </div>

                <h3 className="shared-stop-name">{stop.name}</h3>

                <p className="shared-stop-addr">
                  <MapPin size={13} className="text-emerald" /> {stop.poi.address}
                </p>

                <div className="shared-stop-footer">
                  <span>Thời lượng: {stop.duration_min} phút</span>
                  <span>·</span>
                  <span>{stop.cost_vnd.toLocaleString('vi-VN')}₫ / người</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="shared-cta-card">
        <div className="shared-cta-inner">
          <Sparkles size={28} className="text-amber" />
          <div>
            <h3>Bạn muốn có lịch trình riêng phù hợp với thời gian rảnh của mình?</h3>
            <p>
              Chỉ cần nhập thời gian, số người và ngân sách — AI sẽ tạo lịch trình hoàn chỉnh trong 30 giây.
            </p>
          </div>
          <Link to="/planner" className="btn-primary-3d">
            <span>Tự Lên Lịch Ngay</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  )
}
