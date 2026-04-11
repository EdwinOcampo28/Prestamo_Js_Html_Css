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

/* =========================
   FORMATO DINERO
========================= */
function dinero(valor){
  if(valor === undefined || valor === null) return "0";
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
   GUARDAR (UNIFICADO)
========================= */
function guardarPrestamo(){

const datos = {
totalPrestamo,
capitalPagado,
interesPagado,
pagado,
cuotasTotales,
cuotasPagadas,
interesTotalOriginal,
capitalCuotas,
interesCuotas,
cuotasPagadasEstado
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
pagado = prestamo.pagado || 0;

cuotasTotales = prestamo.cuotasTotales || 0;
cuotasPagadas = prestamo.cuotasPagadas || 0;
interesTotalOriginal = prestamo.interesTotalOriginal || 0;

capitalCuotas = prestamo.capitalCuotas || [];
interesCuotas = prestamo.interesCuotas || [];
cuotasPagadasEstado = prestamo.cuotasPagadasEstado || [];

/* 🔥 SOLO reconstruir, NO recalcular */
if(typeof reconstruirTabla === "function"){
  reconstruirTabla();
}

actualizarEstado();

}

/* =========================
   PROGRESO
========================= */
function calcularProgreso() {

  const totalPagado = capitalPagado + interesPagado;
  const total = totalPrestamo + totalPagado;

  if (total === 0) return 0;

  let progreso = (totalPagado / total) * 100;

  if (progreso > 100) progreso = 100;

  return progreso;
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
    setTimeout(()=>{
      barra.style.width = progreso + "%";
    },100);
  }

  /* 🔹 Intereses restantes */
  let interesRestante = 0;

  for (let i = 0; i < interesCuotas.length; i++) {
    if (!cuotasPagadasEstado[i]) {
      interesRestante += interesCuotas[i];
    }
  }

  let interesActualTotal = interesPagado + interesRestante;

  let interesesAhorrados = interesTotalOriginal - interesActualTotal;

  if (interesesAhorrados < 0) interesesAhorrados = 0;

  actualizarTexto("interesAhorrado", "$" + dinero(interesesAhorrados));
}

/* =========================
   INICIO (ÚNICO)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  cargarPrestamo();
});