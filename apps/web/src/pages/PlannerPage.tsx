import { useState, type FormEvent } from 'react'
import { ArrowRight, CalendarDays, Clock3, Compass, MapPin, Minus, Plus, Users, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiErrorMessage, createItinerary } from '../api/client'

const intents = [
  { id: 'handicraft', label: 'Thủ công', glyph: '✳' },
  { id: 'food', label: 'Ẩm thực', glyph: '◒' },
  { id: 'culture', label: 'Văn hóa', glyph: '⌂' },
  { id: 'nature', label: 'Thiên nhiên', glyph: '❋' },
  { id: 'relaxation', label: 'Thư giãn', glyph: '≈' },
]
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
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
  const [budget, setBudget] = useState(1000000)
  const [transport, setTransport] = useState('driving')
  const [selectedIntents, setSelectedIntents] = useState<string[]>(['handicraft', 'food'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleIntent = (id: string) => setSelectedIntents((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const toIso = (value: string) => new Date(`${date}T${value}:00+07:00`).toISOString()
      const result = await createItinerary({
        start_at: toIso(startTime), end_at: toIso(endTime), group_size: groupSize, budget_vnd: budget,
        transport_mode: transport, intent_weights: Object.fromEntries(selectedIntents.map((intent) => [intent, 1])), locked_experience_ids: [],
      })
      navigate(`/itinerary/${result.itinerary_id}`, { state: { itinerary: result } })
    } catch (reason) { setError(apiErrorMessage(reason)) } finally { setLoading(false) }
  }

  return <div className="page-wrap planner-page">
    <div className="planner-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> LỊCH TRÌNH CỦA BẠN</span><h1>Lên một ngày <em>đáng nhớ.</em></h1><p>Cho chúng tôi biết bạn muốn trải nghiệm điều gì. Các khung giờ demo và di chuyển đều được đánh dấu rõ.</p></div><div className="planner-number"><span>01</span><small>TP. HỒ CHÍ MINH</small></div></div>
    <div className="planner-grid">
      <form className="planner-form" onSubmit={submit}>
        <div className="form-section"><div className="form-section-title"><span>01</span><div><h2>Thời gian & nhóm</h2><p>Đặt khung cho chuyến đi của bạn.</p></div></div>
          <div className="form-grid form-grid-three">
            <label className="form-field"><span><CalendarDays size={15} /> Ngày đi</span><input required type="date" value={date} min={today()} onChange={(event) => setDate(event.target.value)} /></label>
            <label className="form-field"><span><Clock3 size={15} /> Bắt đầu</span><input required type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
            <label className="form-field"><span><Clock3 size={15} /> Kết thúc</span><input required type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label>
          </div>
          <div className="form-grid form-grid-two planner-lower-fields">
            <div className="form-field"><span><Users size={15} /> Số người</span><div className="stepper"><button type="button" aria-label="Giảm số người" onClick={() => setGroupSize(Math.max(1, groupSize - 1))}><Minus size={14} /></button><strong>{groupSize}</strong><button type="button" aria-label="Tăng số người" onClick={() => setGroupSize(Math.min(50, groupSize + 1))}><Plus size={14} /></button></div></div>
            <label className="form-field"><span><Wallet size={15} /> Ngân sách nhóm (VND)</span><input required type="number" min={0} step={50000} value={budget} onChange={(event) => setBudget(Math.max(0, Number(event.target.value)))} /></label>
          </div>
        </div>
        <div className="form-section"><div className="form-section-title"><span>02</span><div><h2>Nhịp đi của bạn</h2><p>Chọn những điều bạn muốn chuyến đi ưu tiên.</p></div></div>
          <div className="intent-choices">{intents.map((intent) => <button key={intent.id} type="button" className={`intent-choice ${selectedIntents.includes(intent.id) ? 'intent-choice-active' : ''}`} onClick={() => toggleIntent(intent.id)}><span>{intent.glyph}</span>{intent.label}</button>)}</div>
          <label className="form-field transport-field"><span><Compass size={15} /> Phương tiện di chuyển</span><select value={transport} onChange={(event) => setTransport(event.target.value)}><option value="driving">Ô tô / xe máy (ước tính)</option><option value="walking">Đi bộ (ước tính)</option><option value="bicycling">Xe đạp (ước tính)</option><option value="transit">Phương tiện công cộng (ước tính)</option></select></label>
        </div>
        {error && <div className="form-alert">{error}</div>}
        <div className="submit-row"><button className="button button-primary submit-button" type="submit" disabled={loading}>{loading ? 'Đang xếp lịch...' : 'Tạo lịch trình'} <ArrowRight size={17} /></button><span><MapPin size={14} /> TP. Hồ Chí Minh · Dữ liệu mô phỏng</span></div>
      </form>
      <aside className="planner-aside"><div className="aside-map-art"><div className="art-contour contour-1" /><div className="art-contour contour-2" /><div className="art-contour contour-3" /><span className="art-pin"><MapPin size={20} /></span><span className="art-coordinate">10.7769° N<br />106.7009° E</span><span className="art-label">SÀI GÒN<br /><small>THÀNH PHỐ CỦA NHỮNG NGÕ RẼ</small></span></div><div className="aside-note"><span className="aside-spark">✳</span><h3>Một kế hoạch tốt biết cả điều chưa chắc.</h3><p>Chỗ trống chưa được báo cáo sẽ hiện là “cần xác nhận” — không bị hiểu nhầm thành hết chỗ.</p><div className="aside-rule" /><span className="aside-caption">FORM CẤU TRÚC · HOẠT ĐỘNG ĐỘC LẬP VỚI CHATBOT</span></div></aside>
    </div>
  </div>
}
