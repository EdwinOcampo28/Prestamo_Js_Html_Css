"use strict";

/**
 * Exporta un informe de préstamo en PDF, con resumen, cronograma paginado,
 * historial de abonos y numeración de páginas. Mantiene la exportación local.
 */
function generarPDF() {
  if (!window.jspdf || typeof window.jspdf.jsPDF !== "function") {
    alert("No se pudo cargar la librería PDF. Comprueba tu conexión y vuelve a intentarlo.");
    return;
  }

  const tabla = document.getElementById("tabla");
  const filas = tabla ? Array.from(tabla.querySelectorAll("tr")).filter((tr) => tr.querySelectorAll("td").length) : [];
  if (!filas.length) {
    alert("Primero calcula o abre un préstamo para generar su informe PDF.");
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 12;
    const contentW = W - M * 2;
    // Paleta oscura coherente con la interfaz del simulador.
    const C = {
      page: [11, 17, 29],
      navy: [8, 13, 24],
      navy2: [25, 37, 57],
      blue: [82, 155, 255],
      pale: [27, 41, 61],
      paleAlt: [20, 31, 48],
      border: [53, 69, 91],
      ink: [231, 238, 248],
      muted: [159, 174, 195],
      white: [24, 36, 54],
      green: [89, 220, 158],
      greenPale: [22, 62, 53],
      red: [255, 125, 132],
      redPale: [67, 34, 45],
      amber: [255, 197, 92],
      amberPale: [65, 52, 32]
    };

    const getText = (id, fallback = "—") => {
      const el = document.getElementById(id);
      const value = el ? String(el.innerText || el.textContent || "").trim() : "";
      return value || fallback;
    };
    const money = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n.toLocaleString("es-CO", { maximumFractionDigits: 0 }) : "0";
    };
    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim() || "—";
    const setFont = (size = 8, style = "normal", color = C.ink) => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(...color);
    };
    const roundedBox = (x, y, w, h, fill, stroke = fill, radius = 2) => {
      doc.setFillColor(...fill);
      doc.setDrawColor(...stroke);
      doc.roundedRect(x, y, w, h, radius, radius, "FD");
    };
    const line = (x1, y1, x2, y2, color = C.border) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(0.25);
      doc.line(x1, y1, x2, y2);
    };
    const dateNow = new Date();
    const generatedAt = dateNow.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
    const clienteSelect = document.getElementById("clienteActual");
    const cliente = clienteSelect && clienteSelect.selectedIndex >= 0
      ? clean(clienteSelect.options[clienteSelect.selectedIndex]?.textContent)
      : "Sin cliente asociado";
    const prestamoSelect = document.getElementById("prestamoActual");
    const prestamo = prestamoSelect && prestamoSelect.selectedIndex >= 0
      ? clean(prestamoSelect.options[prestamoSelect.selectedIndex]?.textContent)
      : "Préstamo actual";
    const monto = getText("monto", "0");
    const tasa = document.getElementById("interes")?.value;
    const numeroCuotas = document.getElementById("cuotas")?.value;
    const diaPago = document.getElementById("diaPago")?.value;

    let pageContentStart = 0;
    let sectionName = "Resumen y cronograma";

    function drawHeader(title = "INFORME DEL PRÉSTAMO") {
      doc.setFillColor(...C.page);
      doc.rect(0, 0, W, H, "F");
      doc.setFillColor(...C.navy);
      doc.rect(0, 0, W, 27, "F");
      doc.setFillColor(...C.blue);
      doc.rect(0, 25, W, 2, "F");
      setFont(15, "bold", C.white);
      doc.text("CONTROL FINANCIERO", M, 11);
      setFont(8, "normal", [204, 218, 237]);
      doc.text("SIMULADOR DE PRÉSTAMOS · INFORME LOCAL", M, 17);
      setFont(10, "bold", C.white);
      doc.text(title, W - M, 12, { align: "right" });
      setFont(7.5, "normal", [204, 218, 237]);
      doc.text(`Generado: ${generatedAt}`, W - M, 19, { align: "right" });
      pageContentStart = 33;
    }

    function drawFooter() {
      const pages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= pages; p++) {
        doc.setPage(p);
        line(M, H - 10, W - M, H - 10);
        setFont(7, "normal", C.muted);
        doc.text("Documento generado por el Simulador de Préstamos. Verifique los valores antes de utilizarlos como comprobante de pago.", M, H - 5.5);
        doc.text(`Página ${p} de ${pages}`, W - M, H - 5.5, { align: "right" });
      }
    }

    function newPage(title) {
      doc.addPage();
      drawHeader(title);
      y = pageContentStart;
    }

    function sectionTitle(label, yPos) {
      roundedBox(M, yPos, contentW, 8, C.pale, C.border, 1.5);
      setFont(9, "bold", C.ink);
      doc.text(label, M + 3, yPos + 5.2);
    }

    function summaryCard(x, yPos, w, label, value, accent = C.blue) {
      roundedBox(x, yPos, w, 19, C.white, C.border, 2);
      doc.setFillColor(...accent);
      doc.roundedRect(x, yPos, 1.7, 19, 0.8, 0.8, "F");
      setFont(7, "normal", C.muted);
      doc.text(label, x + 4, yPos + 6);
      setFont(11, "bold", accent);
      const valLines = doc.splitTextToSize(clean(value), w - 8);
      doc.text(valLines.slice(0, 2), x + 4, yPos + 13);
    }

    drawHeader();
    let y = pageContentStart;
    sectionTitle("DATOS DE LA OPERACIÓN", y);
    y += 12;

    const meta = [
      ["Cliente", cliente],
      ["Préstamo", prestamo],
      ["Capital inicial", `$${clean(monto)}`],
      ["Tasa anual", tasa !== undefined && tasa !== "" ? `${tasa}%` : "—"],
      ["Número de cuotas", numeroCuotas || "—"],
      ["Día de pago", diaPago || "—"]
    ];
    const metaGap = 3;
    const metaW = (contentW - metaGap * 5) / 6;
    meta.forEach((item, i) => {
      const x = M + i * (metaW + metaGap);
      roundedBox(x, y, metaW, 17, C.paleAlt, C.border, 1.5);
      setFont(6.8, "normal", C.muted);
      doc.text(item[0], x + 2.5, y + 5);
      setFont(7.6, "bold", C.ink);
      const wrapped = doc.splitTextToSize(clean(item[1]), metaW - 5).slice(0, 2);
      doc.text(wrapped, x + 2.5, y + 10.5);
    });
    y += 22;

    sectionTitle("RESUMEN FINANCIERO", y);
    y += 11;
    const cardGap = 3;
    const cardW = (contentW - cardGap * 5) / 6;
    const cards = [
      ["Capital pagado", getText("capitalPagado", "$0"), C.green],
      ["Intereses pagados", getText("interesPagado", "$0"), C.blue],
      ["Total pagado", getText("totalPagado", "$0"), C.green],
      ["Saldo pendiente", getText("saldoPendiente", "$0"), C.red],
      ["Intereses ahorrados", getText("interesAhorrado", "$0"), C.amber],
      ["Avance del préstamo", getText("progresoPrestamo", "0%"), C.blue]
    ];
    cards.forEach((card, i) => summaryCard(M + i * (cardW + cardGap), y, cardW, card[0], card[1], card[2]));
    y += 24;

    sectionTitle("CRONOGRAMA DE AMORTIZACIÓN", y);
    y += 11;

    const headers = ["CUOTA", "FECHA DE PAGO", "VALOR CUOTA", "INTERÉS", "CAPITAL", "SALDO PENDIENTE", "ESTADO", "CONFIRMACIÓN"];
    // Columnas equilibradas: importes alineados a la derecha y espacio suficiente
    // para la fecha y el estado, sin dejar una columna final desproporcionada.
    const widths = [12, 27, 36, 33, 33, 43, 33, contentW - (12 + 27 + 36 + 33 + 33 + 43 + 33)];
    const xs = [];
    let xCursor = M;
    widths.forEach((w) => { xs.push(xCursor); xCursor += w; });
    const rowH = 8;

    function drawTableHeader() {
      doc.setFillColor(...C.navy2);
      doc.roundedRect(M, y, contentW, 8, 1, 1, "F");
      headers.forEach((h, i) => {
        setFont(7, "bold", C.white);
        const centered = i === 0 || i === 1;
        doc.text(h, xs[i] + (centered ? widths[i] / 2 : 2), y + 5.2, centered ? { align: "center" } : undefined);
      });
      y += 8;
    }

    drawTableHeader();
    filas.forEach((fila, index) => {
      const cells = Array.from(fila.querySelectorAll("td")).slice(0, headers.length).map((td) => clean(td.innerText || td.textContent));
      while (cells.length < headers.length) cells.push("—");
      const estado = cells[6].toLowerCase();
      const rowFill = index % 2 === 0 ? C.white : C.paleAlt;
      if (y + rowH > H - 14) {
        newPage("CRONOGRAMA DE AMORTIZACIÓN · CONTINUACIÓN");
        drawTableHeader();
      }
      doc.setFillColor(...rowFill);
      doc.rect(M, y, contentW, rowH, "F");
      line(M, y + rowH, W - M, y + rowH, C.border);
      cells.forEach((value, i) => {
        let color = C.ink;
        let style = "normal";
        if (i === 6) {
          if (estado.includes("pagad")) color = C.green;
          else if (estado.includes("vencid")) color = C.red;
          else if (estado.includes("cancel")) color = C.muted;
          else color = C.amber;
          style = "bold";
        }
        const maxW = widths[i] - 4;
        setFont(i === 0 ? 7 : 6.8, style, color);
        const lines = doc.splitTextToSize(value, maxW);
        const shown = lines[0] || "—";
        const alignRight = i >= 2 && i <= 5;
        const centered = i === 0 || i === 1;
        const tx = alignRight ? xs[i] + widths[i] - 2 : (centered ? xs[i] + widths[i] / 2 : xs[i] + 2);
        doc.text(shown, tx, y + 5.1, { align: alignRight ? "right" : (centered ? "center" : "left"), maxWidth: maxW });
      });
      y += rowH;
    });

    y += 7;
    if (y + 12 > H - 14) newPage("HISTORIAL DE ABONOS");
    sectionTitle("HISTORIAL DE ABONOS EXTRAORDINARIOS", y);
    y += 11;

    const historial = typeof historialAbonos !== "undefined" && Array.isArray(historialAbonos) ? historialAbonos : [];
    if (!historial.length) {
      setFont(8, "normal", C.muted);
      doc.text("No hay abonos extraordinarios registrados en este préstamo.", M + 1, y + 3);
      y += 9;
    } else {
      const hHeaders = ["Fecha", "Valor abonado", "Modalidad", "Ahorro de intereses"];
      const hWidths = [55, 55, 70, contentW - 180];
      let hx = M;
      const hXs = hWidths.map((w) => { const old = hx; hx += w; return old; });
      doc.setFillColor(...C.navy2);
      doc.roundedRect(M, y, contentW, 7.5, 1, 1, "F");
      hHeaders.forEach((label, i) => {
        setFont(7, "bold", C.ink);
        doc.text(label, hXs[i] + 2, y + 4.7);
      });
      y += 7.5;
      historial.forEach((item, i) => {
        if (y + 7.5 > H - 14) {
          newPage("HISTORIAL DE ABONOS · CONTINUACIÓN");
          doc.setFillColor(...C.navy2);
          doc.roundedRect(M, y, contentW, 7.5, 1, 1, "F");
          hHeaders.forEach((label, j) => { setFont(7, "bold", C.ink); doc.text(label, hXs[j] + 2, y + 4.7); });
          y += 7.5;
        }
        doc.setFillColor(...(i % 2 === 0 ? C.white : C.paleAlt));
        doc.rect(M, y, contentW, 7.5, "F");
        const tipo = item.tipo === "plazo" ? "Reducir plazo" : item.tipo === "liquidacion_total" || item.tipo === "liquidación total" ? "Liquidación total" : "Reducir cuota";
        const values = [clean(item.fecha), `$${money(item.valor)}`, tipo, item.ahorro != null ? `$${money(item.ahorro)}` : "—"];
        values.forEach((value, j) => { setFont(7, "normal", j === 1 ? C.green : C.ink); doc.text(value, hXs[j] + 2, y + 4.7); });
        line(M, y + 7.5, W - M, y + 7.5);
        y += 7.5;
      });
    }

    // Nota informativa en el cierre del informe.
    if (y + 12 > H - 14) newPage("NOTAS DEL INFORME");
    y += 2;
    setFont(6.8, "italic", C.muted);
    const note = "Este documento es un reporte informativo generado a partir de los datos visibles del simulador. No reemplaza un contrato, recibo oficial ni certificación contable.";
    doc.text(doc.splitTextToSize(note, contentW), M, y + 3);

    drawFooter();
    const safeDate = dateNow.toISOString().slice(0, 10);
    const safeClient = cliente.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 32) || "Cliente";
    doc.save(`Informe_Prestamo_${safeClient}_${safeDate}.pdf`);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    alert("No se pudo generar el PDF. Revisa que el cronograma esté cargado y vuelve a intentarlo.");
  }
}
