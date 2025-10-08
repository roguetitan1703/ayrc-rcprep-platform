import { useState, useMemo } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/ui/Card'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

export function QuestionTypeTable({ data }) {
  const [sortBy, setSortBy] = useState('totalQuestions')
  const [sortOrder, setSortOrder] = useState('desc')

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
    return sorted
  }, [data, sortBy, sortOrder])

  function toggleSort(column) {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  function getAccuracyColor(accuracy) {
    if (accuracy >= 75) return 'text-[#23A094]'
    if (accuracy >= 60) return 'text-[#F6B26B]'
    return 'text-[#E4572E]'
  }

  function getAccuracyBg(accuracy) {
    if (accuracy >= 75) return 'bg-[#23A094]'
    if (accuracy >= 60) return 'bg-[#F6B26B]'
    return 'bg-[#E4572E]'
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown size={14} className="opacity-40" />
    return sortOrder === 'asc' 
      ? <ArrowUp size={14} className="text-[#D33F49]" /> 
      : <ArrowDown size={14} className="text-[#D33F49]" />
  }

  return (
    <Card className="bg-white border border-[#D8DEE9] hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-6 border-b border-[#D8DEE9]">
        <h3 className="text-lg font-semibold text-[#273043]">Question Type Breakdown</h3>
        <p className="text-sm text-[#5C6784] mt-1">
          Click column headers to sort • Color-coded by performance
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#EEF1FA]">
              <tr>
                <th 
                  onClick={() => toggleSort('type')}
                  className="px-6 py-4 text-left text-xs font-bold text-[#273043] uppercase tracking-wider cursor-pointer hover:bg-[#D8DEE9]/30 transition"
                >
                  <div className="flex items-center gap-2">
                    Type
                    <SortIcon column="type" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('totalQuestions')}
                  className="px-6 py-4 text-right text-xs font-bold text-[#273043] uppercase tracking-wider cursor-pointer hover:bg-[#D8DEE9]/30 transition"
                >
                  <div className="flex items-center justify-end gap-2">
                    Questions
                    <SortIcon column="totalQuestions" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('accuracy')}
                  className="px-6 py-4 text-right text-xs font-bold text-[#273043] uppercase tracking-wider cursor-pointer hover:bg-[#D8DEE9]/30 transition"
                >
                  <div className="flex items-center justify-end gap-2">
                    Accuracy
                    <SortIcon column="accuracy" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE9]">
              {sortedData.map((row) => (
                <tr key={row.type} className="hover:bg-[#EEF1FA]/30 transition">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EEF1FA] text-[#273043] capitalize border border-[#D8DEE9]">
                      {row.type.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-[#5C6784]">
                    {row.totalQuestions}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`h-2 w-20 bg-[#EEF1FA] rounded-full overflow-hidden`}>
                        <div 
                          className={`h-full ${getAccuracyBg(row.accuracy)} transition-all duration-500`}
                          style={{ width: `${row.accuracy}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getAccuracyColor(row.accuracy)} min-w-[50px]`}>
                        {row.accuracy.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
