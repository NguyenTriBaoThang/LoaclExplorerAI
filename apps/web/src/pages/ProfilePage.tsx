import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { apiErrorMessage, changePassword, getMyItineraries, updateProfile } from '../api/client'
import { useAuth } from '../auth'

export function ProfilePage() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.display_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [password, setPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [trips, setTrips] = useState<Array<{ id: string; planned_date: string | null; status: string; estimated_cost_vnd: number }>>([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { getMyItineraries().then(setTrips).catch(() => setTrips([])) }, [])

  async function save(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice('')
    try { setUser(await updateProfile(name, phone || null)); setNotice('Đã lưu hồ sơ.') }
    catch (reason) { setError(apiErrorMessage(reason)) }
  }
  async function savePassword(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice('')
    try { await changePassword(currentPassword || null, password); setPassword(''); setCurrentPassword(''); setNotice('Đã đổi mật khẩu.') }
    catch (reason) { setError(apiErrorMessage(reason)) }
  }

  return <div className="page-wrap" style={{ maxWidth: 900, paddingTop: 36 }}>
    <h1>Hồ sơ tài khoản</h1><p>{user?.email} · Quyền: {user?.role}</p>
    {notice && <p role="status">{notice}</p>}{error && <div className="form-alert-3d">{error}</div>}
    <section className="form-card-3d"><h2>Thông tin cá nhân</h2><form onSubmit={save} className="form-fields-grid-2">
      <label className="field-group-3d"><span>Họ tên</span><input required value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="field-group-3d"><span>Số điện thoại</span><input value={phone} onChange={e => setPhone(e.target.value)} /></label>
      <button className="btn-planner-submit">Lưu thay đổi</button>
    </form></section>
    <section className="form-card-3d" style={{ marginTop: 16 }}><h2>Đổi mật khẩu</h2><form onSubmit={savePassword} className="form-fields-grid-2">
      <label className="field-group-3d"><span>Mật khẩu hiện tại (để trống nếu đăng nhập Google)</span><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label>
      <label className="field-group-3d"><span>Mật khẩu mới</span><input required minLength={12} type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button className="btn-planner-submit">Cập nhật mật khẩu</button>
    </form></section>
    <section className="form-card-3d" style={{ marginTop: 16 }}><h2>Lịch trình của tôi</h2><p><Link to="/compare">So sánh hai lịch trình</Link></p>{trips.length ? trips.map(trip => <p key={trip.id}><Link to={`/itinerary/${trip.id}`}>{trip.planned_date || trip.id}</Link> · {trip.status} · {trip.estimated_cost_vnd.toLocaleString('vi-VN')} ₫</p>) : <p>Chưa có lịch trình đã lưu.</p>}</section>
  </div>
}
