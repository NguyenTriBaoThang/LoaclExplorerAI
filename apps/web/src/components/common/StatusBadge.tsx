import { CircleAlert, CircleCheck, CircleDashed } from 'lucide-react'

export function SimulatedBadge() {
  return (
    <span className="status-badge-3d status-simulated">
      <CircleDashed size={12} className="spin-slow" />
      <span>Dữ liệu mô phỏng</span>
    </span>
  )
}

export function VerificationBadge({ status }: { status: string }) {
  if (status === 'verified') {
    return (
      <span className="status-badge-3d status-verified">
        <CircleCheck size={12} />
        <span>Đã xác thực</span>
      </span>
    )
  }
  if (status === 'simulated') return <SimulatedBadge />
  return (
    <span className="status-badge-3d status-pending">
      <CircleAlert size={12} />
      <span>Cần xác nhận</span>
    </span>
  )
}
