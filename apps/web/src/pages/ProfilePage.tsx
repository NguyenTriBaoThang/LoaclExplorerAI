import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Lock,
  Calendar,
  ArrowRight,
  GitCompare,
  CheckCircle2,
  AlertCircle,
  Route,
  Shield,
} from 'lucide-react'
import { apiErrorMessage, changePassword, getMyItineraries, updateProfile } from '../api/client'
import { useAuth } from '../auth'
import { TiltCard3D } from '../components/3d/TiltCard3D'

export function ProfilePage() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.display_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [password, setPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [trips, setTrips] = useState<
    Array<{ id: string; planned_date: string | null; status: string; estimated_cost_vnd: number }>
  >([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    getMyItineraries()
      .then(setTrips)
      .catch(() => setTrips([]))
  }, [])

  async function save(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSavingProfile(true)
    try {
      setUser(await updateProfile(name, phone || null))
      setNotice('Đã cập nhật thông tin hồ sơ thành công!')
    } catch (reason) {
      setError(apiErrorMessage(reason))
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSavingPassword(true)
    try {
      await changePassword(currentPassword || null, password)
      setPassword('')
      setCurrentPassword('')
      setNotice('Đã thay đổi mật khẩu tài khoản thành công!')
    } catch (reason) {
      setError(apiErrorMessage(reason))
    } finally {
      setSavingPassword(false)
    }
  }

  const roleLabels: Record<string, string> = {
    traveler: 'Du khách khám phá',
    provider: 'Cơ sở đối tác',
    admin: 'Quản trị viên hệ thống',
  }

  const userInitials = (user?.display_name || user?.email || 'U').slice(0, 2).toUpperCase()

  return (
    <div className="profile-page-3d page-wrap">
      {/* Profile Header Banner */}
      <div className="profile-banner-card">
        <div className="profile-banner-left">
          <div className="profile-avatar-giant">
            <span>{userInitials}</span>
          </div>
          <div className="profile-user-headline">
            <span className="profile-role-badge">
              <Shield size={12} className="text-emerald" />
              {roleLabels[user?.role || ''] || user?.role}
            </span>
            <h1 className="profile-user-name">{user?.display_name || 'Người dùng'}</h1>
            <p className="profile-user-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-quick-stats">
          <div className="profile-stat-box">
            <small>LỊCH TRÌNH ĐÃ LƯU</small>
            <strong>{trips.length}</strong>
          </div>
          <Link to="/planner" className="btn-primary-3d btn-sm">
            <span>Tạo lịch mới</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {notice && (
        <div className="inline-alert-3d alert-success">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="inline-alert-3d">
          <AlertCircle size={16} className="text-amber" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Split: Settings + Trip History */}
      <div className="profile-layout-grid">
        {/* Left Column: Account & Security Forms */}
        <div className="profile-forms-col">
          {/* Personal Info Card */}
          <section className="profile-card-3d">
            <div className="profile-card-title-row">
              <div className="profile-title-icon-box text-emerald">
                <User size={18} />
              </div>
              <div>
                <h2>Thông tin cá nhân</h2>
                <p>Cập nhật tên hiển thị và số điện thoại liên lạc.</p>
              </div>
            </div>

            <form onSubmit={save} className="profile-form">
              <div className="field-group-3d">
                <span>Họ và tên hiển thị</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                />
              </div>

              <div className="field-group-3d">
                <span>Số điện thoại (tùy chọn)</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                />
              </div>

              <button className="btn-primary-3d" type="submit" disabled={savingProfile}>
                <span>{savingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
              </button>
            </form>
          </section>

          {/* Change Password Card */}
          <section className="profile-card-3d">
            <div className="profile-card-title-row">
              <div className="profile-title-icon-box text-amber">
                <Lock size={18} />
              </div>
              <div>
                <h2>Đổi mật khẩu</h2>
                <p>Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
              </div>
            </div>

            <form onSubmit={savePassword} className="profile-form">
              <div className="field-group-3d">
                <span>Mật khẩu hiện tại (để trống nếu đăng nhập Google)</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại..."
                />
              </div>

              <div className="field-group-3d">
                <span>Mật khẩu mới (ít nhất 12 ký tự)</span>
                <input
                  required
                  minLength={12}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                />
              </div>

              <button className="btn-secondary-3d" type="submit" disabled={savingPassword}>
                <span>{savingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}</span>
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: Saved Itineraries Gallery */}
        <section className="profile-trips-col">
          <div className="trips-section-header">
            <div>
              <span className="results-sub">BỘ SƯU TẬP CỦA BẠN</span>
              <h2 className="trips-main-title">Lịch trình đã tạo</h2>
            </div>
            {trips.length >= 2 && (
              <Link to="/compare" className="btn-compare-shortcut">
                <GitCompare size={15} />
                <span>So sánh các phương án</span>
              </Link>
            )}
          </div>

          {trips.length > 0 ? (
            <div className="trips-gallery-grid">
              {trips.map((trip) => (
                <TiltCard3D key={trip.id} maxTilt={6} className="trip-history-card">
                  <div className="trip-card-top">
                    <span className="trip-date-badge">
                      <Calendar size={13} className="text-emerald" />
                      {trip.planned_date || 'Chưa ấn định ngày'}
                    </span>
                    <span className="trip-status-chip">
                      {trip.status === 'confirmed' ? 'Đã xác nhận' : 'Bản nháp tối ưu'}
                    </span>
                  </div>

                  <h3 className="trip-card-id">Lịch trình #{trip.id.slice(0, 8)}</h3>

                  <div className="trip-card-cost">
                    <small>Chi phí dự kiến</small>
                    <strong>{trip.estimated_cost_vnd.toLocaleString('vi-VN')}₫</strong>
                  </div>

                  <div className="trip-card-actions">
                    <Link to={`/itinerary/${trip.id}`} className="btn-view-trip">
                      <span>Xem chi tiết</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </TiltCard3D>
              ))}
            </div>
          ) : (
            <div className="empty-trips-box">
              <Route size={36} className="text-slate-500 mb-3" />
              <h3>Chưa có lịch trình nào được lưu</h3>
              <p>
                Hãy bắt đầu tạo lịch trình đầu tiên để khám phá các khung giờ trải nghiệm độc đáo
                tại Sài Gòn.
              </p>
              <Link to="/planner" className="btn-primary-3d btn-sm">
                <span>Tạo lịch trình ngay</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
