"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReportsCharts } from "@/components/reports/reports-charts"
import { ReportsMap } from "@/components/reports/reports-map"
import { ReportsTable } from "@/components/reports/reports-table"
import { Download, Filter, BarChart3, Map, Table } from "lucide-react"

export default function ReportsPage() {
  const [activeView, setActiveView] = useState("charts")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [selectedCenter, setSelectedCenter] = useState("all")
  const [selectedVaccine, setSelectedVaccine] = useState("all")

  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Reportes" }]

  const exportReport = (format: string) => {
    console.log(`Exporting report in ${format} format`)
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reportes y Estadísticas</h1>
            <p className="text-muted-foreground">Análisis detallado de la cobertura de vacunación</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport("excel")}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => exportReport("pdf")}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Reporte
            </CardTitle>
            <CardDescription>Configure los parámetros para generar el reporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Fecha Desde</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Fecha Hasta</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="center">Centro</Label>
                <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los centros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los centros</SelectItem>
                    <SelectItem value="centro-norte">Centro Norte</SelectItem>
                    <SelectItem value="centro-sur">Centro Sur</SelectItem>
                    <SelectItem value="centro-este">Centro Este</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vaccine">Vacuna</Label>
                <Select value={selectedVaccine} onValueChange={setSelectedVaccine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las vacunas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las vacunas</SelectItem>
                    <SelectItem value="covid19">COVID-19</SelectItem>
                    <SelectItem value="influenza">Influenza</SelectItem>
                    <SelectItem value="hepatitis">Hepatitis B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button variant={activeView === "charts" ? "default" : "outline"} onClick={() => setActiveView("charts")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Gráficos
          </Button>
          <Button variant={activeView === "map" ? "default" : "outline"} onClick={() => setActiveView("map")}>
            <Map className="mr-2 h-4 w-4" />
            Mapa
          </Button>
          <Button variant={activeView === "table" ? "default" : "outline"} onClick={() => setActiveView("table")}>
            <Table className="mr-2 h-4 w-4" />
            Tabla
          </Button>
        </div>

        {/* Content */}
        {activeView === "charts" && <ReportsCharts />}
        {activeView === "map" && <ReportsMap />}
        {activeView === "table" && <ReportsTable />}
      </div>
    </DashboardLayout>
  )
}
