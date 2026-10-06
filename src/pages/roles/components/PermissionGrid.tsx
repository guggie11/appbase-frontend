import { Check, Minus, ShieldAlert } from 'lucide-react'

import {
  ACTION_COLUMNS,
  actionLabel,
  cellState,
  countSelected,
  rowOffersChoice,
  rowSelectionState,
  toggleCell,
  toggleRow,
} from '../matrix'
import type { MatrixRow } from '../matrix'

interface Props {
  rows: MatrixRow[]
  granted: Set<string>
  onChange: (next: Set<string>) => void
  /** Platform roles are locked in the backend; the grid must look read-only. */
  locked?: boolean
  /** Shown in the sticky header so the subject is never off-screen. */
  roleName?: string
}

/**
 * RESOURCE x ACTION grid.
 *
 * A cell has three states that must stay visually distinct: granted,
 * offered-but-not-granted, and not-applicable. Rendering the last as an empty
 * box would claim the permission was withheld when it was never offered.
 *
 * The header is sticky: once it scrolls away, every checkbox below it loses
 * the only thing that says which action it controls.
 */
export function PermissionGrid({
  rows,
  granted,
  onChange,
  locked = false,
  roleName,
}: Props) {
  const total = countSelected(rows, granted)
  // Count only cells the grid actually renders. Including the extra slugs
  // made the denominator describe permissions that are nowhere on screen.
  const available = rows.reduce(
    (sum, row) => sum + ACTION_COLUMNS.filter((a) => row.cells[a]?.available).length,
    0,
  )

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#e2e3e3] bg-white">
      <div className="flex items-center justify-between border-b border-[#e2e3e3] px-5 py-3.5">
        <div>
          <p className="text-[13px] font-medium text-[#1b1c1e]">
            {roleName ? `Permissions — ${roleName}` : 'Permissions'}
          </p>
          <p className="mt-0.5 text-[12px] text-[#6c6e70]">
            {total} of {available} granted
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#8a8c8e]">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-[4px] border border-[#8a8c8e] text-[#1b1c1e]">
              <Minus size={10} strokeWidth={3} aria-hidden="true" />
            </span>
            partly granted
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Minus size={12} className="text-[#c9cbcc]" aria-hidden="true" />
            not available
          </span>
          {locked && (
            <span className="rounded-full bg-[#eceded] px-2.5 py-1 font-medium text-[#6c6e70]">
              Locked
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[480px] overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#f7f7f8]">
              <th className="border-b border-[#e2e3e3] bg-[#f7f7f8] px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[#8a8c8e]">
                Resource
              </th>
              {ACTION_COLUMNS.map((action) => (
                <th
                  key={action}
                  className="w-[92px] border-b border-[#e2e3e3] bg-[#f7f7f8] px-2 py-2.5 text-center text-[11px] font-medium uppercase tracking-wide text-[#8a8c8e]"
                >
                  {actionLabel(action)}
                </th>
              ))}
              <th className="w-[72px] border-b border-[#e2e3e3] bg-[#f7f7f8] px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-[#8a8c8e]">
                All
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rowState = rowSelectionState(row, granted)
              return (
                <tr key={row.module} className="border-b border-[#eceded] last:border-0">
                  {/* Top-aligned: centring pulled the title away from the
                      checkboxes on rows that carry a sub-label. */}
                  <td className="px-5 py-3 align-top">
                    <p className="text-[13px] leading-[22px] text-[#1b1c1e]">{row.label}</p>
                    {row.extra.length > 0 && (
                      <p className="mt-0.5 font-mono text-[11px] text-[#8a8c8e]">
                        {row.extra.join(', ')}
                      </p>
                    )}
                  </td>

                  {ACTION_COLUMNS.map((action) => {
                    const state = cellState(row, action, granted)
                    const cell = row.cells[action]

                    if (state === 'unavailable') {
                      return (
                        <td key={action} className="px-2 py-3 align-top text-center">
                          <span
                            className="inline-flex h-[22px] items-center justify-center text-[#c9cbcc]"
                            title={`${row.label} has no ${actionLabel(action).toLowerCase()} action`}
                          >
                            <Minus size={14} aria-hidden="true" />
                            <span className="sr-only">not available</span>
                          </span>
                        </td>
                      )
                    }

                    const isOn = state === 'granted'
                    return (
                      <td key={action} className="px-2 py-3 align-top text-center">
                        <span className="inline-flex h-[22px] items-center justify-center gap-1">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isOn}
                            aria-label={`${cell.name ?? cell.slug} for ${row.label}`}
                            title={cell.description ?? undefined}
                            disabled={locked}
                            onClick={() => cell.slug && onChange(toggleCell(granted, cell.slug))}
                            className={[
                              // Square, not a pill: pills read as the ON/OFF
                              // switches used elsewhere on this page.
                              'inline-flex h-[20px] w-[20px] items-center justify-center rounded-[5px] border transition',
                              isOn
                                ? 'border-[#d8452a] bg-[#d8452a] text-white'
                                : 'border-[#c9cbcc] bg-white text-transparent hover:border-[#8a8c8e]',
                              locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                            ].join(' ')}
                          >
                            <Check size={13} strokeWidth={3} aria-hidden="true" />
                          </button>
                          {cell.is_dangerous && isOn && (
                            <span
                              className="text-[#b4442c]"
                              title="Destructive permission"
                            >
                              <ShieldAlert size={12} aria-hidden="true" />
                            </span>
                          )}
                        </span>
                      </td>
                    )
                  })}

                  <td className="px-3 py-3 align-top text-right">
                    {/* A control, not a word: every other column in this row
                        is a checkbox, so a text link read as a label. */}
                    <span className="inline-flex h-[22px] items-center justify-end">
                      {rowOffersChoice(row) ? (
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={
                            rowState === 'all' ? true : rowState === 'some' ? 'mixed' : false
                          }
                          aria-label={`${rowState === 'all' ? 'Clear' : 'Select'} all actions for ${row.label}`}
                          title={
                            rowState === 'all'
                              ? `Clear every action for ${row.label}`
                              : `Grant every action for ${row.label}`
                          }
                          disabled={locked}
                          onClick={() => onChange(toggleRow(row, granted))}
                          className={[
                            'inline-flex h-[20px] w-[20px] items-center justify-center rounded-[5px] border transition',
                            rowState === 'all'
                              ? 'border-[#1b1c1e] bg-[#1b1c1e] text-white'
                              : rowState === 'some'
                                ? 'border-[#8a8c8e] bg-white text-[#1b1c1e]'
                                : 'border-[#c9cbcc] bg-white text-transparent hover:border-[#8a8c8e]',
                            locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                          ].join(' ')}
                        >
                          {rowState === 'some' ? (
                            <Minus size={13} strokeWidth={3} aria-hidden="true" />
                          ) : (
                            <Check size={13} strokeWidth={3} aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        /* Left blank on purpose: a dash here would be read as
                           "not available" per the legend, but the row does
                           offer its single action in the column to the left. */
                        <span className="sr-only">
                          {row.label} has a single action
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
