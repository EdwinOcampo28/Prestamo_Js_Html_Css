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

  /* =========================
     TITULO
  ========================= */
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Simulación de Préstamo", margenX, y);
  y += 12;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  if (totalPagadoEl)
    doc.text("Total pagado: " + totalPagadoEl.innerText, margenX, y);

  y += 6;

  if (saldoPendienteEl)
    doc.text("Saldo pendiente: " + saldoPendienteEl.innerText, margenX, y);

  y += 12;

  /* =========================
     TABLA
  ========================= */
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Tabla de amortización", margenX, y);
  y += 8;

  const headers = ["#", "Fecha", "Cuota", "Interés", "Capital", "Saldo", "Estado"];

  // 🔥 posiciones mejor distribuidas (sin desbordes)
  const posiciones = [15, 28, 55, 80, 105, 135, 165];

  doc.setFontSize(10);
  headers.forEach((header, i) => {
    doc.text(header, posiciones[i], y);
  });

  y += 5;

  doc.setFont("helvetica", "normal");

  const filas = tabla.querySelectorAll("tr");

  filas.forEach((fila) => {

    const columnas = fila.querySelectorAll("td");

    columnas.forEach((col, i) => {
      if (i < 7) {

        let texto = col.innerText.toString();

        // 🔥 limitar texto sin cortar números importantes
        if (texto.length > 18) {
          texto = texto.substring(0, 18) + "...";
        }

        doc.text(texto, posiciones[i], y);
      }
    });

    y += 5;

    // 🔥 salto de página mejor controlado
    if (y > 270) {
      doc.addPage();
      y = 20;

      // repetir encabezado
      doc.setFont("helvetica", "bold");
      headers.forEach((header, i) => {
        doc.text(header, posiciones[i], y);
      });
      doc.setFont("helvetica", "normal");
      y += 6;
    }
  });

  /* =========================
     HISTORIAL (PRO)
  ========================= */
  y += 10;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Historial de abonos", margenX, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  if (historialAbonos.length === 0) {
    doc.text("No hay abonos registrados", margenX, y);
  } else {

    historialAbonos.forEach(a => {

      let texto = `$${dinero(a.valor)} | ${a.tipo === "plazo" ? "Plazo" : "Cuota"}`;

      if (a.ahorro !== undefined) {
        texto += ` | Ahorro: $${dinero(a.ahorro)}`;
      }

      texto += ` | ${a.fecha}`;

      doc.text(texto, margenX, y);
      y += 5;

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