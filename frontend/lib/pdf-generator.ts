"use client"

// PDF Generation utilities
export class PDFGenerator {
  // Generate Vaccination Card PDF
  static async generateVaccinationCard(patient: any, vaccinations: any[]): Promise<void> {
    // This would integrate with a PDF library like jsPDF or react-pdf
    const content = this.createVaccinationCardContent(patient, vaccinations)

    // For now, we'll create a printable HTML version
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(content)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Generate Appointment Report PDF
  static async generateAppointmentReport(appointments: any[], dateRange: { from: string; to: string }): Promise<void> {
    const content = this.createAppointmentReportContent(appointments, dateRange)

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(content)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Generate Coverage Report PDF
  static async generateCoverageReport(data: any): Promise<void> {
    const content = this.createCoverageReportContent(data)

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(content)
      printWindow.document.close()
      printWindow.print()
    }
  }

  private static createVaccinationCardContent(patient: any, vaccinations: any[]): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Carné de Vacunación - ${patient.nombreCompleto}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: white;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #3b82f6; 
            margin-bottom: 10px;
          }
          .patient-info { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px;
          }
          .patient-info h3 { 
            margin-top: 0; 
            color: #1e40af;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px;
          }
          .info-item { 
            margin-bottom: 10px;
          }
          .info-label { 
            font-weight: bold; 
            color: #374151;
          }
          .vaccinations { 
            margin-top: 30px;
          }
          .vaccination-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          .vaccination-table th, 
          .vaccination-table td { 
            border: 1px solid #d1d5db; 
            padding: 12px; 
            text-align: left;
          }
          .vaccination-table th { 
            background: #3b82f6; 
            color: white; 
            font-weight: bold;
          }
          .vaccination-table tr:nth-child(even) { 
            background: #f9fafb;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .qr-placeholder {
            width: 100px;
            height: 100px;
            border: 2px dashed #d1d5db;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px auto;
            color: #6b7280;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏥 Sistema Nacional de Vacunación</div>
          <h1>CARNÉ DIGITAL DE VACUNACIÓN</h1>
          <p>Ministerio de Salud - Costa Rica</p>
        </div>

        <div class="patient-info">
          <h3>Información del Paciente</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre Completo:</span><br>
              ${patient.nombreCompleto}
            </div>
            <div class="info-item">
              <span class="info-label">Cédula:</span><br>
              ${patient.cedula}
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Nacimiento:</span><br>
              ${new Date(patient.fechaNacimiento).toLocaleDateString()}
            </div>
            <div class="info-item">
              <span class="info-label">Género:</span><br>
              ${patient.genero === "M" ? "Masculino" : "Femenino"}
            </div>
            <div class="info-item">
              <span class="info-label">Centro Asignado:</span><br>
              ${patient.centroAsignado}
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Emisión:</span><br>
              ${new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <div class="vaccinations">
          <h3>Historial de Vacunación</h3>
          <table class="vaccination-table">
            <thead>
              <tr>
                <th>Vacuna</th>
                <th>Fabricante</th>
                <th>Lote</th>
                <th>Dosis</th>
                <th>Fecha</th>
                <th>Personal</th>
                <th>Centro</th>
              </tr>
            </thead>
            <tbody>
              ${vaccinations
                .map(
                  (v) => `
                <tr>
                  <td>${v.vaccine}</td>
                  <td>${v.manufacturer}</td>
                  <td>${v.lot}</td>
                  <td>${v.dose}</td>
                  <td>${new Date(v.date).toLocaleDateString()}</td>
                  <td>${v.staff}</td>
                  <td>${v.center}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="qr-placeholder">
          Código QR
        </div>

        <div class="footer">
          <p><strong>Documento Oficial</strong> - Este carné es válido como comprobante de vacunación</p>
          <p>Generado el ${new Date().toLocaleString()} | Sistema Nacional de Vacunación v2.0</p>
          <p>Para verificar la autenticidad, visite: www.salud.go.cr/verificar</p>
        </div>
      </body>
      </html>
    `
  }

  private static createAppointmentReportContent(appointments: any[], dateRange: { from: string; to: string }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Citas</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .date-range { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #3b82f6; color: white; }
          tr:nth-child(even) { background: #f9f9f9; }
          .summary { margin-top: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Citas de Vacunación</h1>
          <p>Sistema Nacional de Vacunación</p>
        </div>

        <div class="date-range">
          <strong>Período:</strong> ${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}
        </div>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Vacuna</th>
              <th>Centro</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${appointments
              .map(
                (apt) => `
              <tr>
                <td>${new Date(apt.date).toLocaleDateString()}</td>
                <td>${apt.time}</td>
                <td>${apt.patientName}</td>
                <td>${apt.vaccine}</td>
                <td>${apt.center}</td>
                <td>${apt.status}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="summary">
          <h3>Resumen</h3>
          <p><strong>Total de Citas:</strong> ${appointments.length}</p>
          <p><strong>Completadas:</strong> ${appointments.filter((a) => a.status === "completed").length}</p>
          <p><strong>Programadas:</strong> ${appointments.filter((a) => a.status === "scheduled").length}</p>
          <p><strong>Canceladas:</strong> ${appointments.filter((a) => a.status === "canceled").length}</p>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          Generado el ${new Date().toLocaleString()} | Sistema Nacional de Vacunación
        </div>
      </body>
      </html>
    `
  }

  private static createCoverageReportContent(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Cobertura</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 2em; font-weight: bold; color: #3b82f6; }
          .stat-label { color: #6b7280; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #3b82f6; color: white; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Cobertura de Vacunación</h1>
          <p>Sistema Nacional de Vacunación</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${data.totalPatients || 0}</div>
            <div class="stat-label">Total Pacientes</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.totalVaccinations || 0}</div>
            <div class="stat-label">Vacunaciones Aplicadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.coveragePercentage || 0}%</div>
            <div class="stat-label">Cobertura General</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.completedSchemes || 0}</div>
            <div class="stat-label">Esquemas Completos</div>
          </div>
        </div>

        <h3>Cobertura por Centro</h3>
        <table>
          <thead>
            <tr>
              <th>Centro</th>
              <th>Pacientes Registrados</th>
              <th>Vacunaciones</th>
              <th>Cobertura</th>
            </tr>
          </thead>
          <tbody>
            ${(data.centerData || [])
              .map(
                (center: any) => `
              <tr>
                <td>${center.name}</td>
                <td>${center.patients}</td>
                <td>${center.vaccinations}</td>
                <td>${center.coverage}%</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          Generado el ${new Date().toLocaleString()} | Sistema Nacional de Vacunación
        </div>
      </body>
      </html>
    `
  }
}
