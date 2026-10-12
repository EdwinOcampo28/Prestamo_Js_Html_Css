"use strict";

function renderHistorial() {
  const cont = document.getElementById("listaAbonos");
  if (!cont) return;
  cont.replaceChildren();

  if (!Array.isArray(historialAbonos) || !historialAbonos.length) {
    const empty = document.createElement("div");
    empty.className = "historial-vacio";
    empty.textContent = "📭 No hay abonos registrados";
    cont.appendChild(empty);
    return;
  }

  for (const abono of historialAbonos) {
    const item = document.createElement("article");
    item.className = "abono-item";
    item.dataset.tipo = abono.tipo === "plazo" ? "plazo" : (abono.tipo === "liquidacion_total" ? "liquidacion" : "cuota");

    const tipo = abono.tipo === "plazo"
      ? "Reducir plazo"
      : abono.tipo === "liquidacion_total" || abono.tipo === "liquidación total"
        ? "Liquidación total"
        : "Reducir cuota";

    const heading = document.createElement("div");
    const label = document.createElement("span");
    label.textContent = "ABONO · " + tipo;
    const value = document.createElement("strong");
    value.textContent = "$" + dinero(abono.valor);
    heading.append(label, value);

    const date = document.createElement("small");
    date.textContent = String(abono.fecha || "Fecha no disponible");
    const savings = document.createElement("small");
    savings.textContent = "Ahorro: $" + dinero(abono.ahorro || 0);
    item.append(heading, date, savings);
    cont.appendChild(item);
  }
}
