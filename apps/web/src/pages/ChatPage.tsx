import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  CircleHelp,
  LoaderCircle,
  MapPin,
  RotateCcw,
  Send,
  Sparkles,
  Users,
  Wallet,
  Clock,
  Bike,
  Car,
  Footprints,
  Bus,
  CheckCircle2,
  AlertCircle,
  Lock,
  Layers,
  Zap,
  Info,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api, apiErrorMessage, createItinerary, sendChatMessage } from '../api/client'
import type { ChatConstraints, POI } from '../types'

type ChatLine = {
  id: string
  role: 'assistant' | 'user'
  text: string
  time?: string
  snapshot?: Partial<ChatConstraints>
}

const initialMessage: ChatLine = {
  id: 'welcome',
  role: 'assistant',
  text: 'Chào bạn! Mình là Trợ lý AI du lịch Sài Gòn. Bạn hãy kể tự nhiên về chuyến đi mong muốn: **số người**, **giờ xuất phát & giờ về**, **tổng ngân sách** và **sở thích** (ẩm thực, thủ công mỹ nghệ, văn hóa, thư giãn...). Mình sẽ tính toán khung giờ mở cửa thực tế và đề xuất lịch trình tối ưu nhất cho bạn!',
  time: 'Vừa xong',
}

const intentConfigs: Record<string, { label: string; icon: string; color: string; barClass: string }> = {
  'thủ_công': { label: 'Thủ công mỹ nghệ', icon: '🎨', color: '#f59e0b', barClass: 'intent-bar-craft' },
  'ẩm_thực': { label: 'Ẩm thực Sài Gòn', icon: '🍜', color: '#f97316', barClass: 'intent-bar-food' },
  'văn_hóa': { label: 'Di sản & Văn hóa', icon: '🏛️', color: '#10b981', barClass: 'intent-bar-culture' },
  'thư_giãn': { label: 'Thiên nhiên & Thư giãn', icon: '🌿', color: '#06b6d4', barClass: 'intent-bar-relax' },
}

const quickPresets = [
  {
    icon: '🍜',
    title: 'Ẩm thực & Cà phê vợt',
    prompt: 'Nhóm mình 2 người, muốn khám phá ẩm thực hẻm xưa và cà phê vợt Sài Gòn, đi từ 08:30 đến 16:30, tổng ngân sách 800.000₫ bằng xe máy.',
  },
  {
    icon: '🎨',
    title: 'Trải nghiệm làng nghề thủ công',
    prompt: 'Tụi mình 3 người thích tự tay làm gốm và làm sổ tay giấy Dó, xuất phát lúc 09:00, cần về trước 17:00, ngân sách khoảng 1.500.000₫.',
  },
  {
    icon: '🏛️',
    title: 'Di sản văn hóa & Kiến trúc',
    prompt: 'Nhóm 2 người đi tham quan các di tích lịch sử và bảo tàng nổi bật ở Quận 1, từ 08:00 đến 16:00, ngân sách 1.000.000₫.',
  },
  {
    icon: '⛵',
    title: 'Hoàng hôn Bến Bạch Đằng',
    prompt: 'Gia đình 4 người đi ô tô, thích ngắm hoàng hôn sông Sài Gòn và thư giãn nhẹ nhàng, bắt đầu lúc 14:30 về trước 21:00, ngân sách 2.500.000₫.',
  },
]

const localDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date)

function formatTimeOnly(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(date)
}

function makeConversationId() {
  return globalThis.crypto?.randomUUID?.() ?? `chat-${Date.now()}`
}

