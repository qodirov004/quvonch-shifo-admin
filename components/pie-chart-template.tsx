"use client"

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DataItem {
  name: string
  value: number
  fill: string
}

interface PieChartTemplateProps {
  title: string
  description: string
  data: DataItem[]
}

export default function PieChartTemplate({ title, description, data }: PieChartTemplateProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={data.reduce(
            (acc, item, index) => {
              acc[item.name] = {
                label: item.name,
                color: item.fill,
              }
              return acc
            },
            {} as Record<string, { label: string; color: string }>,
          )}
          className="h-[450px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip 
                content={<ChartTooltipContent 
                  className="text-lg font-medium"
                  formatter={(value, name) => {
                    return [`${name} `, `: ${value} ta`]
                  }}
                />} 
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} - ${value}`}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
