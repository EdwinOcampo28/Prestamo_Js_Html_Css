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

/**
 * Convierte un número a formato de dinero con separador de miles
 * @param {number} num
 * @returns {string}
 */
function dinero(num){
  num = Math.round(num);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
}

/**
 * Actualiza texto en un elemento del DOM
 */
function actualizarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.innerText = valor;
}

/**
 * Calcula progreso del préstamo
 */
function calcularProgreso() {

  const totalPagado = capitalPagado + interesPagado;
  const total = totalPrestamo + totalPagado;

  if (total === 0) return 0;

  let progreso = (totalPagado / total) * 100;

  if (progreso > 100) progreso = 100;

  return progreso;
}

/**
 * Actualiza toda la interfaz del préstamo
 */
function actualizarEstado() {

  const progreso = calcularProgreso();

  actualizarTexto("saldoPendiente", "$" + dinero(totalPrestamo));
  actualizarTexto("capitalPagado", "$" + dinero(capitalPagado));
  actualizarTexto("interesPagado", "$" + dinero(interesPagado));
  actualizarTexto("totalPagado", "$" + dinero(pagado));
  actualizarTexto("progresoPrestamo", progreso.toFixed(0) + "%");

  const barra = document.getElementById("barraProgreso");
  if (barra) barra.style.width = progreso + "%";

  // 🔹 Intereses que quedan en el plan actual
  let interesRestante = 0;

  for (let i = 0; i < interesCuotas.length; i++) {
    if (!cuotasPagadasEstado[i]) {
      interesRestante += interesCuotas[i];
    }
  }

  // 🔹 Interés total del préstamo actual
  let interesActualTotal = interesPagado + interesRestante;

  // 🔹 Interés ahorrado
  let interesesAhorrados = interesTotalOriginal - interesActualTotal;

  if (interesesAhorrados < 0) interesesAhorrados = 0;

  actualizarTexto("interesAhorrado", "$" + dinero(interesesAhorrados));
}