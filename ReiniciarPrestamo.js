"use strict";

function reiniciar() {

  /* =========================
     LIMPIAR TABLA
  ========================= */
  const tabla = document.getElementById("tabla");
  if (tabla) tabla.innerHTML = "";

  /* =========================
     RESETEAR UI
  ========================= */
  actualizarTexto("saldoPendiente", "$0");
  actualizarTexto("capitalPagado", "$0");
  actualizarTexto("interesPagado", "$0");
  actualizarTexto("totalPagado", "$0");
  actualizarTexto("progresoPrestamo", "0%");
  actualizarTexto("interesAhorrado", "$0");

  /* COMPARADOR */
  actualizarTexto("interesOriginal", "$0");
  actualizarTexto("interesConAbono", "$0");
  actualizarTexto("ahorroTotal", "$0");
  actualizarTexto("cuotasReducidas", "0");

  const barra = document.getElementById("barraProgreso");
  if (barra) barra.style.width = "0%";

  /* =========================
     LIMPIAR ARRAYS
  ========================= */
  capitalCuotas = [];
  interesCuotas = [];
  cuotasPagadasEstado = [];

  /* 🔥 NUEVO: limpiar historial */
  historialAbonos = [];

  /* =========================
     VARIABLES GLOBALES
  ========================= */
  pagado = 0;
  cuotasPagadas = 0;
  capitalPagado = 0;
  interesPagado = 0;

  totalPrestamo = 0;
  totalDeuda = 0;
  cuotasTotales = 0;
  interesTotalOriginal = 0;

  /* =========================
     INPUTS
  ========================= */
  const abono = document.getElementById("abonoCapital");
  if (abono) abono.value = "";

  /* =========================
     GRÁFICA
  ========================= */
  if (chart) {
    chart.destroy();
    chart = null;
  }

  /* =========================
     STORAGE
  ========================= */
  localStorage.removeItem("prestamoSimulador");

  /* =========================
     UI FINAL
  ========================= */
  actualizarEstado();
  renderHistorial(); // 🔥 CLAVE
}