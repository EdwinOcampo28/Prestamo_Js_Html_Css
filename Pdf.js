"use strict";

function generarPDF() {

  if (!window.jspdf) {
    alert("La librería jsPDF no está cargada.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 18;
  const margin = 14;

  const totalPagadoEl = document.getElementById("totalPagado");
  const saldoPendienteEl = document.getElementById("saldoPendiente");
  const tabla = document.getElementById("tabla");

  if (!tabla || tabla.children.length === 0) {
    alert("Primero calcula el préstamo o aplica un abono.");
    return;
  }

  // 🎨 PALETA
  const card = [30, 41, 59];
  const cardAlt = [24, 33, 50]; // alterno
  const header = [37, 99, 235];
  const headerRow = [59, 130, 246];

  const white = [255, 255, 255];
  const muted = [200, 210, 220];

  const green = [34, 197, 94];
  const red = [239, 68, 68];
  const yellow = [250, 204, 21];

  const box = (x, y, w, h, color) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, w, h, 2, 2, "F");
  };

  const text = (t, x, y, color = white, size = 10, bold = false, align = "left") => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    doc.text(String(t), x, y, { align });
  };

  // 🔹 CARDS
  box(10, y, 92, 18, card);
  box(108, y, 92, 18, card);

  text("Total Pagado", 14, y + 7, muted, 8);
  text(totalPagadoEl?.innerText || "$0", 14, y + 14, green, 11, true);

  text("Saldo Pendiente", 112, y + 7, muted, 8);
  text(saldoPendienteEl?.innerText || "$0", 112, y + 14, red, 11, true);

  y += 26;

  // 🔹 TÍTULO TABLA
  box(10, y - 6, 190, 10, header);
  text("TABLA DE AMORTIZACIÓN", margin, y + 3, white, 11, true);

  y += 12;

  const headers = ["#", "Fecha", "Cuota", "Interés", "Capital", "Saldo", "Estado"];
  const pos = [12, 32, 75, 105, 130, 155, 180];

  // 🔹 ENCABEZADO
  box(10, y - 5, 190, 8, headerRow);

  headers.forEach((h, i) => {
    text(h, pos[i], y, white, 9, true);
  });

  y += 7;

  const filas = tabla.querySelectorAll("tr");

  filas.forEach((fila, index) => {

    const cols = fila.querySelectorAll("td");
    if (!cols.length) return;

    // 🔹 EFECTO CEBRA
    const bgColor = index % 2 === 0 ? card : cardAlt;
    box(10, y - 4, 190, 7, bgColor);

    for (let i = 0; i < Math.min(7, cols.length); i++) {

      let txt = (cols[i].innerText || "").toString();

      // 🔹 FORMATO MONEDA MÁS ALINEADO
      if (i >= 2 && i <= 5) {
        text(txt, pos[i], y, white, 8, false, "right");
      } else {
        text(txt, pos[i], y, white, 8);
      }

      // 🔹 BADGE ESTADO
      if (i === 6) {
        let color = yellow;
        if (txt.includes("Pagado")) color = green;
        else if (txt.includes("Vencida")) color = red;

        box(pos[i] - 6, y - 5, 20, 6, color);
        text(txt, pos[i] + 4, y - 1, [0,0,0], 7, true, "center");
      }
    }

    y += 7;

    if (y > 265) {
      doc.addPage();
      y = 20;
    }
  });

  y += 4;
// 🔹 HISTORIAL HORIZONTAL PERO LEGIBLE

box(10, y, 190, 10, header);
text("HISTORIAL DE ABONOS", margin, y + 7, white, 11, true);

y += 14;

const safeHistorial = Array.isArray(historialAbonos) ? historialAbonos : [];

if (!safeHistorial.length) {
  text("No hay abonos registrados", margin, y, muted, 10);
} else {

  safeHistorial.forEach((a, index) => {

    const bgColor = index % 2 === 0 ? card : cardAlt;

    // 🔹 TARJETA MÁS ALTA (CLAVE)
    box(10, y - 4, 190, 14, bgColor);

    const tipo =
      a.tipo === "plazo"
        ? "Plazo"
        : a.tipo === "liquidacion_total" || a.tipo === "liquidación total"
          ? "Liquidación"
          : "Cuota";

    // 🔥 FILA PRINCIPAL (BIEN DISTRIBUIDA)
    text(`$${dinero(a.valor)}`, 14, y + 2, green, 10, true);         // izquierda
    text(tipo, 105, y + 2, white, 9, true, "center");               // centro
    text(a.fecha || "", 190, y + 2, muted, 8, false, "right");      // derecha

    // 🔹 SEGUNDA LÍNEA (INFO EXTRA)
    if (a.ahorro) {
      text(`Ahorro: $${dinero(a.ahorro)}`, 14, y + 8, yellow, 9);
    }

    // 🔹 LÍNEA DIVISORIA SUAVE
    doc.setDrawColor(60, 70, 100);
    doc.line(12, y + 10, 198, y + 10);

    // 🔹 ESPACIADO REAL
    y += 16;

    if (y > 265) {
      doc.addPage();
      y = 20;
    }
  });
}

  doc.save("Simulacion_Prestamo.pdf");
}