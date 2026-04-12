function prepararYValidarAbono() {

  const abonoRaw = document.getElementById("abonoCapital")?.value;
  const abono = aNumero(abonoRaw);

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

  let interesAntes = aNumero(interesPagado);

  for (let i = 0; i < interesCuotas.length; i++) {
    if (!cuotasPagadasEstado[i]) {
      interesAntes += aNumero(interesCuotas[i]);
    }
  }

  let cuotasAntes = 0;

  for (let i = 0; i < capitalCuotas.length; i++) {
    if (!cuotasPagadasEstado[i]) {
      cuotasAntes++;
    }
  }

  const EPSILON = 1;

  const tipoOperacion =
    abono >= totalPrestamo - EPSILON ? "liquidacion_total" : "normal";

  return {
    abono,
    tipoOperacion,
    interesAntes,
    cuotasAntes
  };
}