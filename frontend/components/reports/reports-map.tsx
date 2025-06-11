"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react"

const mapData = [
  {
    id: "1",
    region: "San José Centro",
    coverage: 89,
    risk: "low",
    population: 45000,
    vaccinated: 40050,
    centers: 3,
  },
  {
    id: "2",
    region: "Cartago",
    coverage: 76,
    risk: "medium",
    population: 32000,
    vaccinated: 24320,
    centers: 2,
  },
  {
    id: "3",
    region: "Heredia",
    coverage: 94,
    risk: "low",
    population: 28000,
    vaccinated: 26320,
    centers: 2,
  },
  {
    id: "4",
    region: "Alajuela",
    coverage: 65,
    risk: "high",
    population: 38000,
    vaccinated: 24700,
    centers: 2,
  },
]

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "low":
      return "bg-green-500"
    case "medium":
      return "bg-yellow-500"
    case "high":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getRiskIcon = (coverage: number) => {
  if (coverage >= 90) return <TrendingUp className="h-4 w-4 text-green-600" />
  if (coverage >= 75) return <Minus className="h-4 w-4 text-yellow-600" />
  return <TrendingDown className="h-4 w-4 text-red-600" />
}

export function ReportsMap() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Cobertura por Región
          </CardTitle>
          <CardDescription>
            Visualización geográfica de la cobertura de vacunación con semáforos de riesgo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Simulated Map Area */}
          <div className="relative bg-gray-100 rounded-lg h-96 mb-6 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Mapa Interactivo</p>
              <p className="text-sm text-gray-400">Integración con React Leaflet</p>
            </div>

            {/* Simulated Map Markers */}
            <div className="absolute top-20 left-32">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute top-40 right-40">
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-32 left-20">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-20 right-32">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Riesgo Bajo (≥90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Riesgo Medio (75-89%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Riesgo Alto (&lt;75%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Data */}
      <Card>
        <CardHeader>
          <CardTitle>Datos por Región</CardTitle>
          <CardDescription>Estadísticas detalladas de cobertura por zona geográfica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {mapData.map((region) => (
              <div key={region.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(region.risk)}`}></div>
                    {region.region}
                  </h4>
                  <div className="flex items-center gap-2">
                    {getRiskIcon(region.coverage)}
                    <span className="font-bold">{region.coverage}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Población</p>
                    <p className="font-medium">{region.population.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vacunados</p>
                    <p className="font-medium">{region.vaccinated.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Centros</p>
                    <p className="font-medium">{region.centers}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getRiskColor(region.risk)}`}
                    style={{ width: `${region.coverage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
