function recalcularYRenderizar(ctx) {

  const { abono, interesAntes, cuotasAntes } = ctx;

  const tipo = document.getElementById("tipoAbono")?.value || "cuota";

  const interesAnual =
    Number(document.getElementById("interes")?.value) / 100 || 0;

  const interesMensual = interesAnual / 12;

  let saldo = totalPrestamo;

  const tabla = document.getElementById("tabla");
  if (!tabla) return;

  tabla.innerHTML = "";

  const fechaBase = new Date();
  const diaPago = Number(document.getElementById("diaPago")?.value) || 1;

  /* ORQUESTADOR */
  if (tipo === "cuota") {
    saldo = recalcularCuota({ saldo, interesMensual, tabla, fechaBase, diaPago });
  } else {
    saldo = recalcularPlazo({ saldo, interesMensual, tabla, fechaBase, diaPago });
  }

  /* MÉTRICAS */
  let interesRestanteNuevo = 0;

  for (let i = 0; i < interesCuotas.length; i++) {
    if (!cuotasPagadasEstado[i]) {
      interesRestanteNuevo += Number(interesCuotas[i]) || 0;
    }
  }

  const interesTotalNuevo = (Number(interesPagado) || 0) + interesRestanteNuevo;

  const ahorro = Math.max(
    0,
    Math.round((Number(interesTotalOriginal) || 0) - interesTotalNuevo)
  );

  const ahorroIndividual = Math.max(
    0,
    Math.round(interesAntes - interesTotalNuevo)
  );

  let cuotasDespues = 0;

  for (let i = 0; i < capitalCuotas.length; i++) {
    if (!cuotasPagadasEstado[i] && (capitalCuotas[i] + interesCuotas[i]) > 0) {
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
      <td>$${dinero(Number(capitalCuotas[i]) + Number(interesCuotas[i]))}</td>
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
      <td>$${dinero(Math.round(capital + interesMes))}</td>
      <td>$${dinero(Math.round(interesMes))}</td>
      <td>$${dinero(Math.round(capital))}</td>
      <td>$${dinero(Math.round(saldo))}</td>
      <td>Pendiente</td>
      <td>
        <button onclick="pagarCuota(${i + 1}, this)">Pagar</button>
      </td>
    </tr>
    `
  );
}