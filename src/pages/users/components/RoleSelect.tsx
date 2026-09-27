import type { Role } from '@/shared/api/types'

interface RoleSelectProps {
  roles: Role[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

export function RoleSelect({ roles, value, onChange, disabled }: RoleSelectProps) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
      {roles.length === 0 && (
        <p className="text-xs text-gray-400 p-3 text-center">No roles available</p>
      )}
      {roles.map((role) => (
        <label
          key={role.id}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <input
            type="checkbox"
            checked={value.includes(role.id)}
            onChange={() => toggle(role.id)}
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{role.name}</span>
          {role.is_system && (
            <span className="ml-auto text-xs text-indigo-500 font-medium">system</span>
          )}
        </label>
      ))}
    </div>
  )
}
