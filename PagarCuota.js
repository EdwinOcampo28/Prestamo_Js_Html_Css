function pagarCuota(numero, boton) {
  const indice = Number(numero) - 1;

  if (
    indice < 0 ||
    indice >= cuotasTotales ||
    cuotasPagadasEstado[indice] ||
    !esCuotaActiva(indice)
  ) {
    return;
  }

  const siguienteIndice = obtenerIndicesCuotasActivas()[0];
  if (indice !== siguienteIndice) {
    alert("Para mantener correctos los intereses y el saldo, paga primero la cuota activa número " + (siguienteIndice + 1) + ".");
    return;
  }

  const capitalPendiente = Math.min(
    normalizarMoneda(capitalCuotas[indice]),
    normalizarMoneda(totalPrestamo)
  );
  const interesPendiente = normalizarMoneda(interesCuotas[indice]);

  capitalPagado += capitalPendiente;
  interesPagado += interesPendiente;
  pagado = capitalPagado + interesPagado;

  totalPrestamo = Math.max(0, normalizarMoneda(totalPrestamo - capitalPendiente));
  cuotasPagadas += 1;
  cuotasPagadasEstado[indice] = true;

  if (boton) {
    boton.disabled = true;
  }

  if (totalPrestamo <= EPSILON_MONEDA) {
    totalPrestamo = 0;

    for (let i = 0; i < cuotasTotales; i++) {
      if (!cuotasPagadasEstado[i]) {
        capitalCuotas[i] = 0;
        interesCuotas[i] = 0;
      }
    }
  }

  totalDeuda = normalizarMoneda(totalPrestamo + sumarInteresPendiente());
  reconstruirTabla?.();
  actualizarEstado?.();
  guardarPrestamo?.();
  if (typeof registrarMovimientoBackend === "function") {
    registrarMovimientoBackend("pago_cuota", capitalPendiente + interesPendiente, {
      numeroCuota: indice + 1, capital: capitalPendiente, interes: interesPendiente
    });
  }
}

function reconstruirTabla() {
  const tabla = document.getElementById("tabla");
  if (!tabla) return;

  tabla.innerHTML = "";

  let saldo = normalizarMoneda(totalPrestamo);
  const fechaBase = obtenerFechaBasePrestamo();
  const diaPago = obtenerDiaPago();

  for (let i = 0; i < cuotasTotales; i++) {
    const fecha = generarFechaObjeto(fechaBase, i, diaPago);
    const fechaTexto = fecha.toLocaleDateString("es-CO");

    if (cuotasPagadasEstado[i]) {
      renderFilaPagada(tabla, i, fechaTexto);
      continue;
    }

    const interes = normalizarMoneda(interesCuotas[i]);
    const capital = Math.min(normalizarMoneda(capitalCuotas[i]), saldo);

    if (capital + interes <= EPSILON_MONEDA || saldo <= EPSILON_MONEDA) {
      renderFilaCancelada(tabla, i, fechaTexto);
      continue;
    }

    saldo = Math.max(0, saldo - capital);

    const vencida = new Date() > fecha;
    renderFilaPendiente(tabla, i, fechaTexto, capital, interes, saldo, vencida);
  }

  actualizarGrafica?.();
  actualizarProximoPago?.();
  filtrarCuotas?.();
}
