import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}

export default function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No data found.',
}: DataTableProps<T>) {
  return (
    <div
      className="overflow-x-auto"
      style={{
        borderRadius: 'var(--border-radius-lg)',
        background: 'white',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <table className="w-full">
        <thead>
          <tr style={{ background: 'rgba(107,163,190,0.04)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="text-left text-caption font-semibold"
                style={{
                  color: 'var(--soft-gray)',
                  padding: 'var(--space-3) var(--space-4)',
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-body-sm text-center py-12"
                style={{ color: 'var(--soft-gray)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={idx}
                className="transition-colors duration-[var(--duration-fast)]"
                style={{
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(107,163,190,0.02)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="text-body-sm"
                    style={{
                      color: 'var(--deep-slate)',
                      padding: 'var(--space-3) var(--space-4)',
                    }}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
