import { ArrowUpRight, Clock3, MapPin, Users, Sparkles, Compass } from 'lucide-react'
import type { Experience } from '../../types'
import { SimulatedBadge } from '../common/StatusBadge'
import { TiltCard3D } from '../3d/TiltCard3D'

const categoryMeta: Record<string, { label: string; color: string; icon: string }> = {
  handicraft: { label: 'Thủ công', color: 'bg-amber-500/10 text-amber-700 border-amber-200', icon: '🎨' },
  culture: { label: 'Văn hóa', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200', icon: '🏛️' },
  food: { label: 'Ẩm thực', color: 'bg-orange-500/10 text-orange-700 border-orange-200', icon: '🍜' },
  nature: { label: 'Thiên nhiên', color: 'bg-teal-500/10 text-teal-700 border-teal-200', icon: '🌿' },
  relaxation: { label: 'Thư giãn', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200', icon: '🍵' },
}

export function ExperienceCard({
  experience,
  selected,
  onSelect,
}: {
  experience: Experience
  selected?: boolean
  onSelect: () => void
}) {
  const slot = experience.slots.find((item) => !['full', 'unavailable', 'cancelled'].includes(item.status))
  const time = slot
    ? new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh',
      }).format(new Date(slot.start_at))
    : null

  const cat = categoryMeta[experience.poi.category] || { label: experience.poi.category, color: '', icon: '✨' }

  return (
    <TiltCard3D
      maxTilt={6}
      scale={selected ? 1.02 : 1.01}
      className={`experience-card-3d ${selected ? 'card-3d-selected' : ''}`}
      onClick={onSelect}
    >
      <div className="card-3d-inner">
        <div className="card-top-row">
          <div className="cat-badge">
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-label">{cat.label}</span>
          </div>
          <div className="card-action-hint">
            <ArrowUpRight size={16} />
          </div>
        </div>

        <h3 className="card-title">{experience.name}</h3>
        <p className="card-desc">{experience.description}</p>

        {/* Intent Tags */}
        <div className="card-tags-row">
          {experience.intent_tags.slice(0, 3).map((tag) => (
            <span key={tag} className="intent-pill">
              #{tag.replaceAll('_', ' ')}
            </span>
          ))}
        </div>

        {/* Meta Stats: Duration & Price */}
        <div className="card-stats-row">
          <div className="stat-item">
            <Clock3 size={14} className="stat-icon" />
            <span>{experience.duration_min} phút</span>
          </div>
          <div className="stat-item">
            <Users size={14} className="stat-icon" />
            <span>{experience.price_vnd.toLocaleString('vi-VN')}₫ / người</span>
          </div>
          {experience.indoor ? (
            <div className="stat-item">
              <Compass size={14} className="stat-icon" />
              <span>Trong nhà</span>
            </div>
          ) : (
            <div className="stat-item">
              <Sparkles size={14} className="stat-icon" />
              <span>Ngoài trời</span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="card-footer-3d">
          <span className="slot-notice">
            <MapPin size={13} className="text-emerald" />
            {slot ? `Khung giờ từ ${time}` : 'Chưa có slot cố định'}
          </span>
          <SimulatedBadge />
        </div>
      </div>
    </TiltCard3D>
  )
}
