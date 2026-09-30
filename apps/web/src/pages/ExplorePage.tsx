import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Filter, Search, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiErrorMessage, getExperiences } from '../api/client'
import { ExperienceCard } from '../components/experience/ExperienceCard'
import { MapAdapter } from '../components/map/MapAdapter'
import { SimulatedBadge } from '../components/common/StatusBadge'
import type { Experience } from '../types'

const categories = [{ value: '', label: 'Tất cả mục đích' }, { value: 'handicraft', label: 'Thủ công' }, { value: 'food', label: 'Ẩm thực' }, { value: 'culture', label: 'Văn hóa' }, { value: 'nature', label: 'Thiên nhiên' }, { value: 'relaxation', label: 'Thư giãn' }]
const localToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
const localTomorrow = () => {
  const date = new Date(`${localToday()}T12:00:00+07:00`)
  date.setUTCDate(date.getUTCDate() + 1)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date)
}

export function ExplorePage() {
  const [items, setItems] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [intent, setIntent] = useState('')
  const [date, setDate] = useState(localTomorrow())
  const [time, setTime] = useState('09:00')
  const [groupSize, setGroupSize] = useState(2)
  const [budget, setBudget] = useState(2000000)
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    const from = new Date(`${date}T${time}:00+07:00`).toISOString()
    const to = new Date(`${date}T23:59:59+07:00`).toISOString()
    getExperiences({ ...(intent ? { intent } : {}), start_at: from, end_at: to, group_size: groupSize, max_price: Math.floor(budget / groupSize) })
      .then((data) => { if (active) { setItems(data); if (!selectedId && data[0]) setSelectedId(data[0].id) } })
      .catch((reason: unknown) => { if (active) setError(apiErrorMessage(reason)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [intent, date, time, groupSize, budget])

  const visible = useMemo(() => items.filter((item) => `${item.name} ${item.description} ${item.poi.name}`.toLowerCase().includes(search.toLowerCase())), [items, search])
  const points = visible.map((item) => ({ id: item.id, latitude: item.poi.latitude, longitude: item.poi.longitude, name: item.name, category: item.poi.category }))
  const activeExperience = visible.find((item) => item.id === selectedId)

  return <div className="page-wrap explore-page">
    <div className="page-title-row"><div><span className="eyebrow"><span className="eyebrow-line" /> KHÁM PHÁ TP. HỒ CHÍ MINH</span><h1>Điều gì gọi bạn <em>hôm nay?</em></h1><p>Chọn một trải nghiệm vừa với thời gian, ngân sách và nhịp đi của bạn.</p></div><SimulatedBadge /></div>
    <div className="explore-toolbar">
      <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm một trải nghiệm..." /></label>
      <label className="toolbar-select"><Filter size={15} /><select value={intent} onChange={(event) => setIntent(event.target.value)}>{categories.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
      <label className="toolbar-input"><span>Ngày đi</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label className="toolbar-input"><span>Giờ đến</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
      <label className="toolbar-input"><span>Số người</span><input type="number" min={1} max={50} value={groupSize} onChange={(event) => setGroupSize(Math.max(1, Number(event.target.value)))} /></label>
      <label className="toolbar-input budget-input"><span>Ngân sách nhóm</span><input type="number" min={0} step={100000} value={budget} onChange={(event) => setBudget(Math.max(0, Number(event.target.value)))} /></label>
      <button type="button" className="filter-icon" aria-label="Bộ lọc"><SlidersHorizontal size={17} /></button>
    </div>
    {error && <div className="inline-alert">{error} <Link to="/planner">Mở planner <ArrowRight size={14} /></Link></div>}
    <div className="explore-layout">
      <section className="results-column">
        <div className="results-heading"><div><span className="eyebrow-small">GỢI Ý DÀNH CHO BẠN</span><strong>{loading ? 'Đang tìm...' : `${visible.length} trải nghiệm`}</strong></div><span>TP. Hồ Chí Minh · Dữ liệu demo</span></div>
        <div className="experience-list">{loading ? <div className="empty-state"><span className="loader-dot" /> Đang tìm những khung giờ phù hợp...</div> : visible.length ? visible.map((experience) => <ExperienceCard key={experience.id} experience={experience} selected={selectedId === experience.id} onSelect={() => setSelectedId(experience.id)} />) : <div className="empty-state"><span className="empty-illustration">✳</span><strong>Chưa thấy trải nghiệm phù hợp</strong><span>Thử nới rộng bộ lọc hoặc đổi ngày khám phá.</span></div>}</div>
      </section>
      <section className="map-column"><div className="map-panel-heading"><div><span className="eyebrow-small">CÙNG MỘT THÀNH PHỐ</span><strong>Bản đồ trải nghiệm</strong></div><span className="map-result-count">{visible.length} điểm demo</span></div><MapAdapter points={points} selectedId={selectedId} onSelect={setSelectedId} className="explore-map" />{activeExperience && <div className="map-selected"><span><strong>{activeExperience.name}</strong><small>{activeExperience.poi.address}</small></span><span className="map-selected-dot" /></div>}<p className="map-disclaimer">Vị trí minh họa · không đại diện địa điểm kinh doanh thực · tuyến đường chưa được tính thực tế.</p></section>
    </div>
  </div>
}
