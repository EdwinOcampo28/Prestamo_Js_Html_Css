"use strict";

function reiniciar() {

  /* TABLA */
  const tabla = document.getElementById("tabla");
  if (tabla) tabla.innerHTML = "";

  /* UI */
  actualizarTexto("saldoPendiente", "$0");
  actualizarTexto("capitalPagado", "$0");
  actualizarTexto("interesPagado", "$0");
  actualizarTexto("totalPagado", "$0");
  actualizarTexto("progresoPrestamo", "0%");
  actualizarTexto("interesAhorrado", "$0");

  actualizarTexto("interesOriginal", "$0");
  actualizarTexto("interesConAbono", "$0");
  actualizarTexto("ahorroTotal", "$0");
  actualizarTexto("cuotasReducidas", "0");

  const barra = document.getElementById("barraProgreso");
  if (barra) barra.style.width = "0%";

  /* ARRAYS */
  capitalCuotas.length = 0;
  interesCuotas.length = 0;
  cuotasPagadasEstado.length = 0;
  historialAbonos.length = 0;

  /* ESTADO */
  pagado = 0;
  cuotasPagadas = 0;
  capitalPagado = 0;
  interesPagado = 0;

  totalPrestamo = 0;
  totalDeuda = 0;
  cuotasTotales = 0;
  interesTotalOriginal = 0;

  /* INPUTS */
  const abono = document.getElementById("abonoCapital");

  if (abono) {
    abono.value = "";
    abono.removeAttribute("max");
  }

  /* GRÁFICA */
  if (chart) {
    chart.destroy();
    chart = null;
  }

  /* STORAGE */
  localStorage.removeItem("prestamoSimulador");

  /* FINAL */
  actualizarEstado?.();
  renderHistorial?.();
}