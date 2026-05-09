import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  color: string
}

export default function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <div
      className="transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
      style={{
        borderRadius: 'var(--border-radius-lg)',
        background: 'white',
        border: '1px solid rgba(0,0,0,0.06)',
        padding: 'var(--space-6)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-caption font-medium mb-1" style={{ color: 'var(--soft-gray)' }}>
            {title}
          </p>
          <p
            className="text-h3 font-display"
            style={{ color: 'var(--deep-slate)', fontSize: '1.75rem' }}
          >
            {value}
          </p>
          <p className="text-caption mt-1" style={{ color: 'var(--soft-gray)' }}>
            {subtitle}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  )
}
