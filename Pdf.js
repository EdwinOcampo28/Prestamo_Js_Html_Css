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

  const bg = [10, 12, 20];
  const card = [22, 28, 45];
  const header = [15, 20, 35];

  const white = [240, 240, 240];
  const muted = [180, 180, 180];

  const accent = [56, 189, 248];
  const green = [34, 197, 94];
  const red = [239, 68, 68];
  const yellow = [234, 179, 8];

  const box = (x, y, w, h, color) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, w, h, 2, 2, "F");
  };

  const text = (t, x, y, color = white, size = 10, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    doc.text(String(t), x, y);
  };

  box(10, 8, 190, 18, header);
  text("SIMULACIÓN DE PRÉSTAMO", margin, 20, accent, 14, true);

  y = 32;

  box(10, y, 92, 26, card);
  box(108, y, 92, 26, card);

  text("Total Pagado", 14, y + 9, muted, 9);
  text(totalPagadoEl?.innerText || "$0", 14, y + 19, white, 12, true);

  text("Saldo Pendiente", 112, y + 9, muted, 9);
  text(saldoPendienteEl?.innerText || "$0", 112, y + 19, white, 12, true);

  y += 36;

  box(10, y - 6, 190, 10, header);

  const headers = ["#", "Fecha", "Cuota", "Interés", "Capital", "Saldo", "Estado"];
  const pos = [12, 32, 65, 92, 118, 145, 172];

  text("TABLA DE AMORTIZACIÓN", margin, y + 3, accent, 11, true);
  y += 10;

  headers.forEach((h, i) => {
    text(h, pos[i], y, white, 9, true);
  });

  y += 6;

  const filas = tabla.querySelectorAll("tr");

  filas.forEach((fila) => {

    const cols = fila.querySelectorAll("td");
    if (!cols.length) return;

    box(10, y - 4, 190, 7, card);

    for (let i = 0; i < Math.min(7, cols.length); i++) {

      let txt = (cols[i].innerText || "").toString();
      if (txt.length > 18) txt = txt.slice(0, 18) + "...";

      let color = white;

      if (i === 6) {
        if (txt.includes("Pagado")) color = green;
        else if (txt.includes("Vencida")) color = red;
        else color = yellow;
      }

      text(txt, pos[i], y, color, 8);
    }

    y += 7;

    if (y > 265) {
      doc.addPage();
      y = 20;
    }
  });

  y += 10;

  box(10, y, 190, 10, header);
  text("HISTORIAL DE ABONOS", margin, y + 7, accent, 11, true);

  y += 16;

  const safeHistorial = Array.isArray(historialAbonos) ? historialAbonos : [];

  if (!safeHistorial.length) {
    text("No hay abonos registrados", margin, y, muted, 10);
  } else {

    safeHistorial.forEach((a) => {

      box(10, y - 4, 190, 10, card);

      const tipo =
        a.tipo === "plazo"
          ? "Plazo"
          : a.tipo === "liquidacion_total" || a.tipo === "liquidación total"
            ? "Liquidacion"
            : "Cuota";

      const linea =
        `$${dinero(a.valor)} | ${tipo}` +
        (a.ahorro ? ` | ahorro: $${dinero(a.ahorro)}` : "") +
        ` | ${a.fecha || ""}`;

      text(linea, margin, y + 3, white, 9);

      y += 10;

      if (y > 265) {
        doc.addPage();
        y = 20;
      }
    });
  }

  doc.save("Simulacion_Prestamo.pdf");
}
