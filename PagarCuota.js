function pagarCuota(numero, boton) {

  const i = numero - 1;

  if (cuotasPagadasEstado[i]) return;

  let capital = capitalCuotas[i] || 0;
  let interes = interesCuotas[i] || 0;

  const capitalPendiente = Math.min(capital, totalPrestamo);

  capitalPagado += capitalPendiente;
  interesPagado += interes;

  pagado = capitalPagado + interesPagado;

  totalPrestamo = Math.max(0, totalPrestamo - capitalPendiente);

  cuotasPagadas++;
  cuotasPagadasEstado[i] = true;

  /* UI */
  const estado = document.getElementById("estado" + numero);
  if (estado) estado.innerText = "Pagado";

  if (boton) boton.disabled = true;

  const fila = document.getElementById("fila" + numero);
  if (fila) fila.classList.add("fila-pagada");

  /* 🔥 RECÁLCULO CORRECTO */

  const interesAnual = parseFloat(document.getElementById("interes")?.value) / 100 || 0;
  const interesMensual = interesAnual / 12;

  let saldoRestante = totalPrestamo;

  for (let j = i + 1; j < cuotasTotales; j++) {

    if (cuotasPagadasEstado[j]) continue;

    /* ❌ antes: Math.round */
    const interesNuevo = saldoRestante * interesMensual;

    interesCuotas[j] = interesNuevo;

    let capitalNuevo = capitalCuotas[j];

    /* 🔥 ajuste por si el saldo cambió */
    if (capitalNuevo > saldoRestante) {
      capitalNuevo = saldoRestante;
      capitalCuotas[j] = capitalNuevo;
    }

    saldoRestante -= capitalNuevo;
    saldoRestante = Math.max(0, saldoRestante);
  }

  /* 🔥 SI SE TERMINA EL PRÉSTAMO */
  if (totalPrestamo <= 0) {

    for (let j = i + 1; j < cuotasTotales; j++) {

      cuotasPagadasEstado[j] = true;

      const estado = document.getElementById("estado" + (j + 1));
      if (estado) estado.innerText = "Cancelada";

      const botonFila = document.querySelector(`#fila${j+1} button`);
      if (botonFila) botonFila.disabled = true;

    }
  }

  /* 🔥 CLAVE: reconstruir tabla completa */
  if(typeof reconstruirTabla === "function"){
    reconstruirTabla();
  }

  actualizarEstado();
  guardarPrestamo();
}

function reconstruirTabla(){

const tabla = document.getElementById("tabla");
if(!tabla) return;

tabla.innerHTML = "";

let saldo = totalPrestamo;
const interesAnual = parseFloat(document.getElementById("interes")?.value)/100 || 0;
const interesMensual = interesAnual/12;

const fechaBase = new Date();

for(let i=0;i<cuotasTotales;i++){

    const fecha = new Date(fechaBase);
    fecha.setMonth(fecha.getMonth()+(i+1));
    fecha.setDate(parseInt(document.getElementById("diaPago")?.value));

    const fechaTexto = fecha.toLocaleDateString("es-CO");

    if(cuotasPagadasEstado[i]){

        tabla.innerHTML+=`
        <tr class="fila-pagada">
        <td>${i+1}</td>
        <td>${fechaTexto}</td>
        <td>$${dinero(capitalCuotas[i]+interesCuotas[i])}</td>
        <td>$${dinero(interesCuotas[i])}</td>
        <td>$${dinero(capitalCuotas[i])}</td>
        <td>$0</td>
        <td>Pagado</td>
        <td>✔</td>
        </tr>
        `;
        continue;
    }

    if(saldo <= 0){

        tabla.innerHTML+=`
        <tr class="fila-cancelada">
        <td>${i+1}</td>
        <td>${fechaTexto}</td>
        <td>$0</td>
        <td>$0</td>
        <td>$0</td>
        <td>$0</td>
        <td>Cancelada</td>
        <td>-</td>
        </tr>
        `;
        continue;
    }

    const interesMes = interesCuotas[i] || 0;
    const capital = capitalCuotas[i] || 0;

    saldo -= capital;
    saldo = Math.max(0,saldo);

    tabla.innerHTML+=`
    <tr id="fila${i+1}">
    <td>${i+1}</td>
    <td>${fechaTexto}</td>
    <td>$${dinero(capital+interesMes)}</td>
    <td>$${dinero(interesMes)}</td>
    <td>$${dinero(capital)}</td>
    <td>$${dinero(saldo)}</td>
    <td id="estado${i + 1}">Pendiente</td>
    <td>
    <button onclick="pagarCuota(${i+1},this)">
    Pagar
    </button>
    </td>
    </tr>
    `;
}

}