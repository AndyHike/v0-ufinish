"use client"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function AnalyticsOverviewChart({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  // If no data, show sample data
  const chartData = data.length ? data : generateSampleTimeSeriesData()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="visits" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="deviceInteractions" stroke="#82ca9d" />
        <Line type="monotone" dataKey="serviceRequests" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DeviceInteractionsChart({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  // If no data, show sample data
  const chartData = data.length ? data : generateSampleDeviceData()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="brand" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="views" fill="#8884d8" />
        <Bar dataKey="interactions" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ServicePopularityChart({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  // If no data, show sample data
  const chartData = data.length ? data : generateSampleServiceData()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function TopDevicesTable({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/5" />
          </div>
        ))}
      </div>
    )
  }

  // If no data, show sample data
  const tableData = data.length ? data : generateSampleTopDevicesData()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Device</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead className="text-right">Views</TableHead>
          <TableHead className="text-right">Interactions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableData.map((device, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{device.model}</TableCell>
            <TableCell>{device.brand}</TableCell>
            <TableCell className="text-right">{device.views}</TableCell>
            <TableCell className="text-right">{device.interactions}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function TopServicesTable({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/5" />
          </div>
        ))}
      </div>
    )
  }

  // If no data, show sample data
  const tableData = data.length ? data : generateSampleTopServicesData()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead className="text-right">Views</TableHead>
          <TableHead className="text-right">Requests</TableHead>
          <TableHead className="text-right">Conversion</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableData.map((service, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{service.name}</TableCell>
            <TableCell className="text-right">{service.views}</TableCell>
            <TableCell className="text-right">{service.requests}</TableCell>
            <TableCell className="text-right">{service.conversion}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function ConversionFunnelChart({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  // If no data, show sample data
  const chartData = data.length ? data : generateSampleFunnelData()

  return (
    <ResponsiveContainer width="100%" height={400}>
      <FunnelChart>
        <Tooltip />
        <Funnel dataKey="value" data={chartData} isAnimationActive>
          <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  )
}

// Sample data generators for preview
function generateSampleTimeSeriesData() {
  const data = []
  const now = new Date()

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      visits: Math.floor(Math.random() * 1000) + 500,
      deviceInteractions: Math.floor(Math.random() * 500) + 200,
      serviceRequests: Math.floor(Math.random() * 200) + 50,
    })
  }

  return data
}

function generateSampleDeviceData() {
  return [
    { brand: "Apple", views: 4000, interactions: 2400 },
    { brand: "Samsung", views: 3000, interactions: 1398 },
    { brand: "Xiaomi", views: 2000, interactions: 980 },
    { brand: "Huawei", views: 2780, interactions: 1908 },
    { brand: "Other", views: 1890, interactions: 800 },
  ]
}

function generateSampleServiceData() {
  return [
    { name: "Screen Repair", value: 400 },
    { name: "Battery Replacement", value: 300 },
    { name: "Water Damage", value: 200 },
    { name: "Software Issues", value: 150 },
    { name: "Other", value: 100 },
  ]
}

function generateSampleTopDevicesData() {
  return [
    { model: "iPhone 13", brand: "Apple", views: 1245, interactions: 523 },
    { model: "Galaxy S21", brand: "Samsung", views: 987, interactions: 412 },
    { model: "Redmi Note 10", brand: "Xiaomi", views: 876, interactions: 345 },
    { model: "iPhone 12", brand: "Apple", views: 765, interactions: 298 },
    { model: "P40 Pro", brand: "Huawei", views: 654, interactions: 267 },
  ]
}

function generateSampleTopServicesData() {
  return [
    { name: "Screen Replacement", views: 1245, requests: 523, conversion: 42 },
    { name: "Battery Replacement", views: 987, requests: 412, conversion: 41 },
    { name: "Water Damage Repair", views: 876, requests: 345, conversion: 39 },
    { name: "Charging Port Fix", views: 765, requests: 298, conversion: 38 },
    { name: "Software Update", views: 654, requests: 267, conversion: 40 },
  ]
}

function generateSampleFunnelData() {
  return [
    { name: "Brand Page Views", value: 5000 },
    { name: "Series Page Views", value: 3500 },
    { name: "Model Page Views", value: 2200 },
    { name: "Service Views", value: 1400 },
    { name: "Service Requests", value: 800 },
  ]
}
