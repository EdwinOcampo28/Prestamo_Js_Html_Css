function PMT(saldo, tasa, n) {
  if (tasa === 0) return saldo / n;

  const f = Math.pow(1 + tasa, n);
  return saldo * (tasa * f) / (f - 1);
}

function recalcularPlazo({ saldo, interesMensual, tabla, fechaBase, diaPago }) {

  let saldoActual = aNumero(saldo);
  let totalInteres = 0;

  for (let i = 0; i < cuotasTotales; i++) {

    const fechaTexto = generarFecha(fechaBase, i, diaPago);

    if (cuotasPagadasEstado[i]) {
      renderFilaPagada(tabla, i, fechaTexto);
      continue;
    }

    if (saldoActual <= 0) {
      renderFilaCancelada(tabla, i, fechaTexto);
      continue;
    }

    const restantes = cuotasTotales - i;

    const cuota = PMT(saldoActual, interesMensual, restantes);

    const interesMes = saldoActual * interesMensual;

    let capital = cuota - interesMes;

    if (capital > saldoActual) capital = saldoActual;

    saldoActual = Math.max(0, saldoActual - capital);

    interesCuotas[i] = interesMes;
    capitalCuotas[i] = capital;

    totalInteres += interesMes;

    renderFilaPendiente(
      tabla,
      i,
      fechaTexto,
      capital,
      interesMes,
      saldoActual
    );
  }

  return {
    saldoFinal: saldoActual,
    interesTotal: totalInteres
  };
}