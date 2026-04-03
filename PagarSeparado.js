function pagarSeparado() {

  let abono = parseFloat(document.getElementById("abonoCapital").value);

  if (!abono || abono <= 0) {
    alert("Ingresa un valor de abono");
    return;
  }

  if (abono > totalPrestamo) abono = totalPrestamo;

  const tipo = document.getElementById("tipoAbono").value;

  const interesAnual = parseFloat(document.getElementById("interes").value) / 100;
  const interesMensual = interesAnual / 12;

  let interesOriginalRestante = 0;
  let interesNuevoRestante = 0;

  // calcular interes restante original
  for (let i = cuotasPagadas; i < cuotasTotales; i++) {
    interesOriginalRestante += interesCuotas[i] || 0;
  }

  // aplicar abono
  totalPrestamo -= abono;
  capitalPagado += abono;

  const tabla = document.getElementById("tabla");
  tabla.innerHTML = "";

  const labels = [];
  const saldos = [];

  let saldo = totalPrestamo;

  const fechaBase = new Date();

  if (tipo === "cuota") {

    const cuotasRestantes = cuotasTotales - cuotasPagadas;

    let nuevaCuota =
      saldo *
      (interesMensual * Math.pow(1 + interesMensual, cuotasRestantes)) /
      (Math.pow(1 + interesMensual, cuotasRestantes) - 1);

    nuevaCuota = Math.round(nuevaCuota);

    for (let i = cuotasPagadas; i < cuotasTotales; i++) {

      const interesMes = Math.round(saldo * interesMensual);
      const capital = Math.round(nuevaCuota - interesMes);

      saldo -= capital;
      saldo = Math.max(0, saldo);

      interesCuotas[i] = interesMes;
      capitalCuotas[i] = capital;

      interesNuevoRestante += interesMes;

      labels.push("Cuota " + (i + 1));
      saldos.push(saldo);

      const fecha = new Date(fechaBase);
      fecha.setMonth(fecha.getMonth() + (i + 1));
      fecha.setDate(parseInt(document.getElementById("diaPago").value));

      const fechaTexto = fecha.toLocaleDateString("es-CO");

      tabla.innerHTML += `
        <tr id="fila${i + 1}">
          <td>${i + 1}</td>
          <td>${fechaTexto}</td>
          <td>$${dinero(nuevaCuota)}</td>
          <td>$${dinero(interesMes)}</td>
          <td>$${dinero(capital)}</td>
          <td>$${dinero(saldo)}</td>
          <td>Pendiente</td>
          <td><button onclick="pagarCuota(${i + 1}, this)">Pagar</button></td>
        </tr>
      `;
    }

  } else {

    for (let i = cuotasPagadas; i < cuotasTotales; i++) {

      if (saldo <= 0) break;

      const interesMes = Math.round(saldo * interesMensual);
      const capital = capitalCuotas[i];

      saldo -= capital;
      saldo = Math.max(0, saldo);

      interesCuotas[i] = interesMes;

      interesNuevoRestante += interesMes;

      labels.push("Cuota " + (i + 1));
      saldos.push(saldo);

      const fecha = new Date(fechaBase);
      fecha.setMonth(fecha.getMonth() + (i + 1));
      fecha.setDate(parseInt(document.getElementById("diaPago").value));

      const fechaTexto = fecha.toLocaleDateString("es-CO");

      tabla.innerHTML += `
        <tr id="fila${i + 1}">
          <td>${i + 1}</td>
          <td>${fechaTexto}</td>
          <td>$${dinero(capital + interesMes)}</td>
          <td>$${dinero(interesMes)}</td>
          <td>$${dinero(capital)}</td>
          <td>$${dinero(saldo)}</td>
          <td>Pendiente</td>
          <td><button onclick="pagarCuota(${i + 1}, this)">Pagar</button></td>
        </tr>
      `;
    }

  }

  const interesAhorrado = interesOriginalRestante - interesNuevoRestante;

  document.getElementById("interesAhorrado").innerText =
    "$" + dinero(Math.round(interesAhorrado));

  // actualizar grafica
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("grafica"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Saldo restante",
          data: saldos,
          borderColor: "#007bff",
          backgroundColor: "rgba(0,123,255,0.1)",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true
    }
  });

  actualizarEstado();

  document.getElementById("abonoCapital").value = "";

  alert("Abono aplicado correctamente");
}