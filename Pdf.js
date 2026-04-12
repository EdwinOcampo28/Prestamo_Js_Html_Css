"use strict";

// Generar PDF de la simulación de préstamo
function generarPDF() {

  if (!window.jspdf) {
    alert("La librería jsPDF no está cargada.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const margenX = 15;
  let y = 20;

  const totalPagadoEl = document.getElementById("totalPagado");
  const saldoPendienteEl = document.getElementById("saldoPendiente");
  const tabla = document.getElementById("tabla");

  if (!tabla || tabla.children.length === 0) {
    alert("Primero calcula el préstamo o aplica un abono.");
    return;
  }

  /* TITULO */
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Simulación de Préstamo", margenX, y);
  y += 12;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  if (totalPagadoEl) {
    doc.text("Total pagado: " + totalPagadoEl.innerText, margenX, y);
    y += 6;
  }

  if (saldoPendienteEl) {
    doc.text("Saldo pendiente: " + saldoPendienteEl.innerText, margenX, y);
    y += 10;
  } else {
    y += 6;
  }

  /* TABLA */
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Tabla de amortización", margenX, y);
  y += 8;

  const headers = ["#", "Fecha", "Cuota", "Interés", "Capital", "Saldo", "Estado"];
  const positions = [15, 32, 60, 90, 120, 150, 175];

  doc.setFontSize(10);

  const drawHeader = () => {
    doc.setFont("helvetica", "bold");
    headers.forEach((h, i) => doc.text(h, positions[i], y));
    doc.setFont("helvetica", "normal");
  };

  drawHeader();
  y += 6;

  const filas = tabla.querySelectorAll("tr");

  filas.forEach((fila) => {

    const cols = fila.querySelectorAll("td");
    if (!cols.length) return;

    for (let i = 0; i < Math.min(7, cols.length); i++) {

      let texto = (cols[i].innerText || "").toString();

      if (texto.length > 20) {
        texto = texto.slice(0, 20) + "...";
      }

      doc.text(texto, positions[i], y);
    }

    y += 5;

    if (y > 275) {
      doc.addPage();
      y = 20;
      drawHeader();
      y += 6;
    }
  });

  /* HISTORIAL */
  y += 10;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Historial de abonos", margenX, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const safeHistorial = Array.isArray(historialAbonos) ? historialAbonos : [];

  if (safeHistorial.length === 0) {
    doc.text("No hay abonos registrados", margenX, y);
  } else {

    for (const a of safeHistorial) {

      let tipo =
        a.tipo === "plazo"
          ? "Plazo"
          : a.tipo === "liquidación total"
            ? "Liquidación total"
            : "Cuota";

      let texto = `$${dinero(a.valor)} | ${tipo}`;

      if (a.ahorro != null) {
        texto += ` | Ahorro: $${dinero(a.ahorro)}`;
      }

      texto += ` | ${a.fecha || ""}`;

      doc.text(texto, margenX, y);
      y += 5;

      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    }
  }

  doc.save("Simulacion_Prestamo.pdf");
}