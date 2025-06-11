"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const detailedData = [
  {
    id: "1",
    patient: "María González",
    cedula: "12345678",
    age: 34,
    vaccine: "COVID-19",
    dose: "2da dosis",
    date: "2024-01-15",
    center: "Centro Norte",
    status: "Completo",
  },
  {
    id: "2",
    patient: "Carlos Rodríguez",
    cedula: "87654321",
    age: 39,
    vaccine: "Influenza",
    dose: "Anual",
    date: "2024-01-10",
    center: "Centro Sur",
    status: "Completo",
  },
  {
    id: "3",
    patient: "Ana Martínez",
    cedula: "11223344",
    age: 13,
    vaccine: "Hepatitis B",
    dose: "1ra dosis",
    date: "2024-01-08",
    center: "Centro Norte",
    status: "Incompleto",
  },
  {
    id: "4",
    patient: "Luis Fernández",
    cedula: "55667788",
    age: 45,
    vaccine: "Tétanos",
    dose: "Refuerzo",
    date: "2024-01-05",
    center: "Centro Este",
    status: "Completo",
  },
]

export function ReportsTable() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reporte Detallado de Vacunaciones</CardTitle>
              <CardDescription>Lista completa de todas las vacunaciones registradas</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Tabla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Vacuna</TableHead>
                  <TableHead>Dosis</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Centro</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.patient}</TableCell>
                    <TableCell>{record.cedula}</TableCell>
                    <TableCell>{record.age} años</TableCell>
                    <TableCell>{record.vaccine}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.dose}</Badge>
                    </TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.center}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "Completo" ? "default" : "secondary"}>{record.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Esquemas Completos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {detailedData.filter((r) => r.status === "Completo").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Esquemas Incompletos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {detailedData.filter((r) => r.status === "Incompleto").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completitud</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((detailedData.filter((r) => r.status === "Completo").length / detailedData.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
