import { useEffect, useState, type FormEvent } from 'react'
import { getPOIs, providerApi } from '../api/client'
import type { POI } from '../types'

type SlotItem = { id: string; start_at: string; end_at: string; capacity_total: number; available_reported: number | null; status: string; version: number }
type ExperienceItem = { id: string; poi_id: string; title: string; description: string; intent_tags: string[]; is_hands_on: boolean; is_indoor: boolean; duration_min: number; price_vnd: number; price_basis: string; verification_status: string; poi_name: string; slots: SlotItem[] }
type Draft = Omit<ExperienceItem, 'id' | 'verification_status' | 'poi_name' | 'slots'>
const blank: Draft = { poi_id: '', title: '', description: '', intent_tags: [], is_hands_on: false, is_indoor: true, duration_min: 60, price_vnd: 0, price_basis: 'per_person' }

export function ProviderPortalPage() {
  const [items, setItems] = useState<ExperienceItem[]>([])
  const [pois, setPois] = useState<POI[]>([])
  const [audit, setAudit] = useState<Array<{ id: string; action: string; target_type: string; target_id: string; created_at: string; details: Record<string, unknown> }>>([])
  const [draft, setDraft] = useState<Draft>(blank)
  const [editing, setEditing] = useState('')
  const [slotTarget, setSlotTarget] = useState('')
  const [slotDate, setSlotDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10))
  const [slotTime, setSlotTime] = useState('09:00')
  const [slotDuration, setSlotDuration] = useState(60)
  const [capacity, setCapacity] = useState(10)
  const [available, setAvailable] = useState(10)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try {
      const [experiences, points, history] = await Promise.all([providerApi.experiences(), getPOIs(), providerApi.audit()])
      setItems(experiences); setPois(points); setAudit(history); setError('')
      setDraft(current => current.poi_id || !points[0] ? current : { ...current, poi_id: points[0].id })
    } catch { setError('Không tải được dữ liệu cơ sở. Hãy đăng nhập bằng tài khoản có quyền cơ sở.') }
  }
  useEffect(() => { void load() }, [])

  function beginEdit(item: ExperienceItem) {
    setEditing(item.id); setSlotTarget('')
    setDraft({ poi_id: item.poi_id, title: item.title, description: item.description, intent_tags: item.intent_tags || [], is_hands_on: item.is_hands_on, is_indoor: item.is_indoor, duration_min: item.duration_min, price_vnd: item.price_vnd, price_basis: item.price_basis })
  }
  async function saveExperience(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice('')
    try {
      if (editing) await providerApi.updateExperience(editing, draft as unknown as Record<string, unknown>)
      else await providerApi.createExperience(draft as unknown as Record<string, unknown>)
      setDraft({ ...blank, poi_id: pois[0]?.id || '' }); setEditing(''); setNotice('Đã lưu. Nội dung mới/chỉnh sửa sẽ chờ quản trị viên duyệt.'); await load()
    } catch { setError('Lưu trải nghiệm thất bại. Kiểm tra POI, thời lượng và giá.') }
  }
  async function addSlot(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice('')
    try {
      const start = new Date(`${slotDate}T${slotTime}:00+07:00`)
      await providerApi.createSlot(slotTarget, { start_at: start.toISOString(), end_at: new Date(start.getTime() + slotDuration * 60000).toISOString(), capacity_total: capacity, available_reported: available })
      setNotice('Đã thêm ca.'); await load()
    } catch { setError('Không thể tạo slot; cần thời gian có múi giờ và sức chứa hợp lệ.') }
  }
  async function updateSlot(slot: SlotItem, status: string) {
    if (status === 'cancelled' && !window.confirm('Hủy ca này? Du khách có lịch liên quan sẽ nhận cảnh báo và có thể đổi lịch.')) return
    try {
      const reported = status === 'cancelled' || status === 'full' ? 0 : (slot.available_reported && slot.available_reported > 0 ? slot.available_reported : slot.capacity_total)
      const result = await providerApi.updateSlot(slot.id, { expected_version: slot.version, status, available_reported: reported }) as { affected_itineraries?: number }
      setNotice(status === 'cancelled' ? `Đã hủy ca; ${result.affected_itineraries || 0} lịch trình bị ảnh hưởng và sẽ nhận cảnh báo.` : 'Đã cập nhật tình trạng ca.')
      await load()
    } catch { setError('Ca đã được cập nhật ở nơi khác hoặc không còn khả dụng. Hãy tải lại trang.') }
  }
  async function editCapacity(slot: SlotItem) {
    const totalValue = window.prompt('Tổng sức chứa của ca', String(slot.capacity_total || 1))
    if (totalValue === null) return
    const total = Number(totalValue)
    const reportValue = window.prompt('Số chỗ còn nhận', String(slot.available_reported ?? total))
    if (reportValue === null) return
    const reported = Number(reportValue)
    try {
      await providerApi.updateSlot(slot.id, { expected_version: slot.version, status: reported === 0 ? 'full' : 'open', capacity_total: total, available_reported: reported })
      setNotice('Đã cập nhật sức chứa ca.'); await load()
    } catch { setError('Sức chứa không hợp lệ hoặc ca đã đổi phiên bản.') }
  }
  async function hideExperience(id: string) {
    if (!window.confirm('Ẩn trải nghiệm này khỏi danh mục công khai? Lịch sử cũ được giữ nguyên.')) return
    try { await providerApi.hideExperience(id); setNotice('Đã ẩn trải nghiệm.'); await load() } catch { setError('Không thể ẩn trải nghiệm.') }
  }

  return <div className="page-wrap" style={{ paddingTop: 32, paddingBottom: 48 }}>
    <h1>Cổng cơ sở</h1><p>Quản lý thông tin, giá, thời lượng, ca và lịch sử thao tác.</p>
    {error && <div className="form-alert-3d">{error}</div>}{notice && <p role="status">{notice}</p>}
    <section className="form-card-3d"><h2>{editing ? 'Chỉnh sửa trải nghiệm' : 'Tạo trải nghiệm'}</h2>
      <form onSubmit={saveExperience} className="form-fields-grid-2">
        <label className="field-group-3d"><span>POI</span><select required value={draft.poi_id} onChange={e => setDraft({ ...draft, poi_id: e.target.value })}>{pois.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="field-group-3d"><span>Tên trải nghiệm</span><input required minLength={2} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label>
        <label className="field-group-3d" style={{ gridColumn: '1 / -1' }}><span>Mô tả</span><textarea required value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label>
        <label className="field-group-3d"><span>Thẻ mục đích, cách nhau bằng dấu phẩy</span><input value={draft.intent_tags.join(', ')} onChange={e => setDraft({ ...draft, intent_tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></label>
        <label className="field-group-3d"><span>Thời lượng (phút)</span><input required type="number" min={10} value={draft.duration_min} onChange={e => setDraft({ ...draft, duration_min: Number(e.target.value) })} /></label>
        <label className="field-group-3d"><span>Giá (VNĐ)</span><input required type="number" min={0} value={draft.price_vnd} onChange={e => setDraft({ ...draft, price_vnd: Number(e.target.value) })} /></label>
        <label className="field-group-3d"><span>Cách tính giá</span><select value={draft.price_basis} onChange={e => setDraft({ ...draft, price_basis: e.target.value })}><option value="per_person">Mỗi khách</option><option value="per_group">Cả nhóm</option></select></label>
        <label><input type="checkbox" checked={draft.is_hands_on} onChange={e => setDraft({ ...draft, is_hands_on: e.target.checked })} /> Có thực hành trực tiếp</label>
        <label><input type="checkbox" checked={draft.is_indoor} onChange={e => setDraft({ ...draft, is_indoor: e.target.checked })} /> Trong nhà</label>
        <div><button className="btn-planner-submit">{editing ? 'Lưu chỉnh sửa' : 'Tạo trải nghiệm'}</button>{editing && <button type="button" onClick={() => { setEditing(''); setDraft({ ...blank, poi_id: pois[0]?.id || '' }) }}>Hủy sửa</button>}</div>
      </form>
    </section>
    {slotTarget && <section className="form-card-3d" style={{ marginTop: 16 }}><h2>Thêm ca</h2><form className="form-fields-grid-3" onSubmit={addSlot}>
      <label className="field-group-3d"><span>Ngày</span><input type="date" required value={slotDate} onChange={e => setSlotDate(e.target.value)} /></label><label className="field-group-3d"><span>Giờ bắt đầu</span><input type="time" required value={slotTime} onChange={e => setSlotTime(e.target.value)} /></label><label className="field-group-3d"><span>Thời lượng (phút)</span><input type="number" min={10} value={slotDuration} onChange={e => setSlotDuration(Number(e.target.value))} /></label><label className="field-group-3d"><span>Sức chứa tổng</span><input type="number" min={1} value={capacity} onChange={e => setCapacity(Number(e.target.value))} /></label><label className="field-group-3d"><span>Số chỗ còn</span><input type="number" min={0} value={available} onChange={e => setAvailable(Number(e.target.value))} /></label><button className="btn-planner-submit">Tạo ca</button>
    </form></section>}
    <section className="form-card-3d" style={{ marginTop: 16 }}><h2>Trải nghiệm và slot</h2>{items.map(item => <article key={item.id} style={{ padding: 12, borderBottom: '1px solid #345' }}>
      <h3>{item.title} · {item.verification_status}</h3><p>{item.poi_name} · {item.price_vnd.toLocaleString('vi-VN')} ₫ · {item.duration_min} phút</p>
      <button type="button" onClick={() => beginEdit(item)}>Sửa</button> <button type="button" onClick={() => { setSlotTarget(item.id); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) }}>Thêm slot</button> <button type="button" onClick={() => void hideExperience(item.id)}>Ẩn</button>
      {item.slots.map(slot => <div key={slot.id} style={{ padding: 8 }}> {new Date(slot.start_at).toLocaleString('vi-VN')} · còn {slot.available_reported ?? 'chưa xác nhận'} / {slot.capacity_total} · {slot.status} · v{slot.version} <select aria-label="Trạng thái slot" value={slot.status === 'open' || slot.status === 'full' || slot.status === 'cancelled' ? slot.status : 'open'} onChange={e => void updateSlot(slot, e.target.value)}><option value="open">Mở</option><option value="full">Đầy</option><option value="cancelled">Hủy</option></select> <button type="button" onClick={() => void editCapacity(slot)}>Sửa sức chứa</button></div>)}
    </article>)}</section>
    <section className="form-card-3d" style={{ marginTop: 16 }}><h2>Lịch sử thao tác</h2>{audit.map(row => <p key={row.id}>{new Date(row.created_at).toLocaleString('vi-VN')} · {row.action} · {row.target_type}/{row.target_id} {row.details.affected_itineraries ? `· lịch bị ảnh hưởng: ${row.details.affected_itineraries}` : ''}</p>)}</section>
  </div>
}
