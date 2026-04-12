function recalcularYRenderizar(ctx) {

  const { abono, interesAntes, cuotasAntes } = ctx;

  const tipo = document.getElementById("tipoAbono")?.value || "cuota";

  const interesMensual = obtenerInteresMensual();

  let saldo = totalPrestamo;

  const tabla = document.getElementById("tabla");
  if (!tabla) return;

  tabla.innerHTML = "";

  const fechaBase = obtenerFechaBasePrestamo();
  const diaPago = obtenerDiaPago();

  if (tipo === "cuota") {
    saldo = recalcularCuota({
      saldo,
      interesMensual,
      tabla,
      fechaBase,
      diaPago
    });
  } else {
    saldo = recalcularPlazo({
      saldo,
      interesMensual,
      tabla,
      fechaBase,
      diaPago
    });
  }

  let interesRestanteNuevo = 0;

  for (let i = 0; i < interesCuotas.length; i++) {
    if (!cuotasPagadasEstado[i]) {
      interesRestanteNuevo += aNumero(interesCuotas[i]);
    }
  }

  const interesTotalNuevo = aNumero(interesPagado) + interesRestanteNuevo;

  const ahorro = Math.max(
    0,
    Math.round(aNumero(interesTotalOriginal) - interesTotalNuevo)
  );

  const ahorroIndividual = Math.max(
    0,
    Math.round(interesAntes - interesTotalNuevo)
  );

  let cuotasDespues = 0;

  for (let i = 0; i < capitalCuotas.length; i++) {
    if (!cuotasPagadasEstado[i] && (aNumero(capitalCuotas[i]) + aNumero(interesCuotas[i])) > 0) {
      cuotasDespues++;
    }
  }

  const cuotasReducidas = Math.max(0, cuotasAntes - cuotasDespues);

  actualizarTexto("interesAhorrado", "$" + dinero(ahorro));

  const elOrig = document.getElementById("interesOriginal");
  const elCon = document.getElementById("interesConAbono");
  const elAhorro = document.getElementById("ahorroTotal");
  const elCuotas = document.getElementById("cuotasReducidas");

  if (elOrig) elOrig.innerText = "$" + dinero(interesTotalOriginal);
  if (elCon) elCon.innerText = "$" + dinero(interesTotalNuevo);
  if (elAhorro) elAhorro.innerText = "$" + dinero(ahorro);

  if (elCuotas) {
    elCuotas.innerText =
      cuotasReducidas + " cuotas menos (plazo: " + cuotasDespues + ")";
  }

  historialAbonos.push({
    valor: abono,
    fecha: new Date().toLocaleString("es-CO"),
    tipo: tipo,
    ahorro: ahorroIndividual
  });

  alert("Abono aplicado correctamente");

  guardarPrestamo?.();
  actualizarEstado?.();
  renderHistorial?.();
}

function generarFecha(fechaBase, i, diaPago) {
  const fecha = new Date(fechaBase);
  fecha.setMonth(fecha.getMonth() + (i + 1));
  fecha.setDate(diaPago);
  return fecha.toLocaleDateString("es-CO");
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

function renderFilaPendiente(tabla, i, fechaTexto, capital, interesMes, saldo) {
  tabla.insertAdjacentHTML(
    "beforeend",
    `
    <tr id="fila${i + 1}">
      <td>${i + 1}</td>
      <td>${fechaTexto}</td>
      <td>$${dinero(aNumero(capital) + aNumero(interesMes))}</td>
      <td>$${dinero(interesMes)}</td>
      <td>$${dinero(capital)}</td>
      <td>$${dinero(saldo)}</td>
      <td>Pendiente</td>
      <td>
        <button onclick="pagarCuota(${i + 1}, this)">Pagar</button>
      </td>
    </tr>
    `
  );
}