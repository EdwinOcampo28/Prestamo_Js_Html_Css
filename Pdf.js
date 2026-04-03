"use strict";

// Generar PDF de la simulación de préstamo
function generarPDF() {

  if (!window.jspdf) {
    alert("La librería jsPDF no está cargada.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const margenX = 20;
  let y = 20;

  // 📌 Obtener elementos
  const totalPagadoEl = document.getElementById("totalPagado");
  const saldoPendienteEl = document.getElementById("saldoPendiente");
  const tabla = document.getElementById("tabla");

  if (!tabla) {
    alert("No hay datos para exportar.");
    return;
  }

  doc.setFontSize(18);
  doc.text("Simulación de Préstamo", margenX, y);
  y += 12;

  doc.setFontSize(12);

  if (totalPagadoEl)
    doc.text("Total pagado: " + totalPagadoEl.innerText, margenX, y);

  y += 8;

  if (saldoPendienteEl)
    doc.text("Saldo pendiente: " + saldoPendienteEl.innerText, margenX, y);

  y += 14;

  doc.setFontSize(14);
  doc.text("Tabla de amortización", margenX, y);
  y += 10;

  // 📄 Encabezados de tabla
  const headers = ["#", "Fecha", "Cuota", "Interés", "Capital", "Saldo", "Estado"];

  const posiciones = [20, 30, 65, 90, 120, 150, 180];

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  headers.forEach((header, i) => {
    doc.text(header, posiciones[i], y);
  });

  doc.setFont("helvetica", "normal");
  y += 6;

  const filas = tabla.querySelectorAll("tr");

  filas.forEach((fila) => {

    const columnas = fila.querySelectorAll("td");

    columnas.forEach((col, i) => {

      if (i < 7) {
        doc.text(col.innerText, posiciones[i], y);
      }

    });

    y += 6;

    // salto de página automático
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

  });

  // 📌 Guardar PDF
  doc.save("Simulacion_Prestamo.pdf");
}