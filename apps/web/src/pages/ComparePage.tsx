import { useEffect, useState } from 'react'
import { compareItineraries, getMyItineraries } from '../api/client'

type Trip = { id: string; planned_date: string | null; estimated_cost_vnd: number; status: string }
type ComparedPlan = { id: string; status: string; estimated_cost_vnd: number; return_deadline: string; stops: Array<{ experience_id: string; name: string; start_at: string; end_at: string; cost_vnd: number }> }
type Comparison = { first: ComparedPlan; second: ComparedPlan; cost_diff_vnd: number; added_experience_ids: string[]; removed_experience_ids: string[]; order_changed: boolean; return_deadline_diff_min: number }
export function ComparePage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [first, setFirst] = useState('')
  const [second, setSecond] = useState('')
  const [result, setResult] = useState<Comparison | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { getMyItineraries().then(items => { setTrips(items); setFirst(items[0]?.id || ''); setSecond(items[1]?.id || '') }).catch(() => setError('Đăng nhập để so sánh các lịch trình của bạn.')) }, [])
  async function compare() {
    try { setResult(await compareItineraries(first, second) as Comparison); setError('') } catch { setError('Không thể so sánh. Hãy chọn hai lịch trình khác nhau.') }
  }
  return <div className="page-wrap" style={{ maxWidth: 900, paddingTop: 36 }}><h1>So sánh hai phương án</h1>
    <section className="form-card-3d"><div className="form-fields-grid-2">
      <label className="field-group-3d"><span>Phương án A</span><select value={first} onChange={e => setFirst(e.target.value)}>{trips.map(t => <option key={t.id} value={t.id}>{t.planned_date || t.id} · {t.id.slice(0, 8)}</option>)}</select></label>
      <label className="field-group-3d"><span>Phương án B</span><select value={second} onChange={e => setSecond(e.target.value)}>{trips.map(t => <option key={t.id} value={t.id}>{t.planned_date || t.id} · {t.id.slice(0, 8)}</option>)}</select></label>
    </div><button type="button" className="btn-planner-submit" disabled={!first || !second} onClick={() => void compare()}>So sánh</button>{error && <p>{error}</p>}</section>
    {result && <section className="form-card-3d" style={{ marginTop: 16 }}><h2>Kết quả khác biệt</h2>
      <p>Chênh lệch chi phí B−A: {result.cost_diff_vnd >= 0 ? '+' : ''}{result.cost_diff_vnd.toLocaleString('vi-VN')} ₫ · hạn về chênh {result.return_deadline_diff_min >= 0 ? '+' : ''}{result.return_deadline_diff_min} phút · thứ tự điểm {result.order_changed ? 'có đổi' : 'giữ nguyên'}.</p>
      <p>Điểm thêm ở B: {result.added_experience_ids.map(id => result.second.stops.find(stop => stop.experience_id === id)?.name || id).join(', ') || 'không có'} · điểm bỏ: {result.removed_experience_ids.map(id => result.first.stops.find(stop => stop.experience_id === id)?.name || id).join(', ') || 'không có'}.</p>
      <div className="form-fields-grid-2">{[result.first, result.second].map((plan, index) => <article key={plan.id}><h3>Phương án {index === 0 ? 'A' : 'B'}</h3><p>{plan.estimated_cost_vnd.toLocaleString('vi-VN')} ₫ · về trước {new Date(plan.return_deadline).toLocaleString('vi-VN')}</p>{plan.stops.map(stop => <p key={stop.experience_id}>{stop.name} · {new Date(stop.start_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {stop.cost_vnd.toLocaleString('vi-VN')} ₫</p>)}</article>)}</div>
    </section>}
  </div>
}
