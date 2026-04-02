function pagarCuota(numero, boton) {
  const i = numero - 1;
  if (cuotasPagadasEstado[i]) return; // ya pagada

  let capital = capitalCuotas[i];
  let interes = interesCuotas[i];

  // 🔹 Limitar pago a lo que realmente queda pendiente
  const capitalPendiente = Math.min(capital, totalPrestamo);
  const interesPendiente = Math.min(interes, totalDeuda - totalPrestamo);

  capitalPagado += Math.round(capitalPendiente);
  interesPagado += Math.round(interesPendiente);
  pagado = capitalPagado + interesPagado;

  totalPrestamo = Math.max(0, totalPrestamo - capitalPendiente);
  totalDeuda = Math.max(0, totalDeuda - (capitalPendiente + interesPendiente));

  cuotasPagadas++;
  cuotasPagadasEstado[i] = true;

  // Actualizar tabla
  document.getElementById("estado" + numero).innerText = "Pagada";
  boton.disabled = true;

  // 🔹 Reducir intereses futuros proporcionalmente si hubo abono
let saldoRestante = totalPrestamo;
const interesAnual = parseFloat(document.getElementById("interes").value) / 100;
const interesMensual = interesAnual / 12;

for (let j = i + 1; j < cuotasTotales; j++) {
  const interesAnterior = interesCuotas[j];
  const nuevoInteres = Math.round(saldoRestante * interesMensual);

  interesCuotas[j] = nuevoInteres;

  saldoRestante -= capitalCuotas[j];
  if (saldoRestante < 0) saldoRestante = 0;
}

  actualizarEstado();
}