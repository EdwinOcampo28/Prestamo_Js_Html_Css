function recalcularPlazo({ saldo, interesMensual, tabla, fechaBase, diaPago }) {

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

    const interesMes = saldo * interesMensual;

    let capital = Number(capitalCuotas[i]) || 0;

    if (capital > saldo) capital = saldo;

    saldo = Math.max(0, saldo - capital);

    interesCuotas[i] = interesMes;

    renderFilaPendiente(tabla, i, fechaTexto, capital, interesMes, saldo);
  }

  return saldo;
}