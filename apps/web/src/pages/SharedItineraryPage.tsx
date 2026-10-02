import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSharedItinerary } from '../api/client'
import type { Itinerary } from '../types'

export function SharedItineraryPage() {
  const { token = '' } = useParams()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { getSharedItinerary(token).then(setItinerary).catch(() => setError('Liên kết chia sẻ không hợp lệ hoặc đã bị thu hồi.')) }, [token])
  if (error) return <div className="page-wrap"><h1>{error}</h1><Link to="/planner">Tạo lịch trình riêng</Link></div>
  if (!itinerary) return <div className="page-wrap page-loading-3d">Đang tải lịch được chia sẻ…</div>
  return <div className="page-wrap" style={{ paddingTop: 32 }}><h1>Lịch trình được chia sẻ</h1><p>{itinerary.stops.length} điểm · {itinerary.estimated_cost_vnd.toLocaleString('vi-VN')} ₫ · tổng di chuyển {itinerary.total_travel_min} phút</p>
    {itinerary.stops.map(stop => <article className="form-card-3d" key={stop.id} style={{ margin: '12px 0' }}><h2>{stop.position}. {stop.name}</h2><p>{new Date(stop.start_at).toLocaleString('vi-VN')} · {stop.poi.address}</p></article>)}
  </div>
}
