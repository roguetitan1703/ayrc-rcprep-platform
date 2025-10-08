import { useMemo } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/ui/Card'
import { ResponsiveLine } from '@nivo/line'

export function ProgressTimeline({ data }) {
  const chartData = useMemo(() => {
    // Group by date and calculate stats
    const grouped = data.reduce((acc, attempt) => {
      const date = attempt.date.split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, attempts: 0, totalScore: 0, count: 0 }
      }
      acc[date].attempts++
      acc[date].totalScore += attempt.score
      acc[date].count++
      return acc
    }, {})

    const sorted = Object.values(grouped)
      .map(day => ({
        x: day.date,
        attempts: day.attempts,
        avgScore: ((day.totalScore / day.count) * 25).toFixed(1)
      }))
      .sort((a, b) => new Date(a.x) - new Date(b.x))

    return [
      {
        id: 'Average Score %',
        color: '#D33F49',
        data: sorted.map(d => ({ x: d.x, y: parseFloat(d.avgScore) }))
      },
      {
        id: 'Attempts',
        color: '#3B82F6',
        data: sorted.map(d => ({ x: d.x, y: d.attempts * 20 })) // Scale for visibility
      }
    ]
  }, [data])

  return (
    <Card className="bg-white border border-[#D8DEE9] hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-6 border-b border-[#D8DEE9]">
        <h3 className="text-lg font-semibold text-[#273043]">Progress Timeline</h3>
        <p className="text-sm text-[#5C6784] mt-1">
          Daily performance trends over time
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div style={{ height: '400px' }}>
          <ResponsiveLine
            data={chartData}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false, reverse: false }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: 'Date',
              legendOffset: 45,
              legendPosition: 'middle',
              format: (value) => {
                const d = new Date(value)
                return `${d.getMonth() + 1}/${d.getDate()}`
              }
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Performance',
              legendOffset: -50,
              legendPosition: 'middle'
            }}
            colors={d => d.color}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            enableSlices="x"
            curve="monotoneX"
            lineWidth={3}
            enableArea={true}
            areaOpacity={0.1}
            animate={true}
            motionConfig="gentle"
            theme={{
              axis: {
                domain: {
                  line: {
                    stroke: '#D8DEE9',
                    strokeWidth: 1
                  }
                },
                ticks: {
                  line: {
                    stroke: '#D8DEE9',
                    strokeWidth: 1
                  },
                  text: {
                    fontSize: 11,
                    fill: '#5C6784',
                    fontWeight: 500
                  }
                },
                legend: {
                  text: {
                    fontSize: 12,
                    fill: '#273043',
                    fontWeight: 600
                  }
                }
              },
              grid: {
                line: {
                  stroke: '#D8DEE9',
                  strokeWidth: 1,
                  strokeDasharray: '4 4'
                }
              },
              legends: {
                text: {
                  fontSize: 12,
                  fill: '#273043',
                  fontWeight: 500
                }
              },
              tooltip: {
                container: {
                  background: '#FFFFFF',
                  color: '#273043',
                  fontSize: 12,
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  padding: '12px 16px',
                  border: '1px solid #D8DEE9'
                }
              }
            }}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
