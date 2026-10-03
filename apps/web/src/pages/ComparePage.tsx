import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GitCompare,
  ArrowRight,
  Wallet,
  Clock,
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  AlertCircle,
} from 'lucide-react'
import { compareItineraries, getMyItineraries } from '../api/client'
import { TiltCard3D } from '../components/3d/TiltCard3D'
import { useTranslation } from '../i18n'

type Trip = {
  id: string
  planned_date: string | null
  estimated_cost_vnd: number
  status: string
}

type ComparedPlan = {
  id: string
  status: string
  estimated_cost_vnd: number
  return_deadline: string
  stops: Array<{
    experience_id: string
    name: string
    start_at: string
    end_at: string
    cost_vnd: number
  }>
}

type Comparison = {
  first: ComparedPlan
  second: ComparedPlan
  cost_diff_vnd: number
  added_experience_ids: string[]
  removed_experience_ids: string[]
  order_changed: boolean
  return_deadline_diff_min: number
}

export function ComparePage() {
  const { t, locale } = useTranslation()
  const [trips, setTrips] = useState<Trip[]>([])
  const [first, setFirst] = useState('')
  const [second, setSecond] = useState('')
  const [result, setResult] = useState<Comparison | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyItineraries()
      .then((items) => {
        setTrips(items)
        setFirst(items[0]?.id || '')
        setSecond(items[1]?.id || '')
      })
      .catch(() => setError(locale === 'en'
        ? 'Please sign in to compare your saved itineraries.'
        : 'Vui lòng đăng nhập để so sánh các lịch trình đã lưu của bạn.'))
  }, [locale])

  async function compare() {
    setLoading(true)
    setError('')
    try {
      setResult((await compareItineraries(first, second)) as Comparison)
    } catch {
      setError(locale === 'en'
        ? 'Unable to compare. Please select two different itineraries.'
        : 'Không thể so sánh. Hãy chọn hai phương án lịch trình khác nhau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="compare-page-3d page-wrap">
      {/* Header */}
      <div className="page-title-row-3d">
        <div>
          <span className="eyebrow-3d">
            <span className="eyebrow-dot" /> {t('compare.eyebrow')}
          </span>
          <h1 className="page-heading-3d">
            {t('compare.headingMain')} <em>{t('compare.headingHighlight')}</em>
          </h1>
          <p className="page-subtext-3d">
            {t('compare.headingLead')}
          </p>
        </div>
      </div>

      {/* Plan Selector Card */}
      <div className="compare-selector-card">
        <div className="compare-select-grid">
          <div className="compare-select-col">
            <div className="compare-badge-chip badge-plan-a">{t('compare.planA')}</div>
            <label className="field-group-3d">
              <span>{t('compare.selectFirst')}</span>
              <select value={first} onChange={(e) => setFirst(e.target.value)}>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.planned_date ? `${locale === 'en' ? 'Date' : 'Ngày'} ${t.planned_date}` : (locale === 'en' ? 'Draft' : 'Bản nháp')} — #{t.id.slice(0, 8)} (
                    {t.estimated_cost_vnd.toLocaleString('vi-VN')}₫)
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="compare-vs-badge">
            <ArrowLeftRight size={20} className="text-emerald" />
          </div>

          <div className="compare-select-col">
            <div className="compare-badge-chip badge-plan-b">{t('compare.planB')}</div>
            <label className="field-group-3d">
              <span>{t('compare.selectSecond')}</span>
              <select value={second} onChange={(e) => setSecond(e.target.value)}>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.planned_date ? `${locale === 'en' ? 'Date' : 'Ngày'} ${t.planned_date}` : (locale === 'en' ? 'Draft' : 'Bản nháp')} — #{t.id.slice(0, 8)} (
                    {t.estimated_cost_vnd.toLocaleString('vi-VN')}₫)
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="compare-action-row">
          <button
            type="button"
            className="btn-primary-3d"
            disabled={!first || !second || first === second || loading}
            onClick={() => void compare()}
          >
            <GitCompare size={17} />
            <span>{loading ? t('compare.analyzing') : t('compare.compareDetailed')}</span>
          </button>
          {first === second && first && (
            <span className="compare-warn-note">{t('compare.pickDiffWarning')}</span>
          )}
        </div>
      </div>

      {error && (
        <div className="inline-alert-3d">
          <AlertCircle size={16} className="text-amber" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {result && (
        <div className="compare-results-section animate-fadeIn">
          {/* 3 Diff KPI Cards */}
          <div className="compare-metrics-strip">
            <TiltCard3D maxTilt={6} className="metric-kpi-card">
              <div className="kpi-icon-box text-emerald">
                <Wallet size={20} />
              </div>
              <div className="kpi-info">
                <small>{t('compare.kpiCostDiff')}</small>
                <strong className={result.cost_diff_vnd > 0 ? 'text-amber' : 'text-emerald'}>
                  {result.cost_diff_vnd >= 0 ? '+' : ''}
                  {result.cost_diff_vnd.toLocaleString('vi-VN')}₫
                </strong>
                <span>
                  {result.cost_diff_vnd > 0 ? t('compare.costMoreB') : t('compare.costLessB')}
                </span>
              </div>
            </TiltCard3D>

            <TiltCard3D maxTilt={6} className="metric-kpi-card">
              <div className="kpi-icon-box text-cyan">
                <Clock size={20} />
              </div>
              <div className="kpi-info">
                <small>{t('compare.kpiDeadlineDiff')}</small>
                <strong>
                  {result.return_deadline_diff_min >= 0 ? '+' : ''}
                  {result.return_deadline_diff_min} {locale === 'en' ? 'mins' : 'phút'}
                </strong>
                <span>
                  {result.return_deadline_diff_min > 0
                    ? t('compare.returnLaterB')
                    : t('compare.returnEarlierB')}
                </span>
              </div>
            </TiltCard3D>

            <TiltCard3D maxTilt={6} className="metric-kpi-card">
              <div className="kpi-icon-box text-amber">
                <ArrowLeftRight size={20} />
              </div>
              <div className="kpi-info">
                <small>{t('compare.kpiOrder')}</small>
                <strong>{result.order_changed ? t('compare.orderChanged') : t('compare.orderPreserved')}</strong>
                <span>{t('compare.routeOptNote')}</span>
              </div>
            </TiltCard3D>
          </div>

          {/* Activity Delta List */}
          <div className="delta-activities-card">
            <h3>{t('compare.activityDiffTitle')}</h3>
            <div className="delta-lists-grid">
              <div className="delta-box delta-added">
                <span className="delta-box-title">
                  <PlusCircle size={15} className="text-emerald" /> {t('compare.inBNotA')}
                </span>
                {result.added_experience_ids.length > 0 ? (
                  <ul className="delta-items-list">
                    {result.added_experience_ids.map((id) => {
                      const stop = result.second.stops.find((s) => s.experience_id === id)
                      return (
                        <li key={id}>
                          <strong>{stop?.name || id}</strong>
                          <small>+{stop?.cost_vnd.toLocaleString('vi-VN')}₫</small>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="delta-empty">{t('compare.noAdded')}</p>
                )}
              </div>

              <div className="delta-box delta-removed">
                <span className="delta-box-title">
                  <MinusCircle size={15} className="text-rose" /> {t('compare.inANotB')}
                </span>
                {result.removed_experience_ids.length > 0 ? (
                  <ul className="delta-items-list">
                    {result.removed_experience_ids.map((id) => {
                      const stop = result.first.stops.find((s) => s.experience_id === id)
                      return (
                        <li key={id}>
                          <strong>{stop?.name || id}</strong>
                          <small>-{stop?.cost_vnd.toLocaleString('vi-VN')}₫</small>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="delta-empty">{t('compare.noRemoved')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Side-by-Side Detailed Columns */}
          <div className="compare-columns-grid">
            {[result.first, result.second].map((plan, index) => (
              <div key={plan.id} className="compare-plan-column">
                <div className="column-plan-header">
                  <span className={`column-plan-pill ${index === 0 ? 'badge-plan-a' : 'badge-plan-b'}`}>
                    {index === 0 ? t('compare.planA') : t('compare.planB')}
                  </span>
                  <h3>{locale === 'en' ? 'Itinerary' : 'Lịch trình'} #{plan.id.slice(0, 8)}</h3>
                  <div className="column-meta-stats">
                    <span>
                      {t('compare.totalCost', { cost: `${plan.estimated_cost_vnd.toLocaleString('vi-VN')}₫` })}
                    </span>
                    <span>
                      {t('compare.returnBefore', {
                        time: new Date(plan.return_deadline).toLocaleTimeString(locale === 'en' ? 'en-US' : 'vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      })}
                    </span>
                  </div>
                </div>

                <div className="column-stops-list">
                  {plan.stops.map((stop, sIdx) => (
                    <div key={stop.experience_id} className="column-stop-item">
                      <span className="col-stop-order">{sIdx + 1}</span>
                      <div className="col-stop-content">
                        <strong>{stop.name}</strong>
                        <div className="col-stop-meta">
                          <span>
                            {new Date(stop.start_at).toLocaleTimeString(locale === 'en' ? 'en-US' : 'vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>·</span>
                          <span>{stop.cost_vnd.toLocaleString('vi-VN')}₫</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to={`/itinerary/${plan.id}`} className="btn-secondary-3d btn-sm w-full text-center mt-4">
                  <span>{t('compare.openPlanDetails', { plan: index === 0 ? 'A' : 'B' })}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
