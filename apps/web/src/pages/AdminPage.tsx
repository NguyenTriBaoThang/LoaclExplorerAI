import { useEffect, useState } from 'react'
import { adminApi } from '../api/client'

type QueueItem = { id: string; name?: string; title?: string; source_uri?: string; status: string }
type DuplicatePair = { poi_a: { id: string; name: string }; poi_b: { id: string; name: string }; name_similarity: number }

export function AdminPage() {
  const [dashboard, setDashboard] = useState<Record<string, number>>({})
  const [users, setUsers] = useState<Array<{ id: string; email: string; display_name: string; role: string; provider_id: string | null; is_active: boolean }>>([])
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([])
  const [queue, setQueue] = useState<{ pois: QueueItem[]; experiences: QueueItem[]; evidence: QueueItem[] }>({ pois: [], experiences: [], evidence: [] })
  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([])
  const [audit, setAudit] = useState<Array<{ id: string; action: string; target_type: string; target_id: string; created_at: string }>>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [providerName, setProviderName] = useState('')
  const [providerEmail, setProviderEmail] = useState('')
  const [providerPassword, setProviderPassword] = useState('')
  const [providerAddress, setProviderAddress] = useState('')

  async function load() {
    try {
      const [metrics, accounts, providerRows, pending, simulated, nearDuplicates, logs] = await Promise.all([
        adminApi.dashboard(), adminApi.users(), adminApi.providers(), adminApi.moderation('pending'), adminApi.moderation('simulated'), adminApi.duplicates(), adminApi.audit(),
      ])
      setDashboard(metrics); setUsers(accounts); setProviders(providerRows)
      setQueue({ pois: [...pending.pois, ...simulated.pois], experiences: [...pending.experiences, ...simulated.experiences], evidence: [...pending.evidence, ...simulated.evidence] })
      setDuplicates(nearDuplicates); setAudit(logs)
      setError('')
    } catch (reason) { setError(String((reason as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Không tải được dữ liệu quản trị.')) }
  }
  useEffect(() => { void load() }, [])

  async function review(kind: string, id: string, action: string) {
    try { await adminApi.review(kind, id, action, `Admin action: ${action}`); setMessage(`Đã ${action} ${kind}.`); await load() }
    catch { setError('Không thể lưu quyết định duyệt.') }
  }
  async function createProvider(event: React.FormEvent) {
    event.preventDefault()
    try {
      await adminApi.createProvider({ name: providerName, email: providerEmail, password: providerPassword, address: providerAddress })
      setProviderName(''); setProviderEmail(''); setProviderPassword(''); setProviderAddress(''); setMessage('Đã tạo hồ sơ cơ sở và tài khoản cơ sở.'); await load()
    } catch { setError('Tạo cơ sở thất bại. Email có thể đã được dùng hoặc mật khẩu chưa đủ 12 ký tự.') }
  }
  async function changeRole(id: string, role: string, is_active: boolean, provider_id?: string | null) {
    try { await adminApi.updateUser(id, { role, is_active, ...(role === 'provider' ? { provider_id: provider_id || providers[0]?.id } : {}) }); await load() }
    catch { setError('Không thể cập nhật vai trò hoặc trạng thái tài khoản.') }
  }
  async function merge(pair: DuplicatePair) {
    const keep = window.prompt(`Nhập ID POI cần giữ lại (mặc định ${pair.poi_a.name})`, pair.poi_a.id)
    if (!keep) return
    const duplicate = keep === pair.poi_a.id ? pair.poi_b.id : pair.poi_a.id
    if (keep !== pair.poi_a.id && keep !== pair.poi_b.id) { setError('ID giữ lại phải là một trong hai POI đang được hiển thị.'); return }
    const keepName = keep === pair.poi_a.id ? pair.poi_a.name : pair.poi_b.name
    const duplicateName = keep === pair.poi_a.id ? pair.poi_b.name : pair.poi_a.name
    if (!window.confirm(`Chuyển trải nghiệm/lịch sang “${keepName}” và ẩn “${duplicateName}”?`)) return
    try { await adminApi.mergeDuplicate(keep, duplicate, 'Admin xác nhận gộp cặp trùng'); setMessage('Đã chuyển trải nghiệm/lịch sang POI giữ lại và ẩn POI trùng.'); await load() }
    catch { setError('Không thể gộp hai POI này.') }
  }

  const metrics = Object.entries(dashboard)
  return <div className="page-wrap" style={{ paddingTop: 32, paddingBottom: 48 }}>
    <h1>Quản trị Local Explorer</h1>
    <p>Duyệt dữ liệu, quản lý vai trò, phát hiện trùng lặp và theo dõi audit.</p>
    {error && <div className="form-alert-3d">{error}</div>}{message && <p role="status">{message}</p>}
    <section className="form-card-3d"><h2>Chất lượng dữ liệu</h2><div className="form-fields-grid-3">{metrics.map(([key, value]) => <article key={key}><strong>{value}</strong><div>{key.replaceAll('_', ' ')}</div></article>)}</div></section>
    <section className="form-card-3d" style={{ marginTop: 16 }}><h2>Tạo cơ sở và tài khoản cơ sở</h2>
      <form className="form-fields-grid-2" onSubmit={createProvider}>
        <label className="field-group-3d"><span>Tên cơ sở</span><input required value={providerName} onChange={e => setProviderName(e.target.value)} /></label>
        <label className="field-group-3d"><span>Email đăng nhập</span><input required type="email" value={providerEmail} onChange={e => setProviderEmail(e.target.value)} /></label>
        <label className="field-group-3d"><span>Mật khẩu tạm (ít nhất 12 ký tự)</span><input required minLength={12} type="password" value={providerPassword} onChange={e => setProviderPassword(e.target.value)} /></label>
        <label className="field-group-3d"><span>Địa chỉ</span><input value={providerAddress} onChange={e => setProviderAddress(e.target.value)} /></label>
        <button className="btn-planner-submit">Tạo cơ sở</button>
      </form>
    </section>
    <section className="form-card-3d" style={{ marginTop: 16 }}><h2>Hàng chờ duyệt</h2>
      {(['pois', 'experiences', 'evidence'] as const).map(kind => <div key={kind}><h3>{kind}</h3>{queue[kind].length ? queue[kind].map(item => <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid #345', padding: 8 }}>
        <span style={{ flex: 1 }}>{item.name || item.title || item.source_uri} · {item.status} · {item.id}</span>
        <button type="button" onClick={() => void review(kind === 'pois' ? 'poi' : kind === 'experiences' ? 'experience' : 'evidence', item.id, 'approve')}>Duyệt</button>
        <button type="button" onClick={() => void review(kind === 'pois' ? 'poi' : kind === 'experiences' ? 'experience' : 'evidence', item.id, 'reject')}>Từ chối</button>
        <button type="button" onClick={() => void review(kind === 'pois' ? 'poi' : kind === 'experiences' ? 'experience' : 'evidence', item.id, 'hide')}>Ẩn</button>
      </div>) : <p>Không có mục chờ.</p>}</div>)}
    </section>
    <section className="form-card-3d" style={{ marginTop: 16 }}><h2>POI có thể trùng</h2>{duplicates.length ? duplicates.map(pair => <div key={`${pair.poi_a.id}-${pair.poi_b.id}`} style={{ padding: 8, borderBottom: '1px solid #345' }}>{pair.poi_a.name} ↔ {pair.poi_b.name} · {Math.round(pair.name_similarity * 100)}% <button type="button" onClick={() => void merge(pair)}>Gộp cặp này…</button></div>) : <p>Chưa phát hiện cặp tên gần trùng.</p>}</section>
    <section className="form-card-3d" style={{ marginTop: 16 }}><h2>Tài khoản & vai trò</h2>{users.map(account => <div key={account.id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', padding: 8, borderBottom: '1px solid #345' }}><span style={{ flex: 1 }}>{account.email} · {account.display_name}</span><select value={account.role} onChange={e => void changeRole(account.id, e.target.value, account.is_active, account.provider_id)}><option value="traveler">traveler</option><option value="provider">provider</option><option value="admin">admin</option></select>{account.role === 'provider' && <select value={account.provider_id || ''} onChange={e => void changeRole(account.id, account.role, account.is_active, e.target.value)}><option value="">Chọn cơ sở</option>{providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}<label><input type="checkbox" checked={account.is_active} onChange={e => void changeRole(account.id, account.role, e.target.checked, account.provider_id)} /> hoạt động</label></div>)}</section>
    <section className="form-card-3d" style={{ marginTop: 16 }}><h2>Nhật ký kiểm toán gần đây</h2>{audit.map(row => <p key={row.id}>{new Date(row.created_at).toLocaleString('vi-VN')} · {row.action} · {row.target_type}/{row.target_id}</p>)}</section>
  </div>
}
