"use strict";

function calcular() {
  const monto = normalizarMoneda(document.getElementById("monto")?.value);
  const interesAnualPorcentaje = aNumero(document.getElementById("interes")?.value);
  const cuotas = parseInt(document.getElementById("cuotas")?.value, 10);
  const diaPago = parseInt(document.getElementById("diaPago")?.value, 10);

  if (
    !Number.isFinite(monto) ||
    !Number.isFinite(interesAnualPorcentaje) ||
    !Number.isFinite(cuotas) ||
    !Number.isFinite(diaPago) ||
    monto <= 0 ||
    cuotas <= 0 ||
    diaPago < 1 ||
    diaPago > 31
  ) {
    alert("Completa todos los campos correctamente");
    return;
  }

  totalPrestamo = monto;
  totalDeuda = 0;
  pagado = 0;
  cuotasTotales = cuotas;
  cuotasPagadas = 0;
  capitalPagado = 0;
  interesPagado = 0;
  interesTotalOriginal = 0;
  montoInicial = monto;
  interesAnualPrestamo = interesAnualPorcentaje / 100;
  diaPagoPrestamo = diaPago;
  fechaInicioPrestamo = new Date().toISOString();

  capitalCuotas = new Array(cuotasTotales).fill(0);
  interesCuotas = new Array(cuotasTotales).fill(0);
  cuotasPagadasEstado = new Array(cuotasTotales).fill(false);
  historialAbonos = [];

  recalcularCronogramaPendiente("cuota", {
    indices: Array.from({ length: cuotasTotales }, (_, i) => i),
    saldo: totalPrestamo,
    interesMensual: obtenerInteresMensual()
  });

  interesTotalOriginal = sumarInteresPendiente();
  totalDeuda = totalPrestamo + interesTotalOriginal;

  actualizarTexto("interesOriginal", "$" + dinero(interesTotalOriginal));
  actualizarTexto("interesConAbono", "$" + dinero(interesTotalOriginal));
  actualizarTexto("ahorroTotal", "$0");
  actualizarTexto("cuotasReducidas", "0 cuotas menos (plazo: " + cuotasTotales + ")");
  actualizarTexto("interesAhorrado", "$0");

  reconstruirTabla?.();
  actualizarEstado?.();
  guardarPrestamo?.();
  renderHistorial?.();
}
