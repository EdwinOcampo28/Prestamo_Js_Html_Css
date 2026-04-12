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

    /* =========================
       RECÁLCULO
    ========================= */

    if(tipo==="cuota"){

        // 🔥 CORREGIDO: calcular cuotas reales pendientes
        let cuotasRestantes = 0;
        for(let i=0;i<cuotasTotales;i++){
            if(!cuotasPagadasEstado[i]){
                cuotasRestantes++;
            }
        }

        if(cuotasRestantes <= 0) return;

        let nuevaCuota;

        if(interesMensual === 0){
            nuevaCuota = saldo / cuotasRestantes;
        }else{
            nuevaCuota = saldo *
            (interesMensual*Math.pow(1+interesMensual,cuotasRestantes)) /
            (Math.pow(1+interesMensual,cuotasRestantes)-1);
        }

        for(let i=0;i<cuotasTotales;i++){

            const fecha = new Date(fechaBase);
            fecha.setMonth(fecha.getMonth()+(i+1));
            fecha.setDate(parseInt(document.getElementById("diaPago")?.value));

            const fechaTexto = fecha.toLocaleDateString("es-CO");

            if(cuotasPagadasEstado[i]){
                tabla.innerHTML+=`<tr class="fila-pagada">
                <td>${i+1}</td><td>${fechaTexto}</td>
                <td>$${dinero(capitalCuotas[i]+interesCuotas[i])}</td>
                <td>$${dinero(interesCuotas[i])}</td>
                <td>$${dinero(capitalCuotas[i])}</td>
                <td>$0</td><td>Pagado</td><td>✔</td></tr>`;
                continue;
            }

            if(saldo <= 0){
                tabla.innerHTML+=`<tr class="fila-cancelada">
                <td>${i+1}</td><td>${fechaTexto}</td>
                <td>$0</td><td>$0</td><td>$0</td>
                <td>$0</td><td>Cancelada</td><td>-</td></tr>`;
                continue;
            }

            const interesMes = saldo * interesMensual;
            let capital = nuevaCuota - interesMes;

            // 🔥 ajuste de precisión (clave)
            if(capital > saldo || i === cuotasTotales-1){
                capital = saldo;
            }

            saldo -= capital;
            saldo = Math.max(0,saldo);

            interesCuotas[i] = interesMes;
            capitalCuotas[i] = capital;

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

    } else {

        // 🔥 TU BLOQUE DE PLAZO ORIGINAL (SIN TOCAR)
        for(let i=0;i<cuotasTotales;i++){

            const fecha = new Date(fechaBase);
            fecha.setMonth(fecha.getMonth()+(i+1));
            fecha.setDate(parseInt(document.getElementById("diaPago")?.value));

            const fechaTexto = fecha.toLocaleDateString("es-CO");

            if(cuotasPagadasEstado[i]){
                tabla.innerHTML+=`<tr class="fila-pagada">
                <td>${i+1}</td><td>${fechaTexto}</td>
                <td>$${dinero(capitalCuotas[i]+interesCuotas[i])}</td>
                <td>$${dinero(interesCuotas[i])}</td>
                <td>$${dinero(capitalCuotas[i])}</td>
                <td>$0</td><td>Pagada</td><td>✔</td></tr>`;
                continue;
            }

            if(saldo <= 0){
                tabla.innerHTML+=`<tr class="fila-cancelada">
                <td>${i+1}</td><td>${fechaTexto}</td>
                <td>$0</td><td>$0</td><td>$0</td>
                <td>$0</td><td>Cancelada</td><td>-</td></tr>`;
                continue;
            }

            const interesMes = saldo * interesMensual;
            let capital = capitalCuotas[i];

            if(capital > saldo) capital = saldo;

            saldo -= capital;
            saldo = Math.max(0,saldo);

            interesCuotas[i] = interesMes;

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
    }

    /* =========================
       MÉTRICAS FINALES (IGUAL)
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