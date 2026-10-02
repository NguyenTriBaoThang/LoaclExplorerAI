import { useEffect, useState, type FormEvent } from 'react'
import {
  Plus,
  Clock,
  Pencil,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  History,
  X,
} from 'lucide-react'
import { getPOIs, providerApi } from '../api/client'
import type { POI } from '../types'

type SlotItem = {
  id: string
  start_at: string
  end_at: string
  capacity_total: number
  available_reported: number | null
  status: string
  version: number
}

type ExperienceItem = {
  id: string
  poi_id: string
  title: string
  description: string
  intent_tags: string[]
  is_hands_on: boolean
  is_indoor: boolean
  duration_min: number
  price_vnd: number
  price_basis: string
  verification_status: string
  poi_name: string
  slots: SlotItem[]
}

type Draft = Omit<ExperienceItem, 'id' | 'verification_status' | 'poi_name' | 'slots'>

const blank: Draft = {
  poi_id: '',
  title: '',
  description: '',
  intent_tags: [],
  is_hands_on: false,
  is_indoor: true,
  duration_min: 60,
  price_vnd: 0,
  price_basis: 'per_person',
}

export function ProviderPortalPage() {
  const [items, setItems] = useState<ExperienceItem[]>([])
  const [pois, setPois] = useState<POI[]>([])
  const [audit, setAudit] = useState<
    Array<{
      id: string
      action: string
      target_type: string
      target_id: string
      created_at: string
      details: Record<string, unknown>
    }>
  >([])
  const [draft, setDraft] = useState<Draft>(blank)
  const [editing, setEditing] = useState('')
  const [slotTarget, setSlotTarget] = useState('')
  const [slotDate, setSlotDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  )
  const [slotTime, setSlotTime] = useState('09:00')
  const [slotDuration, setSlotDuration] = useState(60)
  const [capacity, setCapacity] = useState(10)
  const [available, setAvailable] = useState(10)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [showExpForm, setShowExpForm] = useState(false)

  async function load() {
    try {
      const [experiences, points, history] = await Promise.all([
        providerApi.experiences(),
        getPOIs(),
        providerApi.audit(),
      ])
      setItems(experiences)
      setPois(points)
      setAudit(history)
      setError('')
      setDraft((current) =>
        current.poi_id || !points[0] ? current : { ...current, poi_id: points[0].id }
      )
    } catch {
      setError('Không tải được dữ liệu cơ sở. Hãy đăng nhập bằng tài khoản có quyền cơ sở.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function beginEdit(item: ExperienceItem) {
    setEditing(item.id)
    setSlotTarget('')
    setDraft({
      poi_id: item.poi_id,
      title: item.title,
      description: item.description,
      intent_tags: item.intent_tags || [],
      is_hands_on: item.is_hands_on,
      is_indoor: item.is_indoor,
      duration_min: item.duration_min,
      price_vnd: item.price_vnd,
      price_basis: item.price_basis,
    })
    setShowExpForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveExperience(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      if (editing) {
        await providerApi.updateExperience(editing, draft as unknown as Record<string, unknown>)
      } else {
        await providerApi.createExperience(draft as unknown as Record<string, unknown>)
      }
      setDraft({ ...blank, poi_id: pois[0]?.id || '' })
      setEditing('')
      setShowExpForm(false)
      setNotice('Đã lưu thành công. Nội dung mới hoặc chỉnh sửa sẽ chờ quản trị viên duyệt.')
      await load()
    } catch {
      setError('Lưu trải nghiệm thất bại. Vui lòng kiểm tra lại POI, thời lượng và giá.')
    }
  }

  async function addSlot(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      const start = new Date(`${slotDate}T${slotTime}:00+07:00`)
      await providerApi.createSlot(slotTarget, {
        start_at: start.toISOString(),
        end_at: new Date(start.getTime() + slotDuration * 60000).toISOString(),
        capacity_total: capacity,
        available_reported: available,
      })
      setNotice('Đã thêm khung giờ mới thành công!')
      setSlotTarget('')
      await load()
    } catch {
      setError('Không thể tạo slot; cần thời gian có múi giờ và sức chứa hợp lệ.')
    }
  }

  async function updateSlot(slot: SlotItem, status: string) {
    if (
      status === 'cancelled' &&
      !window.confirm(
        'Hủy ca này? Du khách có lịch liên quan sẽ nhận cảnh báo và có thể đổi lịch.'
      )
    ) {
      return
    }
    try {
      const reported =
        status === 'cancelled' || status === 'full'
          ? 0
          : slot.available_reported && slot.available_reported > 0
          ? slot.available_reported
          : slot.capacity_total
      const result = (await providerApi.updateSlot(slot.id, {
        expected_version: slot.version,
        status,
        available_reported: reported,
      })) as { affected_itineraries?: number }
      setNotice(
        status === 'cancelled'
          ? `Đã hủy ca; ${result.affected_itineraries || 0} lịch trình bị ảnh hưởng và sẽ nhận cảnh báo đổi lịch.`
          : 'Đã cập nhật tình trạng ca thành công.'
      )
      await load()
    } catch {
      setError('Ca đã được cập nhật ở nơi khác hoặc không còn khả dụng. Hãy tải lại trang.')
    }
  }

  async function editCapacity(slot: SlotItem) {
    const totalValue = window.prompt('Tổng sức chứa của ca', String(slot.capacity_total || 1))
    if (totalValue === null) return
    const total = Number(totalValue)
    const reportValue = window.prompt('Số chỗ còn nhận', String(slot.available_reported ?? total))
    if (reportValue === null) return
    const reported = Number(reportValue)
    try {
      await providerApi.updateSlot(slot.id, {
        expected_version: slot.version,
        status: reported === 0 ? 'full' : 'open',
        capacity_total: total,
        available_reported: reported,
      })
      setNotice('Đã cập nhật sức chứa ca.')
      await load()
    } catch {
      setError('Sức chứa không hợp lệ hoặc ca đã đổi phiên bản.')
    }
  }

  async function hideExperience(id: string) {
    if (!window.confirm('Ẩn trải nghiệm này khỏi danh mục công khai? Lịch sử cũ được giữ nguyên.'))
      return
    try {
      await providerApi.hideExperience(id)
      setNotice('Đã ẩn trải nghiệm khỏi danh mục công khai.')
      await load()
    } catch {
      setError('Không thể ẩn trải nghiệm.')
    }
  }

  return (
    <div className="portal-page-3d page-wrap">
      {/* Header */}
      <div className="page-title-row-3d">
        <div>
          <span className="eyebrow-3d">
            <span className="eyebrow-dot" /> WORKSPACE CƠ SỞ ĐỐI TÁC
          </span>
          <h1 className="page-heading-3d">
            Quản lý hoạt động & <em>Khung giờ.</em>
          </h1>
          <p className="page-subtext-3d">
            Cập nhật trạng thái slot, thông báo sức chứa chỗ trống và quản lý danh mục trải nghiệm của cơ sở.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary-3d"
          onClick={() => {
            setEditing('')
            setDraft({ ...blank, poi_id: pois[0]?.id || '' })
            setShowExpForm(!showExpForm)
          }}
        >
          {showExpForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showExpForm ? 'Đóng form' : 'Thêm trải nghiệm mới'}</span>
        </button>
      </div>

      {notice && (
        <div className="inline-alert-3d alert-success">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="inline-alert-3d">
          <AlertCircle size={16} className="text-amber" />
          <span>{error}</span>
        </div>
      )}

      {/* Experience Editor Form Card (Collapsible) */}
      {showExpForm && (
        <section className="form-card-3d mb-8 animate-fadeIn">
          <div className="form-card-header">
            <span className="step-num">{editing ? 'EDIT' : 'NEW'}</span>
            <div>
              <h2>{editing ? 'Chỉnh sửa thông tin trải nghiệm' : 'Đăng ký trải nghiệm mới'}</h2>
              <p>Thông tin chi tiết về hoạt động, địa điểm và thời lượng tổ chức.</p>
            </div>
          </div>

          <form onSubmit={saveExperience} className="form-fields-grid-2">
            <label className="field-group-3d">
              <span>Địa điểm tổ chức (POI)</span>
              <select
                required
                value={draft.poi_id}
                onChange={(e) => setDraft({ ...draft, poi_id: e.target.value })}
              >
                {pois.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.address}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group-3d">
              <span>Tên trải nghiệm</span>
              <input
                required
                minLength={2}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Ví dụ: Workshop nặn gốm thủ công..."
              />
            </label>

            <label className="field-group-3d" style={{ gridColumn: '1 / -1' }}>
              <span>Mô tả chi tiết</span>
              <textarea
                required
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Mô tả nội dung diễn ra trong hoạt động..."
              />
            </label>

            <label className="field-group-3d">
              <span>Thẻ mục đích (cách nhau bằng dấu phẩy)</span>
              <input
                value={draft.intent_tags.join(', ')}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    intent_tags: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="food, handicraft, relaxation..."
              />
            </label>

            <label className="field-group-3d">
              <span>Thời lượng (phút)</span>
              <input
                required
                type="number"
                min={10}
                value={draft.duration_min}
                onChange={(e) => setDraft({ ...draft, duration_min: Number(e.target.value) })}
              />
            </label>

            <label className="field-group-3d">
              <span>Giá vé dự kiến (VNĐ)</span>
              <input
                required
                type="number"
                min={0}
                step={10000}
                value={draft.price_vnd}
                onChange={(e) => setDraft({ ...draft, price_vnd: Number(e.target.value) })}
              />
            </label>

            <label className="field-group-3d">
              <span>Cách tính giá</span>
              <select
                value={draft.price_basis}
                onChange={(e) => setDraft({ ...draft, price_basis: e.target.value })}
              >
                <option value="per_person">Tính theo từng khách</option>
                <option value="per_group">Tính theo nhóm trọn gói</option>
              </select>
            </label>

            <div className="checkboxes-pair" style={{ gridColumn: '1 / -1' }}>
              <label className="custom-check-pill">
                <input
                  type="checkbox"
                  checked={draft.is_hands_on}
                  onChange={(e) => setDraft({ ...draft, is_hands_on: e.target.checked })}
                />
                <span>Có thực hành trực tiếp (Hands-on)</span>
              </label>

              <label className="custom-check-pill">
                <input
                  type="checkbox"
                  checked={draft.is_indoor}
                  onChange={(e) => setDraft({ ...draft, is_indoor: e.target.checked })}
                />
                <span>Không gian trong nhà</span>
              </label>
            </div>

            <div className="form-action-row" style={{ gridColumn: '1 / -1' }}>
              <button className="btn-primary-3d" type="submit">
                <span>{editing ? 'Lưu chỉnh sửa' : 'Tạo trải nghiệm'}</span>
              </button>
              <button
                type="button"
                className="btn-secondary-3d"
                onClick={() => {
                  setEditing('')
                  setShowExpForm(false)
                }}
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Add Slot Modal / Drawer Card */}
      {slotTarget && (
        <section className="form-card-3d mb-8 animate-fadeIn">
          <div className="form-card-header">
            <span className="step-num">SLOT</span>
            <div>
              <h2>Thêm khung giờ (Slot) cho trải nghiệm</h2>
              <p>Khung giờ này sẽ xuất hiện trên hệ thống tìm kiếm và planner.</p>
            </div>
            <button
              type="button"
              className="btn-ghost-sm"
              onClick={() => setSlotTarget('')}
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>

          <form className="form-fields-grid-3" onSubmit={addSlot}>
            <label className="field-group-3d">
              <span>Ngày tổ chức</span>
              <input
                type="date"
                required
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
              />
            </label>

            <label className="field-group-3d">
              <span>Giờ bắt đầu</span>
              <input
                type="time"
                required
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
              />
            </label>

            <label className="field-group-3d">
              <span>Thời lượng (phút)</span>
              <input
                type="number"
                min={10}
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
              />
            </label>

            <label className="field-group-3d">
              <span>Tổng sức chứa</span>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </label>

            <label className="field-group-3d">
              <span>Số chỗ nhận thực tế</span>
              <input
                type="number"
                min={0}
                value={available}
                onChange={(e) => setAvailable(Number(e.target.value))}
              />
            </label>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn-primary-3d w-full" type="submit">
                <span>Tạo ca hoạt động</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Experience List Cards */}
      <section className="portal-experiences-section">
        <h2 className="section-title-3d">Danh sách trải nghiệm & Khung giờ ({items.length})</h2>

        <div className="portal-exp-list">
          {items.map((item) => (
            <article key={item.id} className="portal-exp-card">
              <div className="portal-exp-top">
                <div className="portal-exp-meta-left">
                  <span className="portal-status-badge">{item.verification_status}</span>
                  <h3>{item.title}</h3>
                  <p className="portal-exp-poi">
                    {item.poi_name} · {item.price_vnd.toLocaleString('vi-VN')}₫ · {item.duration_min} phút
                  </p>
                </div>

                <div className="portal-exp-actions">
                  <button
                    type="button"
                    className="btn-secondary-3d btn-sm"
                    onClick={() => beginEdit(item)}
                  >
                    <Pencil size={13} /> Sửa
                  </button>
                  <button
                    type="button"
                    className="btn-primary-3d btn-sm"
                    onClick={() => {
                      setSlotTarget(item.id)
                      window.scrollTo({ top: 200, behavior: 'smooth' })
                    }}
                  >
                    <Plus size={13} /> Thêm ca
                  </button>
                  <button
                    type="button"
                    className="btn-ghost-sm text-rose"
                    onClick={() => void hideExperience(item.id)}
                  >
                    <EyeOff size={13} /> Ẩn
                  </button>
                </div>
              </div>

              {/* Slots List for this experience */}
              <div className="portal-slots-container">
                <span className="slots-heading-label">
                  Khung giờ mở ({item.slots.length} ca):
                </span>
                {item.slots.length > 0 ? (
                  <div className="slots-grid">
                    {item.slots.map((slot) => (
                      <div key={slot.id} className="slot-chip-card">
                        <div className="slot-chip-time">
                          <Clock size={13} className="text-emerald" />
                          <span>
                            {new Date(slot.start_at).toLocaleString('vi-VN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                              timeZone: 'Asia/Ho_Chi_Minh',
                            })}
                          </span>
                        </div>

                        <div className="slot-chip-info">
                          <span>
                            Còn <strong>{slot.available_reported ?? 'Chưa rõ'}</strong> / {slot.capacity_total} chỗ
                          </span>
                        </div>

                        <div className="slot-chip-controls">
                          <select
                            aria-label="Trạng thái slot"
                            value={
                              slot.status === 'open' ||
                              slot.status === 'full' ||
                              slot.status === 'cancelled'
                                ? slot.status
                                : 'open'
                            }
                            onChange={(e) => void updateSlot(slot, e.target.value)}
                            className="slot-status-select"
                          >
                            <option value="open">Mở nhận khách</option>
                            <option value="full">Đã đầy chỗ</option>
                            <option value="cancelled">Hủy ca này</option>
                          </select>
                          <button
                            type="button"
                            className="btn-slot-cap"
                            onClick={() => void editCapacity(slot)}
                            title="Chỉnh sửa sức chứa"
                          >
                            Sửa chỗ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-slots-hint">Chưa có khung giờ nào được lên lịch.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Audit History Log */}
      {audit.length > 0 && (
        <section className="portal-audit-section">
          <div className="audit-header-row">
            <History size={18} className="text-emerald" />
            <h3>Nhật ký thao tác gần đây</h3>
          </div>
          <div className="audit-rows-list">
            {audit.map((row) => (
              <div key={row.id} className="audit-log-item">
                <span className="audit-time">
                  {new Date(row.created_at).toLocaleString('vi-VN')}
                </span>
                <span className="audit-action">{row.action}</span>
                <span className="audit-target">
                  {row.target_type} / {row.target_id.slice(0, 8)}
                </span>
                {Boolean(row.details.affected_itineraries) && (
                  <span className="audit-affected">
                    Ảnh hưởng: {String(row.details.affected_itineraries)} lịch trình
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
