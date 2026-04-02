function pagarCuota(numero, boton) {

  if (cuotasPagadasEstado[numero - 1]) return;

  // Marcar cuota como pagada
  cuotasPagadasEstado[numero - 1] = true;

  let capital = capitalCuotas[numero - 1];
  let interes = interesCuotas[numero - 1];

  // ✅ Actualizar pagos
  capitalPagado += Math.round(capital);
interesPagado += Math.round(interes);

pagado = capitalPagado + interesPagado;

  cuotasPagadas++;

  // ✅ Reducir saldo pendiente
  totalPrestamo -= Math.round(capital);
totalDeuda -= Math.round(capital + interes);

if (totalPrestamo < 0) totalPrestamo = 0;
if (totalDeuda < 0) totalDeuda = 0;

  // Actualizar interfaz
  document.getElementById("estado" + numero).innerText = "Pagada";
  boton.disabled = true;

  actualizarEstado();
}