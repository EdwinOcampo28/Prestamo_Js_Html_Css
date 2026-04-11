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

  const totalPagadoEl = document.getElementById("totalPagado");
  const saldoPendienteEl = document.getElementById("saldoPendiente");
  const tabla = document.getElementById("tabla");

  if (!tabla || tabla.children.length === 0) {
    alert("Primero calcula el préstamo o aplica un abono.");
    return;
  }

  /* =========================
     TITULO
  ========================= */
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

  /* =========================
     TABLA
  ========================= */
  doc.setFontSize(14);
  doc.text("Tabla de amortización", margenX, y);
  y += 10;

  const headers = ["#", "Fecha", "Cuota", "Interés", "Capital", "Saldo", "Estado"];
  const posiciones = [20, 30, 60, 85, 110, 140, 170];

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
        let texto = col.innerText.toString().substring(0, 15);
        doc.text(texto, posiciones[i], y);
      }
    });

    y += 6;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  /* =========================
     HISTORIAL (MEJORADO)
  ========================= */
  y += 10;

  doc.setFontSize(14);
  doc.text("Historial de abonos", margenX, y);
  y += 8;

  doc.setFontSize(10);

  if (historialAbonos.length === 0) {
    doc.text("No hay abonos registrados", margenX, y);
  } else {

    historialAbonos.forEach(a => {

      let texto = `$${dinero(a.valor)} | ${a.tipo === "plazo" ? "Plazo" : "Cuota"}`;

      // ✅ NUEVO: mostrar ahorro
      if (a.ahorro !== undefined) {
        texto += ` | Ahorro: $${dinero(a.ahorro)}`;
      }

      texto += ` | ${a.fecha}`;

      doc.text(texto, margenX, y);
      y += 6;

      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
  }

  /* =========================
     GUARDAR
  ========================= */
  doc.save("Simulacion_Prestamo.pdf");
}