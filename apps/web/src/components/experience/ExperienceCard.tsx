import { ArrowUpRight, Clock3, MapPin, Users } from 'lucide-react'
import type { Experience } from '../../types'
import { SimulatedBadge } from '../common/StatusBadge'

const categoryNames: Record<string, string> = { handicraft: 'Thủ công', culture: 'Văn hóa', food: 'Ẩm thực', nature: 'Thiên nhiên', relaxation: 'Thư giãn' }

export function ExperienceCard({ experience, selected, onSelect }: { experience: Experience; selected?: boolean; onSelect: () => void }) {
  const slot = experience.slots.find((item) => item.status !== 'unavailable' && item.status !== 'cancelled')
  const time = slot ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(slot.start_at)) : null
  return <button type="button" className={`experience-card ${selected ? 'experience-card-active' : ''}`} onClick={onSelect}>
    <div className="experience-card-top"><span className="category-kicker">{categoryNames[experience.poi.category] ?? experience.poi.category}</span><ArrowUpRight size={17} /></div>
    <h3>{experience.name}</h3>
    <p className="experience-description">{experience.description}</p>
    <div className="tag-row">{experience.intent_tags.slice(0, 3).map((tag) => <span key={tag} className="intent-tag">{tag.replaceAll('_', ' ')}</span>)}</div>
    <div className="experience-meta">
      <span><Clock3 size={14} /> {experience.duration_min} phút</span>
      <span><Users size={14} /> {experience.price_vnd.toLocaleString('vi-VN')}₫ / người</span>
    </div>
    <div className="experience-footer">
      <span className="slot-hint"><MapPin size={13} /> {slot ? `Khung giờ demo từ ${time}` : 'Chưa có khung giờ demo'}</span>
      <SimulatedBadge />
    </div>
  </button>
}
