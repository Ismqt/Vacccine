"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

const coverageData = [
  { name: "Centro Norte", cobertura: 89, meta: 90 },
  { name: "Centro Sur", cobertura: 76, meta: 90 },
  { name: "Centro Este", cobertura: 94, meta: 90 },
  { name: "Centro Oeste", cobertura: 82, meta: 90 },
]

const vaccineData = [
  { name: "COVID-19", value: 45, color: "#0088FE" },
  { name: "Influenza", value: 30, color: "#00C49F" },
  { name: "Hepatitis B", value: 15, color: "#FFBB28" },
  { name: "Tétanos", value: 10, color: "#FF8042" },
]

const monthlyData = [
  { mes: "Ene", vacunaciones: 120 },
  { mes: "Feb", vacunaciones: 150 },
  { mes: "Mar", vacunaciones: 180 },
  { mes: "Abr", vacunaciones: 165 },
  { mes: "May", vacunaciones: 200 },
  { mes: "Jun", vacunaciones: 190 },
]

export function ReportsCharts() {
  return (
    <div className="space-y-6">
      {/* Coverage by Center */}
      <Card>
        <CardHeader>
          <CardTitle>Cobertura por Centro de Vacunación</CardTitle>
          <CardDescription>Porcentaje de cobertura vs meta establecida</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coverageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cobertura" fill="#3b82f6" name="Cobertura Actual" />
              <Bar dataKey="meta" fill="#e5e7eb" name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Vaccine Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo de Vacuna</CardTitle>
            <CardDescription>Porcentaje de vacunas aplicadas por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vaccineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vaccineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
            <CardDescription>Vacunaciones aplicadas por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="vacunaciones" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
