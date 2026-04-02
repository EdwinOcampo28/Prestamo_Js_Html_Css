"use strict";

let chart;

let totalPrestamo = 0;
let totalDeuda = 0;
let pagado = 0;

let cuotasTotales = 0;
let cuotasPagadas = 0;

let capitalPagado = 0;
let interesPagado = 0;

let capitalCuotas = [];
let interesCuotas = [];
let cuotasPagadasEstado = [];

/**
 * Convierte un número a formato de dinero con separador de miles y dos decimales
 * @param {number} num
 * @returns {string} número formateado
 */
function dinero(num){
  // Asegura que siempre sea entero
  num = Math.round(num);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
}

/**
 * Actualiza un elemento del DOM con un valor
 * @param {string} id - id del elemento
 * @param {string} valor - valor a mostrar
 */
function actualizarTexto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.innerText = valor;
}

/**
 * Calcula el progreso del préstamo como porcentaje
 * @returns {number} progreso de 0 a 100
 */
function calcularProgreso() {
  const totalPagado = capitalPagado + interesPagado;
  const total = totalPrestamo + totalPagado;

  if (total === 0) return 0; // evita división por cero
  let progreso = (totalPagado / total) * 100;
  if (progreso > 100) progreso = 100;
  return progreso;
}

/**
 * Actualiza todo el estado del préstamo en la interfaz
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
}