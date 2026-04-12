"use strict";

let chart;

let totalPrestamo = 0;
let totalDeuda = 0;
let pagado = 0;

let cuotasTotales = 0;
let cuotasPagadas = 0;

let capitalPagado = 0;
let interesPagado = 0;
let interesTotalOriginal = 0;

let capitalCuotas = [];
let interesCuotas = [];
let cuotasPagadasEstado = [];
let historialAbonos = [];

/* =========================
   FORMATO DINERO
========================= */
function dinero(valor) {
  const num = Number(valor);
  if (!isFinite(num)) return "0";
  return Math.round(num).toLocaleString("es-CO");
}

/* =========================
   ACTUALIZAR TEXTO
========================= */
function actualizarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.innerText = valor;
}

/* =========================
   GUARDAR
========================= */
function guardarPrestamo() {

  const datos = {
    totalPrestamo,
    capitalPagado,
    interesPagado,
    cuotasPagadas,
    capitalCuotas,
    interesCuotas,
    cuotasPagadasEstado,
    historialAbonos,
    interesTotalOriginal,

    comparador: {
      interesOriginal: document.getElementById("interesOriginal")?.innerText || "$0",
      interesConAbono: document.getElementById("interesConAbono")?.innerText || "$0",
      ahorroTotal: document.getElementById("ahorroTotal")?.innerText || "$0",
      cuotasReducidas: document.getElementById("cuotasReducidas")?.innerText || "0"
    }
  };

  localStorage.setItem("prestamoSimulador", JSON.stringify(datos));
}

/* =========================
   CARGAR
========================= */
function cargarPrestamo() {

  const datos = localStorage.getItem("prestamoSimulador");
  if (!datos) return;

  const prestamo = JSON.parse(datos);

  totalPrestamo = prestamo.totalPrestamo || 0;
  capitalPagado = prestamo.capitalPagado || 0;
  interesPagado = prestamo.interesPagado || 0;
  cuotasPagadas = prestamo.cuotasPagadas || 0;
  capitalCuotas = prestamo.capitalCuotas || [];
  interesCuotas = prestamo.interesCuotas || [];
  cuotasPagadasEstado = prestamo.cuotasPagadasEstado || [];
  historialAbonos = prestamo.historialAbonos || [];
  interesTotalOriginal = prestamo.interesTotalOriginal || 0;

  cuotasTotales = capitalCuotas.length;

  reconstruirTabla?.();
  actualizarEstado?.();

  if (prestamo.comparador) {
    actualizarTexto("interesOriginal", prestamo.comparador.interesOriginal);
    actualizarTexto("interesConAbono", prestamo.comparador.interesConAbono);
    actualizarTexto("ahorroTotal", prestamo.comparador.ahorroTotal);
    actualizarTexto("cuotasReducidas", prestamo.comparador.cuotasReducidas);
  }
}

/* =========================
   PROGRESO
========================= */
function calcularProgreso() {

  const totalPagado = capitalPagado + interesPagado;
  const total = totalPrestamo + totalPagado;

  if (!total) return 0;

  const progreso = (totalPagado / total) * 100;

  return Math.min(100, Math.max(0, progreso));
}

/* =========================
   ACTUALIZAR UI
========================= */
function actualizarEstado() {

  pagado = capitalPagado + interesPagado;

  const progreso = calcularProgreso();

  actualizarTexto("saldoPendiente", "$" + dinero(totalPrestamo));
  actualizarTexto("capitalPagado", "$" + dinero(capitalPagado));
  actualizarTexto("interesPagado", "$" + dinero(interesPagado));
  actualizarTexto("totalPagado", "$" + dinero(pagado));
  actualizarTexto("progresoPrestamo", progreso.toFixed(0) + "%");

  const barra = document.getElementById("barraProgreso");

  if (barra) {
    requestAnimationFrame(() => {
      barra.style.width = progreso + "%";
    });
  }
}

/* =========================
   INICIO
========================= */
document.addEventListener("DOMContentLoaded", () => {
  cargarPrestamo();
  renderHistorial?.();
});

/* =========================
   HISTORIAL
========================= */
function renderHistorial() {

  const contenedor = document.getElementById("listaAbonos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (!historialAbonos.length) {
    contenedor.innerHTML = "<p>No hay abonos registrados</p>";
    return;
  }

  for (const a of historialAbonos) {

    const tipoTexto =
      a.tipo === "plazo"
        ? "Reducir plazo"
        : a.tipo === "liquidación total"
          ? "Liquidación total"
          : "Reducir cuota";

    contenedor.innerHTML += `
      <div class="abono-item">
        <strong>$${dinero(a.valor)}</strong>
        <span>${tipoTexto}</span>
        <span style="color:#22c55e;">
          Ahorro: $${dinero(a.ahorro || 0)}
        </span>
        <small>${a.fecha || ""}</small>
      </div>
    `;
  }
}