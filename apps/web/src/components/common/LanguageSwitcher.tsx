import { Globe } from 'lucide-react'
import { setLocale, useLocale } from '../../i18n'

export function LanguageSwitcher({
  compact = false,
  className = '',
}: {
  compact?: boolean
  className?: string
}) {
  const locale = useLocale()

  return (
    <div
      className={`locale-switcher-3d ${className}`}
      role="group"
      aria-label="Ngôn ngữ / Language"
      title={locale === 'vi' ? 'Chuyển sang Tiếng Anh (EN)' : 'Switch to Vietnamese (VN)'}
    >
      {!compact && <Globe size={13} className="text-emerald locale-globe-icon" />}
      <button
        type="button"
        className={`locale-btn-pill ${locale === 'vi' ? 'active' : ''}`}
        onClick={() => setLocale('vi')}
        aria-pressed={locale === 'vi'}
        aria-label="Tiếng Việt"
      >
        <span>VN</span>
      </button>
      <span className="locale-sep">/</span>
      <button
        type="button"
        className={`locale-btn-pill ${locale === 'en' ? 'active' : ''}`}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        aria-label="English"
      >
        <span>EN</span>
      </button>
    </div>
  )
}
