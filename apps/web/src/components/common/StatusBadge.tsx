import { CircleAlert, CircleCheck, CircleDashed } from 'lucide-react'

export function SimulatedBadge() {
  return <span className="status-badge status-simulated"><CircleDashed size={13} /> Dữ liệu mô phỏng</span>
}

export function VerificationBadge({ status }: { status: string }) {
  if (status === 'verified') return <span className="status-badge status-verified"><CircleCheck size={13} /> Đã xác minh</span>
  if (status === 'simulated') return <SimulatedBadge />
  return <span className="status-badge status-pending"><CircleAlert size={13} /> Cần xác nhận</span>
}
