"use strict";

function reiniciar(pedirConfirmacion = true) {
  if (pedirConfirmacion && !confirm("Esto limpiará el préstamo de la pantalla y la copia local. Los clientes y préstamos guardados en este navegador no se borrarán. ¿Continuar?")) return;
  if (typeof establecerPrestamoActual === "function") establecerPrestamoActual(null);

  const tabla = document.getElementById("tabla");
  if (tabla) tabla.innerHTML = "";

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

  capitalCuotas.length = 0;
  interesCuotas.length = 0;
  cuotasPagadasEstado.length = 0;
  historialAbonos.length = 0;

  pagado = 0;
  cuotasPagadas = 0;
  capitalPagado = 0;
  interesPagado = 0;

  totalPrestamo = 0;
  totalDeuda = 0;
  cuotasTotales = 0;
  interesTotalOriginal = 0;

  montoInicial = 0;
  interesAnualPrestamo = 0;
  diaPagoPrestamo = 1;
  fechaInicioPrestamo = "";

  const abono = document.getElementById("abonoCapital");

  if (abono) {
    abono.value = "";
    abono.removeAttribute("max");
  }

  if (chart) {
    chart.destroy();
    chart = null;
  }

  localStorage.removeItem("prestamoSimulador");
  localStorage.removeItem("prestamoSimulador_respaldo");
  localStorage.removeItem("prestamoSimulador_formulario");
  localStorage.removeItem("prestamoSimulador_prestamoActivoId");
  actualizarIndicadorGuardado?.("Préstamo reiniciado y datos locales eliminados", "vacio");

  actualizarEstado?.();
  renderHistorial?.();
}