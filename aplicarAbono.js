function aplicarAbono(ctx = {}) {
  let { abono = 0, tipoOperacion, cuotasAntes = 0 } = ctx;

  abono = normalizarMoneda(abono);

  if (tipoOperacion === "liquidacion_total") {
    abono = normalizarMoneda(totalPrestamo);
  }

  totalPrestamo = Math.max(0, normalizarMoneda(totalPrestamo - abono));
  capitalPagado += abono;
  pagado = capitalPagado + interesPagado;

  if (tipoOperacion === "liquidacion_total") {
    const interesRestanteAntes = sumarInteresPendiente();

    for (let i = 0; i < cuotasTotales; i++) {
      if (!cuotasPagadasEstado[i]) {
        capitalCuotas[i] = 0;
        interesCuotas[i] = 0;
      }
    }

    const ahorroTotal = Math.max(
      0,
      normalizarMoneda(interesTotalOriginal - interesPagado)
    );
    const ahorroIndividual = Math.max(0, normalizarMoneda(interesRestanteAntes));

    actualizarTexto("interesAhorrado", "$" + dinero(ahorroTotal));
    actualizarTexto("interesOriginal", "$" + dinero(interesTotalOriginal));
    actualizarTexto("interesConAbono", "$" + dinero(interesPagado));
    actualizarTexto("ahorroTotal", "$" + dinero(ahorroTotal));
    actualizarTexto("cuotasReducidas", cuotasAntes + " cuotas menos (plazo: 0)");

    historialAbonos.push({
      valor: abono,
      fecha: new Date().toLocaleString("es-CO"),
      tipo: "liquidacion_total",
      ahorro: ahorroIndividual
    });

    reconstruirTabla?.();
    guardarPrestamo?.();
    actualizarEstado?.();
    renderHistorial?.();

    alert("PRÉSTAMO LIQUIDADO COMPLETAMENTE ✔️ 🎉");
    return "liquidado";
  }

  return "continuar";
}

function pagarSeparado() {
  const contexto = prepararYValidarAbono();
  if (!contexto) return;

  const resultado = aplicarAbono(contexto);
  if (resultado === "liquidado") return;

  recalcularYRenderizar(contexto);
}

function recalcularCuota({ saldo, interesMensual, indices } = {}) {
  const indicesObjetivo =
    Array.isArray(indices) && indices.length ? indices : obtenerIndicesCuotasActivas();

  return recalcularCronogramaPendiente("cuota", {
    saldo,
    interesMensual,
    indices: indicesObjetivo
  });
}

function recalcularPlazo({ saldo, interesMensual, cuotaObjetivo, indices } = {}) {
  const indicesObjetivo =
    Array.isArray(indices) && indices.length ? indices : obtenerIndicesCuotasActivas();

  return recalcularCronogramaPendiente("plazo", {
    saldo,
    interesMensual,
    cuotaObjetivo,
    indices: indicesObjetivo
  });
}