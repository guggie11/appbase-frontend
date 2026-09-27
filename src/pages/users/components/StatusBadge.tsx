interface StatusBadgeProps {
  status: string
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  active: { label: 'Active', classes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  inactive: { label: 'Inactive', classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  suspended: { label: 'Suspended', classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, classes: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}
