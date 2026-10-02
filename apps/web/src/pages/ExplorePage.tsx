import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Search,
  Calendar,
  Clock,
  Users,
  Wallet,
  Sparkles,
  MapPin,
  RotateCcw,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiErrorMessage, getExperiences, searchExperiences } from '../api/client'
import { ExperienceCard } from '../components/experience/ExperienceCard'
import { MapAdapter } from '../components/map/MapAdapter'
import { SimulatedBadge } from '../components/common/StatusBadge'
import type { Experience } from '../types'

const categories = [
  { value: '', label: 'Tất cả mục đích', icon: '✨' },
  { value: 'food', label: 'Ẩm thực', icon: '🍜' },
  { value: 'handicraft', label: 'Thủ công', icon: '🎨' },
  { value: 'culture', label: 'Văn hóa', icon: '🏛️' },
  { value: 'nature', label: 'Thiên nhiên', icon: '🌿' },
  { value: 'relaxation', label: 'Thư giãn', icon: '🍵' },
]

const localToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
const localTomorrow = () => {
  const date = new Date(`${localToday()}T12:00:00+07:00`)
  date.setUTCDate(date.getUTCDate() + 1)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date)
}

export function ExplorePage() {
  const [searchParams] = useSearchParams()
  const initialIntent = searchParams.get('intent') || ''

  const [items, setItems] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [intent, setIntent] = useState(initialIntent)
  const [date, setDate] = useState(localTomorrow())
  const [time, setTime] = useState('09:00')
  const [groupSize, setGroupSize] = useState(2)
  const [budget, setBudget] = useState(2000000)
  const [indoor, setIndoor] = useState('all')
  const [topic, setTopic] = useState('')
  const [radiusKm, setRadiusKm] = useState(15)
  const [slotId, setSlotId] = useState('')
  const [semantic, setSemantic] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    const from = new Date(`${date}T${time}:00+07:00`).toISOString()
    const to = new Date(`${date}T23:59:59+07:00`).toISOString()

    const params = {
      ...(intent ? { intent } : {}),
      ...(topic ? { topic } : {}),
      ...(indoor !== 'all' ? { is_indoor: indoor === 'indoor' } : {}),
      start_at: from,
      end_at: to,
      group_size: groupSize,
      max_price: Math.floor(budget / groupSize),
      max_distance_km: radiusKm,
      center_latitude: 10.7769,
      center_longitude: 106.7009,
      ...(slotId ? { slot_id: slotId } : {}),
    }
    const request = semantic && search.trim().length >= 2
      ? searchExperiences(search.trim(), params, true)
      : getExperiences({ ...params, ...(search.trim() ? { query: search.trim() } : {}) })
    request
      .then((data) => {
        if (active) {
          setItems(data)
          setSelectedId(current => data.some(item => item.id === current) ? current : (data[0]?.id || ''))
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(apiErrorMessage(reason))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [intent, date, time, groupSize, budget, indoor, topic, radiusKm, slotId, semantic, search])

  const visible = useMemo(
    () =>
      items.filter((item) => semantic || !search.trim() ||
        `${item.name} ${item.description} ${item.poi.name}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [items, search, semantic]
  )

  const points = visible.map((item, index) => ({
    id: item.id,
    latitude: item.poi.latitude,
    longitude: item.poi.longitude,
    name: item.name,
    category: item.poi.category,
    number: index + 1,
  }))

  const activeExperience = visible.find((item) => item.id === selectedId)

  const resetFilters = () => {
    setSearch('')
    setIntent('')
    setDate(localTomorrow())
    setTime('09:00')
    setGroupSize(2)
    setBudget(2000000)
    setIndoor('all')
    setTopic('')
    setRadiusKm(15)
    setSlotId('')
    setSemantic(false)
  }

  return (
    <div className="explore-page-3d page-wrap">
      {/* Title & Banner */}
      <div className="page-title-row-3d">
        <div>
          <span className="eyebrow-3d">
            <span className="eyebrow-dot" /> KHÁM PHÁ TP. HỒ CHÍ MINH
          </span>
          <h1 className="page-heading-3d">
            Điều gì đang chờ bạn <em>hôm nay?</em>
          </h1>
          <p className="page-subtext-3d">
            Bộ lọc thông minh giúp bạn tìm thấy trải nghiệm vừa với khung giờ rảnh, ngân sách và sở thích.
          </p>
        </div>
        <div className="title-extra-badges">
          <SimulatedBadge />
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="category-pills-strip">
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            className={`cat-pill-btn ${intent === cat.value ? 'cat-pill-active' : ''}`}
            onClick={() => setIntent(cat.value)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Modern Glassmorphic Toolbar */}
      <div className="explore-toolbar-3d">
        <div className="search-box-3d">
          <Search size={18} className="search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên trải nghiệm, địa điểm hoặc từ khóa..."
          />
          {search && (
            <button type="button" className="clear-search-btn" onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>

        <div className="filter-inputs-group">
          {/* Date Picker */}
          <div className="toolbar-input-card">
            <div className="input-card-label">
              <Calendar size={13} className="text-emerald" />
              <span>Ngày đi</span>
            </div>
            <input
              type="date"
              value={date}
              min={localToday()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Time Picker */}
          <div className="toolbar-input-card">
            <div className="input-card-label">
              <Clock size={13} className="text-amber" />
              <span>Giờ đến</span>
            </div>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>

          {/* Group Size */}
          <div className="toolbar-input-card">
            <div className="input-card-label">
              <Users size={13} className="text-cyan" />
              <span>Số người</span>
            </div>
            <input
              type="number"
              min={1}
              max={50}
              value={groupSize}
              onChange={(e) => setGroupSize(Math.max(1, Number(e.target.value)))}
            />
          </div>

          {/* Budget */}
          <div className="toolbar-input-card budget-card">
            <div className="input-card-label">
              <Wallet size={13} className="text-emerald" />
              <span>Ngân sách nhóm</span>
            </div>
            <input
              type="number"
              min={0}
              step={100000}
              value={budget}
              onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
            />
          </div>

          <button
            type="button"
            className="reset-filters-btn"
            onClick={resetFilters}
            title="Đặt lại bộ lọc"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="filter-inputs-group" style={{ margin: '12px 0', flexWrap: 'wrap' }}>
        <label>Chủ đề <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="vd: thủ công" /></label>
        <label>Không gian <select value={indoor} onChange={e => setIndoor(e.target.value)}><option value="all">Trong/ngoài nhà</option><option value="indoor">Trong nhà</option><option value="outdoor">Ngoài trời</option></select></label>
        <label>Bán kính từ trung tâm Q.1 (km) <input type="number" min={1} max={100} value={radiusKm} onChange={e => setRadiusKm(Math.max(1, Number(e.target.value)))} /></label>
        <label>Mã slot <input value={slotId} onChange={e => setSlotId(e.target.value)} placeholder="Tùy chọn" /></label>
        <label><input type="checkbox" checked={semantic} onChange={e => setSemantic(e.target.checked)} /> Tìm kiếm ngữ nghĩa E5 (chỉ cần câu mô tả ý định)</label>
      </div>

      {error && (
        <div className="inline-alert-3d">
          <Sparkles size={16} className="text-amber" />
          <span>{error}</span>
          <Link to="/planner" className="alert-link">
            Mở planner tự động <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Main Split Layout: Cards + Map */}
      <div className="explore-layout-3d">
        {/* Results List Column */}
        <section className="results-column-3d">
          <div className="results-header-3d">
            <div>
              <span className="results-sub">DANH SÁCH GỢI Ý</span>
              <strong className="results-count">
                {loading ? 'Đang tải trải nghiệm...' : `${visible.length} trải nghiệm phù hợp`}
              </strong>
            </div>
            <span className="budget-per-person">
              Ước tính: ~{(Math.floor(budget / groupSize)).toLocaleString('vi-VN')}₫ / người
            </span>
          </div>

          <div className="experience-list-3d">
            {loading ? (
              <div className="loading-state-3d">
                <span className="loader-orbit" />
                <p>Đang quét các khung giờ trải nghiệm tại TP. Hồ Chí Minh...</p>
              </div>
            ) : visible.length > 0 ? (
              visible.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  selected={selectedId === experience.id}
                  onSelect={() => setSelectedId(experience.id)}
                />
              ))
            ) : (
              <div className="empty-state-3d">
                <div className="empty-icon-box">🔍</div>
                <h3>Không tìm thấy trải nghiệm phù hợp</h3>
                <p>Hãy thử tăng ngân sách, thay đổi ngày đi hoặc xóa từ khóa tìm kiếm.</p>
                <button type="button" className="btn-secondary-3d" onClick={resetFilters}>
                  Đặt lại toàn bộ lọc
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Map Column */}
        <section className="map-column-3d">
          <div className="map-panel-header-3d">
            <div>
              <span className="map-sub">KHÔNG GIAN ĐỊA LÝ</span>
              <strong className="map-title">Bản đồ trải nghiệm 3D</strong>
            </div>
            <span className="map-points-badge">{visible.length} tọa độ</span>
          </div>

          <MapAdapter
            points={points}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="explore-map-container"
          />

          {activeExperience && (
            <div className="map-active-preview-card">
              <div className="preview-top">
                <span className="preview-tag">{activeExperience.poi.category}</span>
                <strong className="preview-name">{activeExperience.name}</strong>
              </div>
              <p className="preview-address">
                <MapPin size={13} className="text-emerald" /> {activeExperience.poi.address}
              </p>
            </div>
          )}

          <p className="map-note-text">
            Tọa độ và dữ liệu trải nghiệm mang tính chất mô phỏng trong bản prototype trình diễn.
          </p>
        </section>
      </div>
    </div>
  )
}
