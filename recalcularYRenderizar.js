function recalcularYRenderizar(ctx){

    const {abono, interesAntes, cuotasAntes} = ctx;

    const tipo = document.getElementById("tipoAbono")?.value || "cuota";
    const interesAnual = parseFloat(document.getElementById("interes")?.value)/100 || 0;
    const interesMensual = interesAnual/12;

    let saldo = totalPrestamo;

    const tabla = document.getElementById("tabla");
    if(!tabla) return;

    tabla.innerHTML="";

    const fechaBase = new Date();
    const diaPago = parseInt(document.getElementById("diaPago")?.value);

    /* =========================
       ORQUESTADOR
    ========================= */

    if(tipo === "cuota"){
        saldo = recalcularCuota({saldo, interesMensual, tabla, fechaBase, diaPago});
    } else {
        saldo = recalcularPlazo({saldo, interesMensual, tabla, fechaBase, diaPago});
    }

    /* =========================
       MÉTRICAS (IGUAL)
    ========================= */

    let interesRestanteNuevo = 0;

    for(let i=0;i<interesCuotas.length;i++){
        if(!cuotasPagadasEstado[i]){
            interesRestanteNuevo += interesCuotas[i];
        }
    }

    let interesTotalNuevo = interesPagado + interesRestanteNuevo;

    let ahorro = Math.max(0, Math.round(interesTotalOriginal - interesTotalNuevo));
    let ahorroIndividual = Math.max(0, Math.round(interesAntes - interesTotalNuevo));

    let cuotasDespues = 0;

    for(let i=0;i<capitalCuotas.length;i++){
        if(!cuotasPagadasEstado[i] && capitalCuotas[i]+interesCuotas[i]>0){
            cuotasDespues++;
        }
    }

    let cuotasReducidas = Math.max(0, cuotasAntes - cuotasDespues);

    actualizarTexto("interesAhorrado", "$" + dinero(ahorro));

    document.getElementById("interesOriginal").innerText="$"+dinero(interesTotalOriginal);
    document.getElementById("interesConAbono").innerText="$"+dinero(interesTotalNuevo);
    document.getElementById("ahorroTotal").innerText="$"+dinero(ahorro);

    document.getElementById("cuotasReducidas").innerText =
    cuotasReducidas + " cuotas menos (plazo: " + cuotasDespues + ")";

    historialAbonos.push({
        valor: abono,
        fecha: new Date().toLocaleString("es-CO"),
        tipo: tipo,
        ahorro: ahorroIndividual
    });

    alert("Abono aplicado correctamente");

    guardarPrestamo();
    actualizarEstado();
    renderHistorial();
}

function generarFecha(fechaBase, i, diaPago){
    const fecha = new Date(fechaBase);
    fecha.setMonth(fecha.getMonth()+(i+1));
    fecha.setDate(diaPago);
    return fecha.toLocaleDateString("es-CO");
}

function renderFilaPagada(tabla, i, fechaTexto){
    tabla.innerHTML+=`<tr class="fila-pagada">
    <td>${i+1}</td><td>${fechaTexto}</td>
    <td>$${dinero(capitalCuotas[i]+interesCuotas[i])}</td>
    <td>$${dinero(interesCuotas[i])}</td>
    <td>$${dinero(capitalCuotas[i])}</td>
    <td>$0</td><td>Pagado</td><td>✔</td></tr>`;
}

function renderFilaCancelada(tabla, i, fechaTexto){
    tabla.innerHTML+=`<tr class="fila-cancelada">
    <td>${i+1}</td><td>${fechaTexto}</td>
    <td>$0</td><td>$0</td><td>$0</td>
    <td>$0</td><td>Cancelada</td><td>-</td></tr>`;
}

function renderFilaPendiente(tabla, i, fechaTexto, capital, interesMes, saldo){
    tabla.innerHTML+=`<tr id="fila${i+1}">
    <td>${i+1}</td><td>${fechaTexto}</td>
    <td>$${dinero(Math.round(capital+interesMes))}</td>
    <td>$${dinero(Math.round(interesMes))}</td>
    <td>$${dinero(Math.round(capital))}</td>
    <td>$${dinero(Math.round(saldo))}</td>
    <td>Pendiente</td>
    <td><button onclick="pagarCuota(${i+1},this)">Pagar</button></td>
    </tr>`;
}