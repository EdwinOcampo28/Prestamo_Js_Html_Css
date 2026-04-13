function recalcularYRenderizar(ctx) {
  const { abono, interesAntes, cuotasAntes } = ctx;
  const tipo = document.getElementById("tipoAbono")?.value || "cuota";

  if (tipo === "plazo") {
    recalcularPlazo({
      saldo: totalPrestamo,
      interesMensual: obtenerInteresMensual(),
      cuotaObjetivo: obtenerCuotaPendienteActual()
    });
  } else {
    recalcularCuota({
      saldo: totalPrestamo,
      interesMensual: obtenerInteresMensual()
    });
  }

  reconstruirTabla?.();

  const interesRestanteNuevo = sumarInteresPendiente();
  const interesTotalNuevo = normalizarMoneda(interesPagado + interesRestanteNuevo);
  const ahorro = Math.max(
    0,
    normalizarMoneda(interesTotalOriginal - interesTotalNuevo)
  );
  const ahorroIndividual = Math.max(
    0,
    normalizarMoneda(interesAntes - interesTotalNuevo)
  );
  const cuotasDespues = contarCuotasActivas();
  const cuotasReducidas = Math.max(0, cuotasAntes - cuotasDespues);

  actualizarTexto("interesAhorrado", "$" + dinero(ahorro));
  actualizarTexto("interesOriginal", "$" + dinero(interesTotalOriginal));
  actualizarTexto("interesConAbono", "$" + dinero(interesTotalNuevo));
  actualizarTexto("ahorroTotal", "$" + dinero(ahorro));
  actualizarTexto(
    "cuotasReducidas",
    cuotasReducidas + " cuotas menos (plazo: " + cuotasDespues + ")"
  );

  historialAbonos.push({
    valor: normalizarMoneda(abono),
    fecha: new Date().toLocaleString("es-CO"),
    tipo,
    ahorro: ahorroIndividual
  });

  alert("Abono aplicado correctamente");

  guardarPrestamo?.();
  actualizarEstado?.();
  renderHistorial?.();
}

function generarFechaObjeto(fechaBase, i, diaPago) {
  const fecha = new Date(fechaBase);
  fecha.setMonth(fecha.getMonth() + (i + 1), 1);

  const ultimoDiaMes = new Date(
    fecha.getFullYear(),
    fecha.getMonth() + 1,
    0
  ).getDate();

  fecha.setDate(Math.min(diaPago, ultimoDiaMes));
  return fecha;
}

function generarFecha(fechaBase, i, diaPago) {
  return generarFechaObjeto(fechaBase, i, diaPago).toLocaleDateString("es-CO");
}

function renderFilaPagada(tabla, i, fechaTexto) {
  tabla.insertAdjacentHTML(
    "beforeend",
    `
    <tr class="fila-pagada">
      <td>${i + 1}</td>
      <td>${fechaTexto}</td>
      <td>$${dinero(aNumero(capitalCuotas[i]) + aNumero(interesCuotas[i]))}</td>
      <td>$${dinero(interesCuotas[i])}</td>
      <td>$${dinero(capitalCuotas[i])}</td>
      <td>$0</td>
      <td>Pagado</td>
      <td>✔</td>
    </tr>
    `
  );
}

function renderFilaCancelada(tabla, i, fechaTexto) {
  tabla.insertAdjacentHTML(
    "beforeend",
    `
    <tr class="fila-cancelada">
      <td>${i + 1}</td>
      <td>${fechaTexto}</td>
      <td>$0</td>
      <td>$0</td>
      <td>$0</td>
      <td>$0</td>
      <td>Cancelada</td>
      <td>-</td>
    </tr>
    `
  );
}

function renderFilaPendiente(
  tabla,
  i,
  fechaTexto,
  capital,
  interesMes,
  saldo,
  estaVencida = false
) {
  const estado = estaVencida ? "Vencida" : "Pendiente";
  const clase = estaVencida ? "fila-vencida" : "";

  tabla.insertAdjacentHTML(
    "beforeend",
    `
    <tr id="fila${i + 1}" class="${clase}">
      <td>${i + 1}</td>
      <td>${fechaTexto}</td>
      <td>$${dinero(capital + interesMes)}</td>
      <td>$${dinero(interesMes)}</td>
      <td>$${dinero(capital)}</td>
      <td>$${dinero(saldo)}</td>
      <td id="estado${i + 1}">${estado}</td>
      <td>
        <button onclick="pagarCuota(${i + 1}, this)">Pagar</button>
      </td>
    </tr>
    `
  );
}
