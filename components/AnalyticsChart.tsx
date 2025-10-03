'use client'

import { DomainAnalytics } from '@/types/domain'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AnalyticsChartProps {
  data: DomainAnalytics[]
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  // Transform data for the chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    pageViews: item.pageViews,
    uniqueVisitors: item.uniqueVisitors,
    offersReceived: item.offersReceived,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, item) => sum + item.pageViews, 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Page Views</div>
        </div>
        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {data.reduce((sum, item) => sum + item.uniqueVisitors, 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Unique Visitors</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {data.reduce((sum, item) => sum + item.offersReceived, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Offers Received</div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="pageViews" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Page Views"
            />
            <Line 
              type="monotone" 
              dataKey="uniqueVisitors" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Unique Visitors"
            />
            <Line 
              type="monotone" 
              dataKey="offersReceived" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Offers Received"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

