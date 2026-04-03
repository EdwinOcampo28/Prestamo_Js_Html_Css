"use strict";

function reiniciar() {

  // 🔹 Limpiar tabla
  const tabla = document.getElementById("tabla");
  if (tabla) tabla.innerHTML = "";

  // 🔹 Reiniciar valores de interfaz
  actualizarTexto("saldoPendiente", "$0");
  actualizarTexto("capitalPagado", "$0");
  actualizarTexto("interesPagado", "$0");
  actualizarTexto("totalPagado", "$0");
  actualizarTexto("progresoPrestamo", "0%");

  const barra = document.getElementById("barraProgreso");
  if (barra) barra.style.width = "0%";

  // 🔹 Limpiar arrays
  capitalCuotas = [];
  interesCuotas = [];
  cuotasPagadasEstado = [];

  // 🔹 Reiniciar variables globales
  pagado = 0;
  cuotasPagadas = 0;
  capitalPagado = 0;
  interesPagado = 0;

  totalPrestamo = 0;
  totalDeuda = 0;
  cuotasTotales = 0;

  interesTotalOriginal = 0;

  // 🔹 Limpiar inputs opcionales
  const abono = document.getElementById("abonoCapital");
  if (abono) abono.value = "";

  // 🔹 Destruir gráfico si existe
  if (chart) {
    chart.destroy();
    chart = null;
  }

  // 🔹 Limpiar datos guardados
  localStorage.removeItem("prestamoSimulador");
}