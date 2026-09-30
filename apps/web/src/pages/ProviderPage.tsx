import { useEffect, useState } from 'react'
import { ArrowUpRight, CalendarClock, CircleAlert, CircleCheck, Clock3, Pencil, Users } from 'lucide-react'
import { apiErrorMessage, getExperiences } from '../api/client'
import { SimulatedBadge } from '../components/common/StatusBadge'
import type { Experience } from '../types'

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
const hour = (value: string) => new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value))

export function ProviderPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('')
  useEffect(() => {
    const start = new Date(`${today()}T00:00:00+07:00`).toISOString()
    const end = new Date(`${today()}T23:59:59+07:00`).toISOString()
    getExperiences({ start_at: start, end_at: end }).then(setExperiences).catch((reason) => setError(apiErrorMessage(reason)))
  }, [])
  const slotCount = experiences.reduce((total, experience) => total + experience.slots.length, 0)
  const uncertain = experiences.flatMap((experience) => experience.slots).filter((slot) => slot.available_reported === null).length
  return <div className="page-wrap provider-page">
    <div className="provider-banner"><div><span className="eyebrow eyebrow-light"><span className="eyebrow-line" /> WORKSPACE NHÀ CUNG CẤP</span><h1>Trải nghiệm của bạn,<br /><em>được lên kế hoạch tốt hơn.</em></h1><p>Cập nhật thông tin và giữ khung giờ trải nghiệm rõ ràng cho mọi chuyến đi.</p></div><div className="provider-banner-mark"><CalendarClock size={38} strokeWidth={1.2} /><span>01 / ĐỐI TÁC</span></div></div>
    <div className="provider-stats"><div><span>TRẢI NGHIỆM ĐANG HIỂN THỊ</span><strong>{experiences.length}</strong><small><CircleCheck size={13} /> Dữ liệu demo</small></div><div><span>KHUNG GIỜ HÔM NAY</span><strong>{slotCount}</strong><small><Clock3 size={13} /> Mô phỏng, không xác nhận</small></div><div><span>CẦN XÁC NHẬN</span><strong>{uncertain}</strong><small><CircleAlert size={13} /> Sức chứa chưa biết</small></div></div>
    <div className="provider-table-heading"><div><span className="eyebrow-small">QUẢN LÝ NỘI DUNG</span><h2>Trải nghiệm & khung giờ</h2></div><button className="button button-outline" type="button" onClick={() => window.alert('Biểu mẫu chỉnh sửa sẽ được bổ sung sau khi có xác thực nhà cung cấp.')}>Thêm trải nghiệm <ArrowUpRight size={15} /></button></div>
    {error && <div className="inline-alert">{error}</div>}
    <div className="provider-table"><div className="table-row table-head"><span>TRẢI NGHIỆM</span><span>KHUNG GIỜ KẾ TIẾP</span><span>SỨC CHỨA</span><span>TRẠNG THÁI</span><span /></div>{experiences.map((experience) => {
      const slot = experience.slots[0]
      const capacity = slot?.available_reported == null ? 'Chưa xác nhận' : `${slot.available_reported} chỗ`
      return <div className={`table-row provider-row ${selected === experience.id ? 'provider-row-open' : ''}`} key={experience.id} onClick={() => setSelected(selected === experience.id ? '' : experience.id)} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && setSelected(selected === experience.id ? '' : experience.id)}>
        <span className="provider-experience-name"><i>{experience.poi.category.slice(0, 1).toUpperCase()}</i><span><strong>{experience.name}</strong><small>{experience.poi.name}</small></span></span>
        <span>{slot ? <><strong>{hour(slot.start_at)} – {hour(slot.end_at)}</strong><small>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(slot.start_at))}</small></> : 'Chưa có slot'}</span>
        <span className={slot?.available_reported == null ? 'capacity-unknown' : ''}><Users size={14} /> {capacity}</span>
        <span><SimulatedBadge /></span><span className="table-edit"><Pencil size={14} />{selected === experience.id ? 'Đóng' : 'Xem'}</span>
        {selected === experience.id && <div className="provider-expanded"><p>{experience.description}</p><span>Thời lượng: {experience.duration_min} phút</span><span>Giá demo: {experience.price_vnd.toLocaleString('vi-VN')}₫ / người</span><button type="button" onClick={(event) => { event.stopPropagation(); window.alert('Chỉnh sửa cần đăng nhập nhà cung cấp; phiên bản prototype chưa lưu thay đổi.') }}>Chỉnh sửa chi tiết <ArrowUpRight size={14} /></button></div>}
      </div>
    })}{!experiences.length && !error && <div className="empty-state">Đang tải trải nghiệm...</div>}</div>
    <p className="provider-footnote">Bảng này là prototype chỉ đọc. Xác thực, phân quyền và cập nhật slot sẽ được bổ sung trước khi dùng dữ liệu nhà cung cấp thật.</p>
  </div>
}
