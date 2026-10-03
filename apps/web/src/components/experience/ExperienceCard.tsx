import { ArrowUpRight, Clock3, MapPin, Users, Sparkles, Compass } from 'lucide-react'
import type { Experience } from '../../types'
import { VerificationBadge } from '../common/StatusBadge'
import { TiltCard3D } from '../3d/TiltCard3D'
import { useTranslation } from '../../i18n'

export function ExperienceCard({
  experience,
  selected,
  onSelect,
}: {
  experience: Experience
  selected?: boolean
  onSelect: () => void
}) {
  const { t, locale } = useTranslation()

  const categoryMeta: Record<string, { label: string; color: string; icon: string }> = {
    handicraft: { label: t('explore.intentCraft'), color: 'bg-amber-500/10 text-amber-700 border-amber-200', icon: '🎨' },
    culture: { label: t('explore.intentCulture'), color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200', icon: '🏛️' },
    food: { label: t('explore.intentFood'), color: 'bg-orange-500/10 text-orange-700 border-orange-200', icon: '🍜' },
    nature: { label: t('explore.intentNature'), color: 'bg-teal-500/10 text-teal-700 border-teal-200', icon: '🌿' },
    relaxation: { label: t('explore.intentRelax'), color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200', icon: '🍵' },
  }

  const slot = experience.slots.find((item) => !['full', 'unavailable', 'cancelled'].includes(item.status))
  const time = slot
    ? new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
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
            <span>{experience.duration_min} {t('explore.minutes')}</span>
          </div>
          <div className="stat-item">
            <Users size={14} className="stat-icon" />
            <span>
              {experience.price_vnd.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
              {locale === 'vi' ? '₫ / người' : ' VND / person'}
            </span>
          </div>
          {experience.indoor ? (
            <div className="stat-item">
              <Compass size={14} className="stat-icon" />
              <span>{locale === 'vi' ? 'Trong nhà' : 'Indoor'}</span>
            </div>
          ) : (
            <div className="stat-item">
              <Sparkles size={14} className="stat-icon" />
              <span>{locale === 'vi' ? 'Ngoài trời' : 'Outdoor'}</span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="card-footer-3d">
          <span className="slot-notice">
            <MapPin size={13} className="text-emerald" />
            {slot ? t('explore.slotNotice', { time: time || '' }) : t('explore.noFixedSlot')}
          </span>
          <VerificationBadge status={experience.data_mode === 'real' ? 'verified' : 'simulated'} />
        </div>
        {experience.data_mode === 'real' && slot?.confirmed_at && slot.expires_at && (
          <small className="slot-freshness-note">
            Cơ sở xác nhận lúc {new Date(slot.confirmed_at).toLocaleString()} · còn hiệu lực đến {new Date(slot.expires_at).toLocaleString()}
          </small>
        )}
        {experience.data_mode === 'real' && experience.source_evidence?.[0] && (
          <a
            className="source-evidence-link"
            href={experience.source_evidence[0].source_uri}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            title={`Nguồn xác nhận ${experience.source_evidence[0].observed_at || ''}; hết hạn ${experience.source_evidence[0].expires_at || ''}`}
          >
            {experience.source_evidence[0].source_label || 'Xem nguồn đã duyệt'}
            {experience.source_evidence[0].expires_at && ` · đến ${new Date(experience.source_evidence[0].expires_at).toLocaleDateString()}`}
          </a>
        )}
      </div>
    </TiltCard3D>
  )
}
