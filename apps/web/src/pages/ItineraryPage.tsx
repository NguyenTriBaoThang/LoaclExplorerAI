import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock3, MapPin, Route, Wallet } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { apiErrorMessage, getItinerary } from '../api/client'
import { MapAdapter } from '../components/map/MapAdapter'
import { SimulatedBadge } from '../components/common/StatusBadge'
import type { Itinerary } from '../types'

const reasonCopy: Record<string, string> = {
  INTENT_MATCH: 'Ưu tiên trải nghiệm khớp với mục đích chuyến đi.',
  WITHIN_BUDGET: 'Chi phí ước tính nằm trong ngân sách bạn đặt.',
  SLOT_AVAILABLE: 'Khung giờ minh họa phù hợp với khoảng thời gian chuyến đi.',
  CAPACITY_UNKNOWN: 'Sức chứa chưa được xác nhận; vui lòng liên hệ nhà cung cấp trước khi đi.',
  MOCK_ROUTING: 'Thời gian di chuyển dùng ước tính mô phỏng, không phải tuyến đường hay giao thông thực.',
  SIMULATED_DATA: 'Địa điểm, giá và khung giờ là dữ liệu mô phỏng, không xác nhận đặt chỗ.',
  LOCKED_ACTIVITY: 'Hoạt động được bạn khóa đã được giữ lại.',
}
const timeLabel = (value: string) => new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value))

export function ItineraryPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const initial = (location.state as { itinerary?: Itinerary } | null)?.itinerary
  const [itinerary, setItinerary] = useState<Itinerary | null>(initial ?? null)
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    if (!id) return
    getItinerary(id).then(setItinerary).catch((reason) => setError(apiErrorMessage(reason))).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-wrap page-loading"><span className="loader-dot" /> Đang mở lịch trình của bạn...</div>
  if (error || !itinerary) return <div className="page-wrap not-found"><span className="eyebrow"><span className="eyebrow-line" /> LỊCH TRÌNH</span><h1>Chưa mở được lịch trình.</h1><p>{error || 'Không tìm thấy lịch trình này.'}</p><Link to="/planner" className="button button-primary">Tạo lịch trình mới <ArrowRight size={17} /></Link></div>

  const points = itinerary.stops.map((stop) => ({ id: stop.experience_id, latitude: stop.poi.latitude, longitude: stop.poi.longitude, name: stop.name, category: stop.category, number: stop.position }))
  const activeStop = itinerary.stops.find((stop) => stop.experience_id === selectedId)
  const lastStop = itinerary.stops[itinerary.stops.length - 1]
  const totalMinutes = lastStop ? Math.round((new Date(lastStop.end_at).getTime() - new Date(itinerary.stops[0].start_at).getTime()) / 60000) : 0
  return <div className="page-wrap itinerary-page">
    <div className="itinerary-topline"><Link to="/planner" className="back-link"><ArrowLeft size={15} /> Chỉnh thông tin chuyến đi</Link><SimulatedBadge /></div>
    <div className="itinerary-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> TP. HỒ CHÍ MINH · LỊCH TRÌNH ĐỀ XUẤT</span><h1>Một ngày theo <em>nhịp của bạn.</em></h1><p>{itinerary.stops.length} trải nghiệm được sắp xếp trong khung giờ của bạn.</p></div><div className={`feasibility-pill ${itinerary.feasibility_status === 'tentative' ? 'feasibility-tentative' : ''}`}><span />{itinerary.feasibility_status === 'tentative' ? 'Cần xác nhận sức chứa' : 'Khả thi theo dữ liệu demo'}</div></div>
    <div className="itinerary-summary"><div><Clock3 size={17} /><span><small>TỔNG THỜI LƯỢNG</small><strong>{Math.floor(totalMinutes / 60)} giờ {totalMinutes % 60} phút</strong></span></div><div><Route size={17} /><span><small>DI CHUYỂN ƯỚC TÍNH</small><strong>{itinerary.total_travel_min} phút</strong></span></div><div><Wallet size={17} /><span><small>CHI PHÍ ƯỚC TÍNH</small><strong>{itinerary.estimated_cost_vnd.toLocaleString('vi-VN')}₫</strong></span></div><div><MapPin size={17} /><span><small>TRẢI NGHIỆM</small><strong>{itinerary.stops.length} điểm dừng</strong></span></div></div>
    <div className="itinerary-content-grid"><section className="itinerary-map-section"><div className="section-inline-heading"><div><span className="eyebrow-small">THÀNH PHỐ QUA HÀNH TRÌNH</span><strong>Bản đồ lịch trình</strong></div><span className="route-legend"><i /> Thứ tự trải nghiệm</span></div><MapAdapter points={points} selectedId={selectedId} onSelect={setSelectedId} className="itinerary-map" /><div className="route-notice">Tuyến ước tính · Mock routing, không dùng dữ liệu giao thông thực</div></section>
      <section className="timeline-section"><div className="section-inline-heading"><div><span className="eyebrow-small">MỘT NGÀY CÓ Ý NGHĨA</span><strong>Dòng thời gian</strong></div><span className="date-chip">{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(itinerary.stops[0]?.start_at ?? itinerary.data_as_of))}</span></div>
        <div className="timeline-list">{itinerary.stops.map((stop, index) => <article key={stop.id} className={`timeline-stop ${selectedId === stop.experience_id ? 'timeline-stop-active' : ''}`} onMouseEnter={() => setSelectedId(stop.experience_id)} onFocus={() => setSelectedId(stop.experience_id)} tabIndex={0}><div className="timeline-rail"><span className="timeline-number">{String(stop.position).padStart(2, '0')}</span><i className={index === itinerary.stops.length - 1 ? 'rail-last' : ''} /></div><div className="timeline-card"><div className="timeline-time">{timeLabel(stop.start_at)} <span>—</span> {timeLabel(stop.end_at)}</div><h3>{stop.name}</h3><p><MapPin size={13} /> {stop.poi.address}</p><div className="timeline-card-footer"><span>{stop.duration_min} phút</span><span>{stop.cost_vnd.toLocaleString('vi-VN')}₫ / người</span>{stop.availability_known ? <span className="mini-status mini-status-ok">Có báo cáo chỗ</span> : <span className="mini-status mini-status-unknown">Cần xác nhận</span>}</div></div></article>)}</div>
      </section>
    </div>
    <div className="itinerary-explanation"><div className="explanation-heading"><span className="explanation-mark">✳</span><div><span className="eyebrow-small">LÝ DO GỢI Ý</span><h2>Vì sao lịch này được đề xuất?</h2></div></div><div className="reason-list">{itinerary.explanation.reason_codes.map((code) => <p key={code}><span className="reason-check">✓</span>{reasonCopy[code] ?? code.replaceAll('_', ' ')}</p>)}</div>{itinerary.explanation.lost_intents.length > 0 && <p className="lost-intents">Chưa tìm được khung phù hợp cho: {itinerary.explanation.lost_intents.join(', ')}.</p>}<div className="explanation-cta"><span>Muốn điều chỉnh khung giờ, ngân sách hoặc mục đích?</span><Link to="/planner">Thử kế hoạch khác <ArrowRight size={15} /></Link></div></div>
    {activeStop && <div className="sr-only" aria-live="polite">Đang xem {activeStop.name} trên bản đồ</div>}
  </div>
}
