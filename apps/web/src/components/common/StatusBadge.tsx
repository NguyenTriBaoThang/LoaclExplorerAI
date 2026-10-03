import { CircleAlert, CircleCheck, CircleDashed } from 'lucide-react'
import { useTranslation } from '../../i18n'

export function SimulatedBadge() {
  const { t } = useTranslation()
  return (
    <span className="status-badge-3d status-simulated">
      <CircleDashed size={12} className="spin-slow" />
      <span>{t('common.simulatedBadge')}</span>
    </span>
  )
}

export function VerificationBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  if (status === 'verified') {
    return (
      <span className="status-badge-3d status-verified">
        <CircleCheck size={12} />
        <span>{t('common.verifiedBadge')}</span>
      </span>
    )
  }
  if (status === 'simulated') return <SimulatedBadge />
  return (
    <span className="status-badge-3d status-pending">
      <CircleAlert size={12} />
      <span>{t('common.pendingBadge')}</span>
    </span>
  )
}