function foldPlaceName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLocaleLowerCase('vi-VN')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function findMatchingPoi(name: string, pois: POI[]) {
  const needle = foldPlaceName(name)
  if (needle.length < 3) return undefined
  return pois.find((poi) => {
    const candidate = foldPlaceName(poi.name)
    return candidate === needle || (needle.length >= 5 && (candidate.includes(needle) || needle.includes(candidate)))
  })
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`
}

function calculateDurationHours(start?: string | null, end?: string | null): string | null {
  if (!start || !end) return null
  try {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const diffMin = (eh * 60 + em) - (sh * 60 + sm)
    if (diffMin <= 0) return null
    const hours = (diffMin / 60).toFixed(1).replace('.0', '')
    return `${hours} giờ`
  } catch {
    return null
  }
}

function getChatError(reason: unknown) {
  if (typeof reason === 'object' && reason !== null && 'response' in reason) {
    const response = (reason as { response?: unknown }).response
    if (response) return apiErrorMessage(reason)
  }
  if (reason instanceof Error && reason.message && reason.message !== 'Network Error') return reason.message
  return 'Không kết nối được API. Kiểm tra máy chủ rồi thử lại.'
}

/** Formats simple markdown bold (**text**) and line breaks into JSX */
function FormattedChatMessage({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="chat-rich-text">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim()
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ')
        const text = isBullet ? trimmed.replace(/^[-•]\s*/, '') : line

        // Parse bold segments
        const parts = text.split(/(\*\*[^*]+\*\*)/g)
        const rendered = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx}>{part.slice(2, -2)}</strong>
          }
          return part
        })

        if (isBullet) {
          return (
            <div key={lIdx} className="chat-bullet-row">
              <span className="chat-bullet-dot" />
              <span>{rendered}</span>
            </div>
          )
        }

        return (
          <p key={lIdx} className={line === '' ? 'chat-p-blank' : 'chat-p'}>
            {rendered}
          </p>
        )
      })}
    </div>
  )
}

export function ChatPage() {
  const navigate = useNavigate()
  const [conversationId, setConversationId] = useState(makeConversationId)
  const [messages, setMessages] = useState<ChatLine[]>([initialMessage])
  const [userTurns, setUserTurns] = useState<string[]>([])
  const [constraints, setConstraints] = useState<ChatConstraints | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [pois, setPois] = useState<POI[]>([])
  const [poiError, setPoiError] = useState('')
  const [date, setDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return localDate(tomorrow)
  })
  const [originId, setOriginId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [lockedOverrides, setLockedOverrides] = useState<Record<number, string>>({})
  const feedEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    api.get<POI[]>('/pois')
      .then(({ data }) => { if (active) setPois(data) })
      .catch((reason: unknown) => { if (active) setPoiError(getChatError(reason)) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  const lockedPlaces = useMemo(() => (constraints?.locked_pois ?? []).map((name, index) => ({
    name,
    poiId: lockedOverrides[index] !== undefined
      ? lockedOverrides[index]
      : findMatchingPoi(name, pois)?.id ?? '',
  })), [constraints, lockedOverrides, pois])

  const unresolvedLockedPlaces = lockedPlaces.filter((place) => !place.poiId)
  const canCreateItinerary = Boolean(
    constraints?.is_complete && originId && destinationId && !poiError &&
    unresolvedLockedPlaces.length === 0 && !busy && !creating,
  )

  // Calculate constraint completion checklist
  const criteriaStatus = useMemo(() => {
    const hasGroup = Boolean(constraints?.group_size)
    const hasTime = Boolean(constraints?.start_time && constraints?.return_deadline)
    const hasBudget = Boolean(constraints?.budget_vnd)
    const hasIntents = Boolean(
      constraints?.intent_weights &&
      Object.values(constraints.intent_weights).some((w) => w > 0)
    )

    const totalCriteria = 4
    let metCriteria = 0
    if (hasGroup) metCriteria++
    if (hasTime) metCriteria++
    if (hasBudget) metCriteria++
    if (hasIntents) metCriteria++

    const percentage = Math.round((metCriteria / totalCriteria) * 100)
    return {
      hasGroup,
      hasTime,
      hasBudget,
      hasIntents,
      percentage,
      metCriteria,
      totalCriteria,
    }
  }, [constraints])

  const durationStr = useMemo(() => {
    return calculateDurationHours(constraints?.start_time, constraints?.return_deadline)
  }, [constraints?.start_time, constraints?.return_deadline])

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || busy) return

    const nextTurns = [...userTurns, text]
    const transcript = nextTurns.map((turn, index) => `Tin nhắn ${index + 1} của du khách: ${turn}`).join('\n')
    if (transcript.length > 3900) {
      setError('Cuộc trò chuyện đã dài. Hãy bắt đầu cuộc trò chuyện mới để tránh bỏ sót ràng buộc cũ.')
      return
    }

    const nowStr = formatTimeOnly(new Date())
    setDraft('')
    setError('')
    setUserTurns(nextTurns)
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', text, time: nowStr }])
    setBusy(true)

    try {
      const result = await sendChatMessage(transcript, conversationId)
      setConstraints(result.structured_constraints)
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: result.reply || result.structured_constraints.clarification_question_vi || 'Mình đã cập nhật các điều kiện chuyến đi.',
          time: formatTimeOnly(new Date()),
          snapshot: result.structured_constraints,
        },
      ])
    } catch (reason) {
      setError(getChatError(reason))
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: 'Mình chưa kết nối được bộ phân tích ngôn ngữ. Bạn vui lòng kiểm tra kết nối API và khóa cấu hình mô hình (OPENAI_API_KEY) nhé.',
          time: formatTimeOnly(new Date()),
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  function startNewConversation() {
    setConversationId(makeConversationId())
    setMessages([initialMessage])
    setUserTurns([])
    setConstraints(null)
    setDraft('')
    setError('')
    setLockedOverrides({})
  }

  function selectPreset(promptText: string) {
    setDraft(promptText)
  }

  async function createFromChat() {
    if (!constraints?.is_complete || !originId || !destinationId || unresolvedLockedPlaces.length) return
    setError('')
    setCreating(true)
    try {
      const startAt = new Date(`${date}T${constraints.start_time}:00+07:00`)
      const returnAt = new Date(`${date}T${constraints.return_deadline}:00+07:00`)
      if (startAt.getTime() <= Date.now()) throw new Error('Giờ bắt đầu đã qua. Hãy chọn ngày đi khác hoặc điều chỉnh giờ bắt đầu.')
      if (returnAt <= startAt) throw new Error('Giờ về phải sau giờ bắt đầu trong cùng ngày. Hãy điều chỉnh giờ trong cuộc trò chuyện.')

      const origin = pois.find((poi) => poi.id === originId)
      const destination = pois.find((poi) => poi.id === destinationId)
      if (!origin || !destination) throw new Error('Không tìm thấy điểm xuất phát hoặc điểm về trong danh mục.')

      const result = await createItinerary({
        start_at: startAt.toISOString(),
        end_at: returnAt.toISOString(),
        group_size: constraints.group_size!,
        budget_vnd: constraints.budget_vnd!,
        transport_mode: constraints.travel_mode === 'car' ? 'driving' : constraints.travel_mode,
        intent_weights: constraints.intent_weights,
        locked_experience_ids: [],
        locked_poi_ids: lockedPlaces.map((place) => place.poiId),
        origin_latitude: origin.latitude,
        origin_longitude: origin.longitude,
        origin_label: origin.name,
        destination_latitude: destination.latitude,
        destination_longitude: destination.longitude,
        destination_label: destination.name,
      }, { allowSimulation: false })
      navigate(`/itinerary/${result.itinerary_id}`, { state: { itinerary: result } })
    } catch (reason) {
      setError(getChatError(reason))
    } finally {
      setCreating(false)
    }
  }

  const travelModeIcons = {
    motorcycle: <Bike size={15} />,
    car: <Car size={15} />,
    walking: <Footprints size={15} />,
    transit: <Bus size={15} />,
  }

  const modeLabels: Record<ChatConstraints['travel_mode'], string> = {
    motorcycle: 'Xe máy',
    walking: 'Đi bộ',
    car: 'Ô tô',
    transit: 'Xe buýt / Công cộng',
  }

  return (
    <div className="page-wrap chat-page">
      {/* Page Header */}
      <header className="chat-page-heading">
        <div className="chat-heading-left">
          <div className="chat-badge-live">
            <span className="live-dot-pulse" />
            <span>AI TRIP CONCIERGE · TP. HỒ CHÍ MINH</span>
          </div>
          <h1 className="page-heading-3d">
            Kể mình nghe về <span className="gradient-text-emerald">chuyến đi bạn muốn.</span>
          </h1>
          <p className="page-subtext-3d">
            Trợ lý tự động trích xuất điều kiện, kiểm tra khung giờ thực của các điểm đến và chuyển giao sang thuật toán tối ưu hóa di chuyển.
          </p>
        </div>

        <div className="chat-heading-actions">
          <button
            type="button"
            className="chat-reset-button"
            onClick={startNewConversation}
            disabled={busy || creating}
            title="Làm mới cuộc trò chuyện"
          >
            <RotateCcw size={15} />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="chat-workspace">
        {/* Left Side: Interactive Chat Panel */}
        <section className="chat-panel" aria-label="Trò chuyện với trợ lý">
          <div className="chat-panel-topbar">
            <div className="chat-avatar-ring">
              <Bot size={22} className="chat-assistant-bot" />
            </div>
            <div className="chat-topbar-meta">
              <div className="chat-assistant-name-row">
                <strong>Local Explorer Concierge</strong>
                <span className="chat-status-pill">
                  <span className="chat-online-dot" /> Trực tuyến
                </span>
              </div>
              <span className="chat-subtitle-note">
                Tự động bắt cặp Slot thời gian thực & Heuristic Planner 0ms
              </span>
            </div>
            <div className="chat-topbar-badges">
              <span className="chat-prompt-version">NLU · PRD 3.0</span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="chat-message-feed" aria-live="polite" aria-relevant="additions text">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message-row ${message.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}`}
              >
                {message.role === 'assistant' && (
                  <div className="chat-message-avatar">
                    <Bot size={16} />
                  </div>
                )}

                <div className="chat-bubble-container">
                  <div className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                    <FormattedChatMessage content={message.text} />
                  </div>

                  {/* AI Snapshot Pills if constraints detected on assistant turn */}
                  {message.role === 'assistant' && message.snapshot && (
                    <div className="chat-snapshot-bar">
                      <span className="snapshot-label">
                        <Sparkles size={11} className="text-amber" /> Trích xuất:
                      </span>
                      {message.snapshot.group_size && (
                        <span className="snapshot-tag">
                          <Users size={11} /> {message.snapshot.group_size} người
                        </span>
                      )}
                      {message.snapshot.start_time && message.snapshot.return_deadline && (
                        <span className="snapshot-tag">
                          <Clock size={11} /> {message.snapshot.start_time} - {message.snapshot.return_deadline}
                        </span>
                      )}
                      {message.snapshot.budget_vnd != null && (
                        <span className="snapshot-tag">
                          <Wallet size={11} /> {formatMoney(message.snapshot.budget_vnd)}
                        </span>
                      )}
                      {message.snapshot.travel_mode && (
                        <span className="snapshot-tag">
                          {travelModeIcons[message.snapshot.travel_mode]} {modeLabels[message.snapshot.travel_mode]}
                        </span>
                      )}
                    </div>
                  )}

                  {message.time && <span className="chat-time-tag">{message.time}</span>}
                </div>
              </div>
            ))}

            {busy && (
              <div className="chat-message-row chat-message-assistant">
                <div className="chat-message-avatar">
                  <Bot size={16} />
                </div>
                <div className="chat-bubble chat-bubble-assistant chat-thinking">
                  <div className="chat-pulse-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span>Đang phân tích mong muốn & kiểm tra các khung giờ khả dụng…</span>
                </div>
              </div>
            )}
            <div ref={feedEndRef} />
          </div>

          {/* Quick Preset Starters */}
          {!userTurns.length && (
            <div className="chat-starter-container">
              <div className="starter-header">
                <Sparkles size={13} className="text-amber" />
                <span>Gợi ý trải nghiệm bắt đầu nhanh</span>
              </div>
              <div className="starter-grid">
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="starter-card"
                    onClick={() => selectPreset(preset.prompt)}
                  >
                    <div className="starter-card-top">
                      <span className="starter-emoji">{preset.icon}</span>
                      <strong className="starter-title">{preset.title}</strong>
                    </div>
                    <p className="starter-desc">{preset.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer Form */}
          <form className="chat-composer" onSubmit={submitMessage}>
            <label className="sr-only" htmlFor="chat-message">
              Tin nhắn cho trợ lý
            </label>
            <textarea
              id="chat-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Ví dụ: Nhóm mình 3 người, muốn làm gốm Quận 3, đi từ 9:00 đến 17:00, ngân sách 1 triệu..."
              maxLength={1000}
              rows={2}
              disabled={busy}
            />
            <div className="chat-composer-bottom">
              <div className="chat-composer-hint">
                <kbd>Enter</kbd> gửi · <kbd>Shift + Enter</kbd> xuống dòng
              </div>
              <button
                type="submit"
                className="chat-send-button"
                disabled={!draft.trim() || busy}
                aria-label="Gửi tin nhắn"
              >
                {busy ? <LoaderCircle size={18} className="chat-spinner" /> : <Send size={16} />}
              </button>
            </div>
          </form>

          <p className="chat-model-note">
            <Info size={13} className="inline mr-1 text-cyan" />
            Trợ lý chạy mô hình phân tích ngữ nghĩa có cấu trúc (PRD 3.0), kiểm tra chéo với cơ sở dữ liệu POI & Slot thực tế để tránh ảo tưởng (hallucination-free).
          </p>
        </section>

        {/* Right Side: Trip Dashboard & Constraints HUD */}
        <aside className="chat-trip-sidebar">
          {/* Realtime Progress & HUD Card */}
          <section className="chat-sidebar-card hud-progress-card">
            <div className="chat-sidebar-title">
              <Sparkles size={17} className="text-emerald" />
              <h2>Điều kiện chuyến đi</h2>
              <span className={`hud-state-pill ${constraints?.is_complete ? 'is-complete' : ''}`}>
                {constraints?.is_complete ? (
                  <>
                    <Check size={12} /> Đã đủ 100%
                  </>
                ) : (
                  <>
                    <CircleHelp size={12} /> {criteriaStatus.metCriteria}/{criteriaStatus.totalCriteria} tiêu chí
                  </>
                )}
              </span>
            </div>

            {/* Completeness progress bar */}
            <div className="hud-progress-meter">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${criteriaStatus.percentage}%` }}
                />
              </div>
              <div className="progress-labels">
                <span>Mức độ hoàn thiện</span>
                <strong>{criteriaStatus.percentage}%</strong>
              </div>
            </div>

            {/* 4 Essential Parameter Grid */}
            <div className="hud-param-grid">
              {/* Group Size */}
              <div className={`param-cell ${criteriaStatus.hasGroup ? 'param-active' : ''}`}>
                <div className="param-header">
                  <Users size={14} className="text-cyan" />
                  <span>Quy mô</span>
                </div>
                <div className="param-val">
                  {constraints?.group_size ? `${constraints.group_size} người` : '—'}
                </div>
                <div className="param-sub">
                  {constraints?.group_size ? 'Đoàn riêng' : 'Chưa có'}
                </div>
              </div>

              {/* Time Window */}
              <div className={`param-cell ${criteriaStatus.hasTime ? 'param-active' : ''}`}>
                <div className="param-header">
                  <Clock size={14} className="text-emerald" />
                  <span>Khung giờ</span>
                </div>
                <div className="param-val">
                  {constraints?.start_time && constraints?.return_deadline
                    ? `${constraints.start_time} - ${constraints.return_deadline}`
                    : '—'}
                </div>
                <div className="param-sub">
                  {durationStr ? `Thời lượng: ${durationStr}` : 'Chưa có'}
                </div>
              </div>

              {/* Budget */}
              <div className={`param-cell ${criteriaStatus.hasBudget ? 'param-active' : ''}`}>
                <div className="param-header">
                  <Wallet size={14} className="text-amber" />
                  <span>Ngân sách</span>
                </div>
                <div className="param-val">
                  {constraints?.budget_vnd != null ? formatMoney(constraints.budget_vnd) : '—'}
                </div>
                <div className="param-sub">
                  {constraints?.budget_vnd && constraints?.group_size
                    ? `~${formatMoney(Math.round(constraints.budget_vnd / constraints.group_size))}/người`
                    : 'Tổng quỹ'}
                </div>
              </div>

              {/* Travel Mode */}
              <div className="param-cell param-active">
                <div className="param-header">
                  {travelModeIcons[constraints?.travel_mode ?? 'motorcycle']}
                  <span>Phương tiện</span>
                </div>
                <div className="param-val">
                  {modeLabels[constraints?.travel_mode ?? 'motorcycle']}
                </div>
                <div className="param-sub">Tự động tính ETA</div>
              </div>
            </div>

            {/* Missing Fields Checklist */}
            {constraints && !constraints.is_complete && (
              <div className="hud-missing-checklist">
                <span className="checklist-title">Còn cần làm rõ:</span>
                <div className="checklist-items">
                  {!criteriaStatus.hasGroup && (
                    <span className="missing-badge">👥 Số lượng người</span>
                  )}
                  {!criteriaStatus.hasTime && (
                    <span className="missing-badge">⏰ Giờ đi & về</span>
                  )}
                  {!criteriaStatus.hasBudget && (
                    <span className="missing-badge">💰 Ngân sách</span>
                  )}
                  {!criteriaStatus.hasIntents && (
                    <span className="missing-badge">🏷️ Sở thích</span>
                  )}
                </div>
              </div>
            )}

            {/* Intent Distribution Bars */}
            <div className="chat-intent-summary">
              <span className="intent-section-title">
                <Layers size={13} className="text-cyan" /> Phân bổ sở thích nhận diện
              </span>
              <div className="intent-bars-list">
                {Object.entries(intentConfigs).map(([key, cfg]) => {
                  const weight = constraints?.intent_weights?.[key] ?? 0
                  const pct = Math.round(weight * 100)
                  return (
                    <div key={key} className="intent-bar-row">
                      <div className="intent-row-label">
                        <span>
                          {cfg.icon} {cfg.label}
                        </span>
                        <strong>{pct}%</strong>
                      </div>
                      <div className="intent-track">
                        <div
                          className={`intent-fill ${cfg.barClass}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Route Terminals (Điểm đi & Điểm về) */}
          <section className="chat-sidebar-card chat-location-card">
            <div className="chat-sidebar-title">
              <MapPin size={17} className="text-amber" />
              <h2>Tuyến đường & Mốc thời gian</h2>
            </div>
            <p className="card-desc-text">
              Xác định điểm xuất phát và nơi cần có mặt lúc kết thúc để thuật toán tính quãng đường và thời gian quay về.
            </p>

            {poiError ? (
              <div className="chat-inline-error">Không tải được danh mục điểm đến: {poiError}</div>
            ) : (
              <div className="location-inputs-wrapper">
                {/* Origin */}
                <div className="location-field-group">
                  <div className="pin-indicator pin-origin">
                    <span>A</span>
                  </div>
                  <div className="location-field-inner">
                    <label htmlFor="origin-poi-select">Điểm xuất phát *</label>
                    <select
                      id="origin-poi-select"
                      value={originId}
                      onChange={(event) => setOriginId(event.target.value)}
                      disabled={!pois.length}
                    >
                      <option value="">-- Chọn điểm xuất phát --</option>
                      {pois.map((poi) => (
                        <option key={poi.id} value={poi.id}>
                          {poi.name} {poi.district ? `(${poi.district})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vertical connector line */}
                <div className="location-route-line" />

                {/* Destination */}
                <div className="location-field-group">
                  <div className="pin-indicator pin-dest">
                    <span>B</span>
                  </div>
                  <div className="location-field-inner">
                    <label htmlFor="destination-poi-select">Điểm kết thúc (phải về) *</label>
                    <select
                      id="destination-poi-select"
                      value={destinationId}
                      onChange={(event) => setDestinationId(event.target.value)}
                      disabled={!pois.length}
                    >
                      <option value="">-- Chọn điểm trở về --</option>
                      {pois.map((poi) => (
                        <option key={poi.id} value={poi.id}>
                          {poi.name} {poi.district ? `(${poi.district})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Picker */}
                <div className="date-picker-row">
                  <label htmlFor="trip-date-input">
                    <CalendarDays size={14} className="text-cyan" /> Ngày trải nghiệm
                  </label>
                  <input
                    id="trip-date-input"
                    type="date"
                    value={date}
                    min={localDate(new Date())}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Locked POIs (Điểm bắt buộc ghé) */}
          {constraints?.locked_pois?.length ? (
            <section className="chat-sidebar-card">
              <div className="chat-sidebar-title">
                <Lock size={16} className="text-rose" />
                <h2>Điểm ghim cố định ({constraints.locked_pois.length})</h2>
              </div>
              <p className="card-desc-text">
                Khóa các điểm bạn chỉ định để thuật toán sắp xếp các trải nghiệm khác xung quanh.
              </p>
              <div className="chat-lock-list">
                {constraints.locked_pois.map((name, index) => {
                  const place = lockedPlaces[index]
                  const isMatched = Boolean(place?.poiId)
                  return (
                    <div key={`${index}-${name}`} className="lock-item-card">
                      <div className="lock-item-header">
                        <span className="lock-name">{name}</span>
                        {isMatched ? (
                          <span className="lock-badge-ok">
                            <Check size={11} /> Khớp POI
                          </span>
                        ) : (
                          <span className="lock-badge-warn">
                            <AlertCircle size={11} /> Chọn POI
                          </span>
                        )}
                      </div>
                      <select
                        value={place?.poiId ?? ''}
                        onChange={(event) =>
                          setLockedOverrides((current) => ({ ...current, [index]: event.target.value }))
                        }
                      >
                        <option value="">-- Chọn POI trong danh mục --</option>
                        {pois.map((poi) => (
                          <option key={poi.id} value={poi.id}>
                            {poi.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </section>
          ) : null}

          {/* Error Banner */}
          {error && (
            <div className="chat-error-banner" role="alert">
              <AlertCircle size={16} className="flex-shrink-0 text-rose" />
              <span>{error}</span>
            </div>
          )}

          {/* Create Itinerary Launch Action */}
          <div className="chat-launch-area">
            <button
              type="button"
              className="chat-create-button"
              onClick={() => void createFromChat()}
              disabled={!canCreateItinerary}
            >
              {creating ? (
                <>
                  <LoaderCircle size={18} className="chat-spinner" />
                  <span>Đang tính toán Heuristic & tối ưu hành trình…</span>
                </>
              ) : (
                <>
                  <Zap size={18} className="text-amber fill-amber" />
                  <span>Tạo lịch trình ngay</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Launch Checklist */}
            <div className="chat-launch-checklist">
              <div className={`chk-item ${constraints?.is_complete ? 'chk-done' : ''}`}>
                {constraints?.is_complete ? <CheckCircle2 size={13} /> : <CircleHelp size={13} />}
                <span>Đủ thông tin ràng buộc AI</span>
              </div>
              <div className={`chk-item ${originId && destinationId ? 'chk-done' : ''}`}>
                {originId && destinationId ? <CheckCircle2 size={13} /> : <CircleHelp size={13} />}
                <span>Đã chọn điểm đi & về</span>
              </div>
              <div className={`chk-item ${unresolvedLockedPlaces.length === 0 ? 'chk-done' : ''}`}>
                {unresolvedLockedPlaces.length === 0 ? <CheckCircle2 size={13} /> : <CircleHelp size={13} />}
                <span>Điểm ghim đã khớp POI</span>
              </div>
            </div>
          </div>

          <div className="chat-sidebar-footnote">
            Khung giờ thực tế, sức chứa và cước phí di chuyển sẽ được thuật toán tối ưu hóa trước khi trình bày lịch trình.
          </div>
        </aside>
      </div>
    </div>
  )
}
