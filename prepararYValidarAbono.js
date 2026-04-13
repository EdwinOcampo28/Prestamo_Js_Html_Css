function prepararYValidarAbono() {
  if (normalizarMoneda(totalPrestamo) <= 0 || contarCuotasActivas() <= 0) {
    alert("No hay saldo pendiente para abonar");
    return null;
  }

  const interesAntes = normalizarMoneda(interesPagado + sumarInteresPendiente());
  const cuotasAntes = contarCuotasActivas();
  const abono = normalizarMoneda(document.getElementById("abonoCapital")?.value);

  if (!Number.isFinite(abono) || abono <= 0) {
    alert("Ingresa un valor de abono");
    return null;
  }

  if (abono > totalPrestamo) {
    alert(
      "El abono no puede ser mayor al saldo pendiente ($" +
        dinero(totalPrestamo) +
        ")"
    );
    return null;
  }

  const tipoOperacion =
    abono >= totalPrestamo - 1 ? "liquidacion_total" : "normal";

  return {
    abono,
    tipoOperacion,
    interesAntes,
    cuotasAntes
  };
}
