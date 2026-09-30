import { useEffect, useState } from 'react'
import {
  CalendarClock,
  CircleAlert,
  CircleCheck,
  Clock3,
  Pencil,
  Users,
  Search,
  Plus,
  Compass,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { apiErrorMessage, getExperiences } from '../api/client'
import { SimulatedBadge } from '../components/common/StatusBadge'
import { TiltCard3D } from '../components/3d/TiltCard3D'
import type { Experience } from '../types'

const today = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
const hour = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))

export function ProviderPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const start = new Date(`${today()}T00:00:00+07:00`).toISOString()
    const end = new Date(`${today()}T23:59:59+07:00`).toISOString()
    getExperiences({ start_at: start, end_at: end })
      .then(setExperiences)
      .catch((reason) => setError(apiErrorMessage(reason)))
  }, [])

  const slotCount = experiences.reduce((total, exp) => total + exp.slots.length, 0)
  const uncertain = experiences
    .flatMap((exp) => exp.slots)
    .filter((slot) => slot.available_reported === null).length

  const filtered = experiences.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.poi.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="provider-page-3d page-wrap">
      {/* Partner Banner */}
      <div className="provider-banner-3d">
        <div className="banner-glow-shape" />
        <div className="banner-content-row">
          <div>
            <span className="eyebrow-3d text-emerald-300">
              <span className="eyebrow-dot bg-emerald-400" /> CỔNG THÔNG TIN ĐỐI TÁC
            </span>
            <h1 className="provider-banner-title">
              Trải nghiệm của bạn, <br />
              <em>được lên kế hoạch tốt hơn.</em>
            </h1>
            <p className="provider-banner-sub">
              Cập nhật khung giờ (slot), thông báo sức chứa và đưa hoạt động đặc sắc của bạn đến
              đúng những du khách có nhu cầu vào đúng thời điểm.
            </p>
          </div>
          <div className="banner-badge-mark">
            <div className="mark-circle">
              <CalendarClock size={36} className="text-emerald-400" />
            </div>
            <span>WORKSPACE ĐỐI TÁC 3D</span>
          </div>
        </div>
      </div>

      {/* 3D KPI Metrics Cards */}
      <div className="provider-stats-grid">
        <TiltCard3D maxTilt={6} className="provider-stat-card">
          <span className="stat-label">TRẢI NGHIỆM ĐANG MỞ</span>
          <div className="stat-main">
            <strong>{experiences.length}</strong>
            <span className="stat-pill-ok">
              <CircleCheck size={13} /> Sẵn sàng
            </span>
          </div>
          <small>Hoạt động có khung giờ hôm nay</small>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} className="provider-stat-card">
          <span className="stat-label">TỔNG KHUNG GIỜ (SLOTS)</span>
          <div className="stat-main">
            <strong>{slotCount}</strong>
            <span className="stat-pill-info">
              <Clock3 size={13} /> Thời gian thực
            </span>
          </div>
          <small>Số slot được mô phỏng trong ngày</small>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} className="provider-stat-card">
          <span className="stat-label">CẦN XÁC NHẬN SỨC CHỨA</span>
          <div className="stat-main">
            <strong className="text-amber">{uncertain}</strong>
            <span className="stat-pill-warn">
              <CircleAlert size={13} /> Chờ đối tác
            </span>
          </div>
          <small>Khung giờ chưa rõ số chỗ còn lại</small>
        </TiltCard3D>
      </div>

      {/* Table Header & Search */}
      <div className="table-controls-bar">
        <div>
          <span className="results-sub">QUẢN LÝ DANH MỤC TRẢI NGHIỆM</span>
          <h2 className="table-heading-title">Danh sách hoạt động & Khung giờ</h2>
        </div>

        <div className="table-actions-group">
          <div className="table-search-box">
            <Search size={15} />
            <input
              placeholder="Lọc hoạt động..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="btn-primary-3d btn-sm"
            type="button"
            onClick={() =>
              window.alert(
                'Tính năng thêm mới hoạt động sẽ được kích hoạt sau khi đăng nhập tài khoản nhà cung cấp.'
              )
            }
          >
            <Plus size={15} />
            <span>Thêm trải nghiệm</span>
          </button>
        </div>
      </div>

      {error && <div className="inline-alert-3d">{error}</div>}

      {/* 3D Modern Table */}
      <div className="provider-table-card-3d">
        <div className="table-header-row">
          <span>TRẢI NGHIỆM & ĐỊA ĐIỂM</span>
          <span>KHUNG GIỜ TIẾP THEO</span>
          <span>SỨC CHỨA</span>
          <span>TRẠNG THÁI</span>
          <span>HÀNH ĐỘNG</span>
        </div>

        <div className="table-rows-container">
          {filtered.map((experience) => {
            const slot = experience.slots[0]
            const capacity =
              slot?.available_reported == null
                ? 'Chưa xác nhận'
                : `${slot.available_reported} chỗ trống`
            const isOpen = selected === experience.id

            return (
              <div
                key={experience.id}
                className={`table-interactive-row ${isOpen ? 'row-expanded' : ''}`}
                onClick={() => setSelected(isOpen ? '' : experience.id)}
              >
                <div className="row-main-grid">
                  <div className="col-experience">
                    <span className="exp-glyph">
                      {experience.poi.category.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="exp-details">
                      <strong>{experience.name}</strong>
                      <small>{experience.poi.name}</small>
                    </div>
                  </div>

                  <div className="col-time">
                    {slot ? (
                      <>
                        <strong>
                          {hour(slot.start_at)} – {hour(slot.end_at)}
                        </strong>
                        <small>
                          {new Intl.DateTimeFormat('vi-VN', {
                            dateStyle: 'medium',
                            timeZone: 'Asia/Ho_Chi_Minh',
                          }).format(new Date(slot.start_at))}
                        </small>
                      </>
                    ) : (
                      <span className="text-muted">Chưa có slot</span>
                    )}
                  </div>

                  <div className={`col-capacity ${slot?.available_reported == null ? 'text-amber' : ''}`}>
                    <Users size={14} />
                    <span>{capacity}</span>
                  </div>

                  <div className="col-badge">
                    <SimulatedBadge />
                  </div>

                  <div className="col-action">
                    <button type="button" className="btn-table-inspect">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span>{isOpen ? 'Đóng' : 'Xem'}</span>
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="row-expanded-panel">
                    <p className="exp-full-desc">{experience.description}</p>
                    <div className="exp-extra-info">
                      <span>Thời lượng: {experience.duration_min} phút</span>
                      <span>
                        Giá demo: {experience.price_vnd.toLocaleString('vi-VN')}₫ / người
                      </span>
                      <span>Địa chỉ: {experience.poi.address}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-edit-action"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.alert('Tính năng chỉnh sửa yêu cầu phân quyền quản trị viên.')
                      }}
                    >
                      <Pencil size={13} />
                      <span>Chỉnh sửa thông tin trải nghiệm</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {!filtered.length && !error && (
            <div className="empty-table-state">
              <Compass size={24} className="text-emerald" />
              <span>Không tìm thấy hoạt động phù hợp với từ khóa.</span>
            </div>
          )}
        </div>
      </div>

      <p className="provider-disclaimer">
        Bảng quản trị đối tác trong phiên bản hiện tại là giao diện trình diễn quy trình cập nhật
        khung giờ và sức chứa. Xác thực tài khoản đa yếu tố sẽ được tích hợp trong giai đoạn tiếp theo.
      </p>
    </div>
  )
}
