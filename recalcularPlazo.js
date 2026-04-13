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
