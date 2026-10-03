import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Share2,
  Clock,
  Route,
  Wallet,
  MapPin,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { getSharedItinerary } from '../api/client'
import { TiltCard3D } from '../components/3d/TiltCard3D'
import type { Itinerary } from '../types'
import { useTranslation } from '../i18n'

const timeLabel = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))

export function SharedItineraryPage() {
  const { t, locale } = useTranslation()
  const { token = '' } = useParams()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getSharedItinerary(token)
      .then(setItinerary)
      .catch(() => setError(locale === 'en'
        ? 'Shared link is invalid or has been revoked.'
        : 'Liên kết chia sẻ không hợp lệ hoặc đã bị thu hồi.'))
  }, [token, locale])

  if (error) {
    return (
      <div className="page-wrap not-found-3d">
        <div className="not-found-card">
          <AlertCircle size={40} className="text-amber" />
          <h1>{locale === 'en' ? 'Link Unavailable' : 'Liên kết không khả dụng'}</h1>
          <p>{error}</p>
          <Link to="/planner" className="btn-primary-3d">
            {t('shared.planNowBtn')} <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="page-wrap page-loading-3d">
        <span className="loader-orbit" />
        <h2>{locale === 'en' ? 'Loading shared itinerary...' : 'Đang tải lịch trình được chia sẻ...'}</h2>
        <p>{locale === 'en' ? 'Please wait while we fetch the trip details.' : 'Vui lòng đợi giây lát trong khi hệ thống nạp dữ liệu chuyến đi.'}</p>
      </div>
    )
  }

  return (
    <div className="shared-page-3d page-wrap">
      {/* Shared Banner */}
      <div className="shared-banner-card">
        <div className="shared-banner-badge">
          <Share2 size={14} className="text-emerald" />
          <span>{t('shared.bannerEyebrow')}</span>
        </div>
        <h1 className="shared-banner-title">
          {t('shared.bannerTitle')} <em>{t('shared.bannerTitleHighlight')}</em>
        </h1>
        <p className="shared-banner-sub">
          {t('shared.bannerSub', { count: itinerary.stops.length })}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="itinerary-metrics-grid">
        <TiltCard3D maxTilt={6} className="metric-kpi-card">
          <div className="kpi-icon-box text-emerald">
            <MapPin size={20} />
          </div>
          <div className="kpi-info">
            <small>{t('shared.kpiStops')}</small>
            <strong>{itinerary.stops.length} {locale === 'en' ? 'stops' : 'trải nghiệm'}</strong>
            <span>{t('shared.kpiStopsSub')}</span>
          </div>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} className="metric-kpi-card">
          <div className="kpi-icon-box text-amber">
            <Wallet size={20} />
          </div>
          <div className="kpi-info">
            <small>{t('shared.kpiCost')}</small>
            <strong>{itinerary.estimated_cost_vnd.toLocaleString('vi-VN')}₫</strong>
            <span>{t('shared.kpiCostSub')}</span>
          </div>
        </TiltCard3D>

        <TiltCard3D maxTilt={6} className="metric-kpi-card">
          <div className="kpi-icon-box text-cyan">
            <Route size={20} />
          </div>
          <div className="kpi-info">
            <small>{t('shared.kpiTravel')}</small>
            <strong>{itinerary.total_travel_min} {locale === 'en' ? 'mins' : 'phút'}</strong>
            <span>{t('shared.kpiTravelSub')}</span>
          </div>
        </TiltCard3D>
      </div>

      {/* Stops Timeline */}
      <div className="shared-timeline-section">
        <h2 className="section-title-3d">{t('shared.detailsTitle')}</h2>

        <div className="shared-stops-list">
          {itinerary.stops.map((stop) => (
            <article key={stop.id} className="shared-stop-card">
              <div className="shared-stop-order">{stop.position}</div>
              <div className="shared-stop-body">
                <div className="shared-stop-top">
                  <span className="shared-time-badge">
                    <Clock size={13} className="text-emerald" />
                    {timeLabel(stop.start_at, locale)} — {timeLabel(stop.end_at, locale)}
                  </span>
                  <span className="shared-cat-tag">{stop.category}</span>
                </div>

                <h3 className="shared-stop-name">{stop.name}</h3>

                <p className="shared-stop-addr">
                  <MapPin size={13} className="text-emerald" /> {stop.poi.address}
                </p>

                <div className="shared-stop-footer">
                  <span>{locale === 'en' ? `Duration: ${stop.duration_min} mins` : `Thời lượng: ${stop.duration_min} phút`}</span>
                  <span>·</span>
                  <span>{stop.cost_vnd.toLocaleString('vi-VN')}₫ / {locale === 'en' ? 'person' : 'người'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="shared-cta-card">
        <div className="shared-cta-inner">
          <Sparkles size={28} className="text-amber" />
          <div>
            <h3>{t('shared.ctaHeading')}</h3>
            <p>
              {t('shared.ctaDesc')}
            </p>
          </div>
          <Link to="/planner" className="btn-primary-3d">
            <span>{t('shared.planNowBtn')}</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  )
}
