function renderHistorial() {
  const cont = document.getElementById("listaAbonos");
  if (!cont) return;

  cont.innerHTML = "";

  const card = (titulo, valor, color = "#fff", span = false) => `
    <div style="
      background:#0f172a;
      padding:12px;
      border-radius:14px;
      ${span ? "grid-column:1/3;" : ""}
    ">
      <div style="font-size:12px;color:#9ca3af;margin-bottom:6px;">
        ${titulo}
      </div>
      <div style="font-size:16px;font-weight:bold;color:${color};">
        ${valor}
      </div>
    </div>
  `;

  if (!historialAbonos.length) {
    cont.innerHTML = `
      <div style="
        background:#111827;
        color:#9ca3af;
        padding:18px;
        border-radius:18px;
        text-align:center;
        font-family:Arial,sans-serif;
      ">
        📭 No hay abonos registrados
      </div>
    `;
    return;
  }

  for (const a of historialAbonos) {
    const tipo =
      a.tipo === "plazo"
        ? "⏳ Reducir plazo"
        : a.tipo === "liquidacion_total" || a.tipo === "liquidación total"
        ? "🏁 Liquidación total"
        : "📉 Reducir cuota";

    cont.innerHTML += `
      <div style="
        background:linear-gradient(145deg,#111827,#1f2937);
        border:1px solid #374151;
        border-radius:18px;
        padding:16px;
        margin-bottom:14px;
        color:#fff;
        font-family:Arial,sans-serif;
        box-shadow:0 8px 18px rgba(0,0,0,.30);
      ">
        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
        ">
          ${card("Abono", "💰 $" + dinero(a.valor), "#22c55e")}
          ${card("Fecha", "📅 " + (a.fecha || ""))}
          ${card("Tipo", tipo)}
          ${card("Ahorro generado", "💵 $" + dinero(a.ahorro || 0), "#86efac")}
        </div>
      </div>
    `;
  }
}