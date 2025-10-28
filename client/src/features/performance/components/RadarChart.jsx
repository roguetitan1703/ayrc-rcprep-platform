import { useMemo } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/ui/Card'
import { ResponsiveRadar } from '@nivo/radar'

export function RadarChart({ data }) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      skill: item.dimension,
      'Your Accuracy': item.value,
      'Target': 80,
      questions: item.totalQuestions
    }))
  }, [data])

  return (
    <Card className="bg-white border border-border-soft hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-6 border-b border-border-soft">
        <h3 className="text-lg font-semibold text-text-primary">Skill Assessment</h3>
        <p className="text-sm text-text-secondary mt-1">
          Your accuracy vs 80% target across question types
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div style={{ height: '450px' }}>
          <ResponsiveRadar
            data={chartData}
            keys={['Your Accuracy', 'Target']}
            indexBy="skill"
            maxValue={100}
            margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
            curve="linearClosed"
            borderWidth={2}
            borderColor={{ from: 'color' }}
            gridLevels={5}
            gridShape="circular"
            gridLabelOffset={20}
            enableDots={true}
            dotSize={8}
            dotColor={{ theme: 'background' }}
            dotBorderWidth={2}
            dotBorderColor={{ from: 'color' }}
            enableDotLabel={false}
            colors={['#D33F49', '#3B82F6']}
            fillOpacity={0.25}
            blendMode="multiply"
            animate={true}
            motionConfig="gentle"
            isInteractive={true}
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
                }
              },
              grid: {
                line: {
                  stroke: '#D8DEE9',
                  strokeWidth: 1
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
                anchor: 'top-left',
                direction: 'column',
                translateX: -50,
                translateY: -40,
                itemWidth: 80,
                itemHeight: 20,
                itemTextColor: '#273043',
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#D33F49'
                    }
                  }
                ]
              }
            ]}
          />
        </div>

        {/* Accessibility: Data Table */}
        <div className="sr-only">
          <table>
            <caption>Question Type Performance</caption>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Your Accuracy</th>
                <th>Target</th>
                <th>Questions</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map(row => (
                <tr key={row.skill}>
                  <td>{row.skill}</td>
                  <td>{row['Your Accuracy']}%</td>
                  <td>{row['Target']}%</td>
                  <td>{row.questions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
