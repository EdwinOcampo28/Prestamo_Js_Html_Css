function prepararYValidarAbono() {

  let interesAntes = Number(interesPagado) || 0;

  for (let i = 0; i < interesCuotas.length; i++) {
    if (!cuotasPagadasEstado[i]) {
      interesAntes += Number(interesCuotas[i]) || 0;
    }
  }

  let cuotasAntes = 0;

  for (let i = 0; i < capitalCuotas.length; i++) {
    if (!cuotasPagadasEstado[i]) {
      cuotasAntes++;
    }
  }

  const abonoRaw = document.getElementById("abonoCapital")?.value;
  const abono = Number(abonoRaw);

  if (!isFinite(abono) || abono <= 0) {
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