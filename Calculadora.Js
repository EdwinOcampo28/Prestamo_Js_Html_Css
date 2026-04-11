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
   FORMATO DINERO (MEJORADO)
========================= */
function dinero(valor){
  if(valor === undefined || valor === null || isNaN(valor)) return "0";
  return Math.round(valor).toLocaleString("es-CO");
}

/* =========================
   ACTUALIZAR TEXTO
========================= */
function actualizarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.innerText = valor;
}

/* =========================
   GUARDAR (ROBUSTO)
========================= */
function guardarPrestamo(){

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
   CARGAR (CORREGIDO)
========================= */
function cargarPrestamo(){

const datos = localStorage.getItem("prestamoSimulador");
if(!datos) return;

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

/* reconstruir UI */
reconstruirTabla();
actualizarEstado();

/* 🔥 restaurar comparador */
if(prestamo.comparador){
  actualizarTexto("interesOriginal", prestamo.comparador.interesOriginal);
  actualizarTexto("interesConAbono", prestamo.comparador.interesConAbono);
  actualizarTexto("ahorroTotal", prestamo.comparador.ahorroTotal);
  actualizarTexto("cuotasReducidas", prestamo.comparador.cuotasReducidas);
}
}

/* =========================
   PROGRESO (PRECISO)
========================= */
function calcularProgreso() {

  const totalPagado = capitalPagado + interesPagado;
  const total = totalPrestamo + totalPagado;

  if (total <= 0) return 0;

  let progreso = (totalPagado / total) * 100;

  return Math.min(100, Math.max(0, progreso));
}

/* =========================
   ACTUALIZAR UI (ESTABLE)
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
    setTimeout(()=>{
      barra.style.width = progreso + "%";
    },100);
  }

  /* 🔥 NO tocar comparador aquí */
}

/* =========================
   INICIO
========================= */
document.addEventListener("DOMContentLoaded", () => {
  cargarPrestamo();
  renderHistorial();
});

/* =========================
   HISTORIAL (PRO)
========================= */
function renderHistorial(){

  const contenedor = document.getElementById("listaAbonos");
  if(!contenedor) return;

  contenedor.innerHTML = "";

  if(historialAbonos.length === 0){
    contenedor.innerHTML = "<p>No hay abonos registrados</p>";
    return;
  }

  historialAbonos.forEach(a => {

    contenedor.innerHTML += `
      <div class="abono-item">
        <strong>$${dinero(a.valor)}</strong>
        <span>${a.tipo === "plazo" ? "Reducir plazo" : "Reducir cuota"}</span>
        <span style="color:#22c55e;">
          Ahorro: $${dinero(a.ahorro || 0)}
        </span>
        <small>${a.fecha}</small>
      </div>
    `;
  });
}