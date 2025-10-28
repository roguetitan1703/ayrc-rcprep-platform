import React from 'react'
import { Button } from './Button'

export default function Table({
  columns = [],
  data = [],
  loading = false,
  error = '',
  page = 1,
  total = 0,
  pageSize = 10,
  onPageChange = () => {},
  onSort = () => {},
  sortField,
  sortOrder,
}) {
  const totalPages = Math.max(1, Math.ceil((total || data.length) / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total || data.length, page * pageSize)

  return (
    <div className="overflow-x-auto bg-card-surface rounded-xl border border-soft shadow-card">
      <table className="min-w-full divide-y divide-border-soft">
        <thead className="bg-surface-muted">
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.field} className={`px-4 py-3 text-left text-text-secondary text-sm ${c.headerClassName || ''}`}>
                {c.sortable ? (
                  <button
                    type="button"
                    onClick={() => onSort(c.field)}
                    className="inline-flex items-center gap-2 font-medium text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring rounded"
                    aria-sort={sortField === c.field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <span>{c.header}</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${sortField === c.field && sortOrder === 'desc' ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <div className="font-medium text-sm text-text-primary">{c.header}</div>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {loading ? (
            // skeleton rows
            Array.from({ length: Math.min(6, pageSize) }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="hover:bg-surface-hover transition-colors">
                {columns.map((c, idx) => (
                  <td key={idx} className={`px-4 py-4 align-top ${c.cellClassName || ''}`}>
                    <div className="h-4 bg-surface-muted/60 rounded w-3/4 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : error ? (
            <tr>
              <td className="px-4 py-6 text-error-red" colSpan={columns.length}>{error}</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-text-secondary" colSpan={columns.length}>No records found</td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={row._id || row.id || ri} className={`transition-colors hover:bg-gray-100 ${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                {columns.map((c) => (
                  <td key={c.key || c.field} className={`px-4 py-3 align-top text-sm ${c.cellClassName || ''}`}>
                    {c.render ? c.render(row) : (row[c.field] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* pagination */}
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-text-secondary">Showing {from} to {to} of {total || data.length} results</div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>Previous</Button>
          <div className="text-sm text-text-secondary">Page {page} of {totalPages}</div>
          <Button size="sm" variant="primary" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</Button>
        </div>
      </div>
    </div>
  )
}
