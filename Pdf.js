"use strict";

// Generar PDF de la simulación de préstamo
function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // 📌 Configuración inicial
  const margenX = 20;
  let y = 20;

  doc.setFontSize(18);
  doc.text("Simulación de Préstamo", margenX, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Total pagado: " + document.getElementById("totalPagado").innerText, margenX, y);
  y += 8;
  doc.text("Saldo pendiente: " + document.getElementById("saldoPendiente").innerText, margenX, y);
  y += 12;

  doc.setFontSize(14);
  doc.text("Tabla de amortización", margenX, y);
  y += 8;

  // 📄 Encabezados de tabla
  const headers = ["#", "Fecha", "Cuota", "Interés", "Capital", "Saldo", "Estado"];
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(headers.join("   "), margenX, y);
  doc.setFont("helvetica", "normal");
  y += 6;

  // 📌 Recorrer filas de la tabla
  const filas = document.querySelectorAll("#tabla tr");
  filas.forEach((fila) => {
    const columnas = fila.querySelectorAll("td");
    const textoFila = Array.from(columnas)
      .slice(0, 7) // Solo las columnas visibles
      .map((col) => col.innerText)
      .join("   ");

    doc.text(textoFila, margenX, y);
    y += 6;

    // Salto de página automático
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  // 📌 Guardar PDF con nombre dinámico
  doc.save("Simulacion_Prestamo.pdf");
}