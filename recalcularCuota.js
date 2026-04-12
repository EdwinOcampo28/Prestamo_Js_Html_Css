function recalcularCuota({ saldo, interesMensual, tabla, fechaBase, diaPago }) {

  let cuotasRestantes = 0;

  for (let i = 0; i < cuotasTotales; i++) {
    if (!cuotasPagadasEstado[i]) cuotasRestantes++;
  }

  if (cuotasRestantes <= 0) return saldo;

  const factor = Math.pow(1 + interesMensual, cuotasRestantes);

  const nuevaCuota =
    interesMensual === 0
      ? saldo / cuotasRestantes
      : saldo * ((interesMensual * factor) / (factor - 1));

  for (let i = 0; i < cuotasTotales; i++) {

    const fechaTexto = generarFecha(fechaBase, i, diaPago);

    if (cuotasPagadasEstado[i]) {
      renderFilaPagada(tabla, i, fechaTexto);
      continue;
    }

    if (saldo <= 0) {
      renderFilaCancelada(tabla, i, fechaTexto);
      continue;
    }

    let interesMes = saldo * interesMensual;
    let capital = nuevaCuota - interesMes;

    if (capital >= saldo || i === cuotasTotales - 1) {
      capital = saldo;
      interesMes = 0;
    }

    saldo = Math.max(0, saldo - capital);

    interesCuotas[i] = interesMes;
    capitalCuotas[i] = capital;

    renderFilaPendiente(tabla, i, fechaTexto, capital, interesMes, saldo);
  }

  return saldo;
}