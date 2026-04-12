function recalcularCuota({ saldo, interesMensual, indices } = {}) {
  const indicesObjetivo =
    Array.isArray(indices) && indices.length ? indices : obtenerIndicesCuotasActivas();

  return recalcularCronogramaPendiente("cuota", {
    saldo,
    interesMensual,
    indices: indicesObjetivo
  });
}
