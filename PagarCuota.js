function pagarCuota(numero, boton) {

  const i = numero - 1;

  if (cuotasPagadasEstado[i]) return;

  let capital = capitalCuotas[i];
  let interes = interesCuotas[i];

  const capitalPendiente = Math.min(capital, totalPrestamo);
  const interesPendiente = Math.min(interes, totalDeuda - totalPrestamo);

  capitalPagado += Math.round(capitalPendiente);
  interesPagado += Math.round(interesPendiente);

  pagado = capitalPagado + interesPagado;

  totalPrestamo = Math.max(0, totalPrestamo - capitalPendiente);
  totalDeuda = Math.max(0, totalDeuda - (capitalPendiente + interesPendiente));

  cuotasPagadas++;
  cuotasPagadasEstado[i] = true;

  // actualizar estado visual
  const estado = document.getElementById("estado" + numero);
  if (estado) estado.innerText = "Pagada";

  if (boton) boton.disabled = true;
  document.getElementById("fila"+numero).classList.add("fila-pagada");
  const interesAnual = parseFloat(document.getElementById("interes").value) / 100;
  const interesMensual = interesAnual / 12;

  let saldoRestante = totalPrestamo;

  // recalcular intereses futuros
  for (let j = i + 1; j < cuotasTotales; j++) {

    if (cuotasPagadasEstado[j]) continue;

    const nuevoInteres = Math.round(saldoRestante * interesMensual);
    interesCuotas[j] = nuevoInteres;

    saldoRestante -= capitalCuotas[j];
    saldoRestante = Math.max(0, saldoRestante);

  }

  // si el préstamo se pagó completamente
  if (totalPrestamo <= 0) {

    for (let j = i + 1; j < cuotasTotales; j++) {

      cuotasPagadasEstado[j] = true;

      const estado = document.getElementById("estado" + (j + 1));
      if (estado) estado.innerText = "Cancelada";

      const boton = document.querySelector(`#fila${j+1} button`);
      if (boton) boton.disabled = true;

    }

  }

  actualizarEstado();
}