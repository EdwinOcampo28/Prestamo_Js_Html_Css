function pagarCuota(numero, boton) {

  const i = Number(numero) - 1;

  if (cuotasPagadasEstado[i]) return;

  let capital = Number(capitalCuotas[i]) || 0;
  let interes = Number(interesCuotas[i]) || 0;

  const capitalPendiente = Math.min(capital, totalPrestamo);

  capitalPagado += capitalPendiente;
  interesPagado += interes;

  pagado = capitalPagado + interesPagado;

  totalPrestamo = Math.max(0, totalPrestamo - capitalPendiente);

  cuotasPagadas++;
  cuotasPagadasEstado[i] = true;

  /* UI */
  const estadoEl = document.getElementById("estado" + numero);
  if (estadoEl) estadoEl.innerText = "Pagado";

  if (boton) boton.disabled = true;

  const fila = document.getElementById("fila" + numero);
  if (fila) {
    fila.classList.add("fila-pagada");

    fila.animate(
      [
        { transform: "scale(1.05)", background: "#064e3b" },
        { transform: "scale(1)" }
      ],
      {
        duration: 400,
        easing: "ease"
      }
    );
  }

  /* =========================
     RECÁLCULO PRO
  ========================= */

  const interesAnual =
    Number(document.getElementById("interes")?.value) / 100 || 0;

  const interesMensual = interesAnual / 12;

  let saldoRestante = totalPrestamo;

  for (let j = 0; j < cuotasTotales; j++) {

    if (cuotasPagadasEstado[j]) continue;

    if (saldoRestante <= 0) {
      capitalCuotas[j] = 0;
      interesCuotas[j] = 0;
      continue;
    }

    let interesNuevo = saldoRestante * interesMensual;
    let capitalNuevo = Number(capitalCuotas[j]) || 0;

    if (capitalNuevo > saldoRestante) {
      capitalNuevo = saldoRestante;
      interesNuevo = 0;
    }

    capitalCuotas[j] = capitalNuevo;
    interesCuotas[j] = interesNuevo;

    saldoRestante = Math.max(0, saldoRestante - capitalNuevo);
  }

  /* PRÉSTAMO FINALIZADO */
  if (totalPrestamo <= 0) {

    for (let j = 0; j < cuotasTotales; j++) {

      if (!cuotasPagadasEstado[j]) {
        cuotasPagadasEstado[j] = true;

        const estado = document.getElementById("estado" + (j + 1));
        if (estado) estado.innerText = "Cancelada";

        const btn = document.querySelector(`#fila${j + 1} button`);
        if (btn) btn.disabled = true;
      }
    }
  }

  reconstruirTabla?.();
  actualizarEstado?.();
  guardarPrestamo?.();
}

/* =========================
   RECONSTRUIR TABLA
========================= */
function reconstruirTabla() {

  const tabla = document.getElementById("tabla");
  if (!tabla) return;

  tabla.innerHTML = "";

  let saldo = totalPrestamo;

  const interesAnual =
    Number(document.getElementById("interes")?.value) / 100 || 0;

  const interesMensual = interesAnual / 12;

  const fechaBase = new Date();
  const diaPago = Number(document.getElementById("diaPago")?.value) || 1;

  for (let i = 0; i < cuotasTotales; i++) {

    const fecha = new Date(fechaBase);
    fecha.setMonth(fecha.getMonth() + (i + 1));
    fecha.setDate(diaPago);

    const fechaTexto = fecha.toLocaleDateString("es-CO");

    if (cuotasPagadasEstado[i]) {
      tabla.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="fila-pagada">
          <td>${i + 1}</td>
          <td>${fechaTexto}</td>
          <td>$${dinero(capitalCuotas[i] + interesCuotas[i])}</td>
          <td>$${dinero(interesCuotas[i])}</td>
          <td>$${dinero(capitalCuotas[i])}</td>
          <td>$0</td>
          <td>Pagado</td>
          <td>✔</td>
        </tr>
        `
      );
      continue;
    }

    if (saldo <= 0) {
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
      continue;
    }

    let interesMes = Number(interesCuotas[i]) || 0;
    let capital = Number(capitalCuotas[i]) || 0;

    if (capital > saldo) {
      capital = saldo;
      interesMes = 0;
    }

    saldo = Math.max(0, saldo - capital);

    const hoy = new Date(fecha);

    const vencida = new Date() > hoy;

    const estado = vencida ? "Vencida" : "Pendiente";
    const clase = vencida ? "fila-vencida" : "";

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
          <button onclick="pagarCuota(${i + 1}, this)">
            Pagar
          </button>
        </td>
      </tr>
      `
    );
  }
}